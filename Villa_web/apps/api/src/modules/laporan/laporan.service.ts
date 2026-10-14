import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { StatusPembayaran } from '@kost/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { toNumber } from '../../common/utils/money';
import type { LaporanQueryDto } from './dto/laporan.dto';

export interface RekapPeriode {
  periode: string;
  total_tagihan: number;
  total_lunas: number;
  total_belum_bayar: number;
  jumlah_pembayaran: number;
  total_pemasukan: number;
}

/**
 * Laporan pemasukan (F-27 — FR-34, FR-35).
 *
 * Sumber kebenaran adalah `pembayaran` berstatus `DIKONFIRMASI` — bukan
 * `tagihan`, karena hanya pembayaran terkonfirmasi yang benar-benar menjadi
 * pemasukan riil.
 */
@Injectable()
export class LaporanService {
  private readonly logger = new Logger(LaporanService.name);

  constructor(private readonly prisma: PrismaService) {}

  private buildRange(query: LaporanQueryDto) {
    const dari = new Date(`${query.dari}T00:00:00+08:00`);
    const sampai = new Date(`${query.sampai}T23:59:59.999+08:00`);
    if (Number.isNaN(dari.getTime()) || Number.isNaN(sampai.getTime())) {
      throw new BadRequestException('Rentang tanggal tidak valid.');
    }
    if (dari > sampai) {
      throw new BadRequestException('Tanggal `dari` tidak boleh melewati `sampai`.');
    }
    return { dari, sampai };
  }

  /** Rekap per periode dalam rentang tanggal (FR-34). */
  async rekap(query: LaporanQueryDto) {
    const { dari, sampai } = this.buildRange(query);

    const [tagihan, pembayaran] = await this.prisma.$transaction([
      this.prisma.tagihan.findMany({
        where: { deleted_at: null, jatuh_tempo: { gte: dari, lte: sampai } },
        select: { periode: true, jumlah: true, status: true },
      }),
      this.prisma.pembayaran.findMany({
        where: {
          deleted_at: null,
          status: StatusPembayaran.DIKONFIRMASI,
          created_at: { gte: dari, lte: sampai },
        },
        select: { jumlah_bayar: true, tagihan: { select: { periode: true } } },
      }),
    ]);

    const perPeriode = new Map<string, RekapPeriode>();

    const entryUntuk = (periode: string): RekapPeriode => {
      let entry = perPeriode.get(periode);
      if (!entry) {
        entry = {
          periode,
          total_tagihan: 0,
          total_lunas: 0,
          total_belum_bayar: 0,
          jumlah_pembayaran: 0,
          total_pemasukan: 0,
        };
        perPeriode.set(periode, entry);
      }
      return entry;
    };

    for (const t of tagihan) {
      const entry = entryUntuk(t.periode);
      entry.total_tagihan += toNumber(t.jumlah as never);
      if (t.status === 'LUNAS') entry.total_lunas += toNumber(t.jumlah as never);
      else entry.total_belum_bayar += toNumber(t.jumlah as never);
    }

    for (const p of pembayaran) {
      const entry = entryUntuk(p.tagihan?.periode ?? 'lainnya');
      entry.jumlah_pembayaran += 1;
      entry.total_pemasukan += toNumber(p.jumlah_bayar as never);
    }

    const rows = [...perPeriode.values()].sort((a, b) => a.periode.localeCompare(b.periode));

    return {
      dari: query.dari,
      sampai: query.sampai,
      data: rows,
      total_pemasukan: rows.reduce((sum, r) => sum + r.total_pemasukan, 0),
      total_pembayaran: rows.reduce((sum, r) => sum + r.jumlah_pembayaran, 0),
    };
  }

  /** Baris detail untuk diekspor CSV (FR-35). */
  async detail(query: LaporanQueryDto) {
    const { dari, sampai } = this.buildRange(query);

    const pembayaran = await this.prisma.pembayaran.findMany({
      where: {
        deleted_at: null,
        status: StatusPembayaran.DIKONFIRMASI,
        created_at: { gte: dari, lte: sampai },
      },
      orderBy: { created_at: 'asc' },
      include: {
        pengguna: { select: { nama_lengkap: true, username: true } },
        tagihan: { select: { periode: true } },
        confirmedBy: { select: { nama_lengkap: true } },
      },
    });

    return pembayaran.map((p) => ({
      tanggal_konfirmasi: p.updated_at,
      periode: p.tagihan?.periode ?? '-',
      penghuni: p.pengguna?.nama_lengkap ?? '-',
      username: p.pengguna?.username ?? '-',
      metode: p.metode,
      nominal: toNumber(p.jumlah_bayar as never),
      dikonfirmasi_oleh: p.confirmedBy?.nama_lengkap ?? '-',
    }));
  }

  /** Susun CSV dari baris detail. BOM UTF-8 agar Excel membaca karakter Asia dengan benar. */
  async csv(query: LaporanQueryDto): Promise<string> {
    const baris = await this.detail(query);
    const header = [
      'tanggal_konfirmasi',
      'periode',
      'penghuni',
      'username',
      'metode',
      'nominal',
      'dikonfirmasi_oleh',
    ];

    const isi = baris.map((b) => [
      b.tanggal_konfirmasi.toISOString(),
      b.periode,
      b.penghuni,
      b.username,
      b.metode,
      String(b.nominal),
      b.dikonfirmasi_oleh,
    ]);

    this.logger.log(`Export CSV laporan ${query.dari} s/d ${query.sampai}: ${isi.length} baris`);

    return [header, ...isi]
      .map((kolom) => kolom.map((nilai) => this.escapeCsv(String(nilai))).join(','))
      .join('\r\n');
  }

  private escapeCsv(value: string): string {
    if (/[",\r\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
