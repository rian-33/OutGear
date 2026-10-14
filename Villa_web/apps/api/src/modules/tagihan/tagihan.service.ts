import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { StatusTagihan } from '@kost/types';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { toNumber } from '../../common/utils/money';
import { jatuhTempoPeriode, periodeSekarang } from '../../common/utils/periode';
import type { CreateTagihanManualDto, QueryTagihanDto } from './dto/tagihan.dto';

export interface TagihanView {
  id_tagihan: string;
  id_user: string;
  periode: string;
  jumlah: number;
  jatuh_tempo: Date;
  status: StatusTagihan;
  catatan: string | null;
  penghuni: { id_user: string; nama_lengkap: string; username: string } | null;
  kamar: { id_kamar: string; no_kamar: string } | null;
  pembayaran: {
    id_pembayaran: string;
    jumlah_bayar: number;
    status: string;
    bukti_bayar: string | null;
  }[];
  created_at: Date;
}

/**
 * Modul tagihan (F-13 s/d F-16 — FR-16 s/d FR-21).
 *
 * - `generateBulanan` dijalankan cron tiap tanggal 1 dan bersifat idempotent
 *   karena `tagihan` memiliki unique constraint `[id_user, periode]` (FR-16).
 * - `tandaiOverdue` dijalankan cron harian (FR-20).
 */
@Injectable()
export class TagihanService {
  private readonly logger = new Logger(TagihanService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate tagihan bulanan untuk seluruh penghuni aktif (FR-16).
   *
   * Bersifat idempotent karena batasan `@@unique([id_user, periode])` pada
   * tabel `tagihan`. Pemanggilan ulang pada periode yang sama akan melewati
   * tagihan yang sudah ada, bukan membuat duplikat.
   */
  @Cron('0 0 1 * *', { timeZone: 'Asia/Makassar', name: 'tagihan.generateBulanan' })
  async generateBulanan(
    periode: string = periodeSekarang()
  ): Promise<{ dibuat: number; dilewati: number }> {
    const penghuniAktif = await this.prisma.detailKos.findMany({
      where: { aktif: true, deleted_at: null, pengguna: { deleted_at: null, role: 'PENGHUNI' } },
      include: { kamar: true, pengguna: { select: { id_user: true } } },
    });

    let dibuat = 0;
    let dilewati = 0;

    for (const detail of penghuniAktif) {
      const sudahAda = await this.prisma.tagihan.findFirst({
        where: { id_user: detail.id_user, periode, deleted_at: null },
        select: { id_tagihan: true },
      });
      if (sudahAda) {
        dilewati += 1;
        continue;
      }

      try {
        await this.prisma.tagihan.create({
          data: {
            id_user: detail.id_user,
            id_kamar: detail.id_kamar,
            periode,
            // Nominal adalah snapshot harga kamar saat tagihan terbit (FR-08).
            jumlah: detail.kamar.harga,
            jatuh_tempo: jatuhTempoPeriode(periode),
            status: StatusTagihan.BELUM_BAYAR,
          },
        });
        dibuat += 1;
      } catch (error) {
        // Unique constraint terpicu bila cron berjalan paralel — abaikan.
        if (this.isUniqueViolation(error)) {
          dilewati += 1;
          continue;
        }
        throw error;
      }
    }

    this.logger.log(`Generate tagihan periode ${periode}: ${dibuat} dibuat, ${dilewati} dilewati.`);
    return { dibuat, dilewati };
  }

  /** Tandai tagihan yang lewat jatuh tempo menjadi `OVERDUE` (FR-20). */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Makassar',
    name: 'tagihan.tandaiOverdue',
  })
  async tandaiOverdue(now: Date = new Date()): Promise<number> {
    const hasil = await this.prisma.tagihan.updateMany({
      where: {
        deleted_at: null,
        status: StatusTagihan.BELUM_BAYAR,
        jatuh_tempo: { lt: now },
      },
      data: { status: StatusTagihan.OVERDUE },
    });
    if (hasil.count > 0) {
      this.logger.log(`${hasil.count} tagihan ditandai OVERDUE.`);
    }
    return hasil.count;
  }

  /** Generate tagihan manual untuk satu penghuni (FR-17) — misalnya denda. */
  async createManual(dto: CreateTagihanManualDto): Promise<TagihanView> {
    const detail = await this.prisma.detailKos.findFirst({
      where: {
        id_user: dto.id_user,
        aktif: true,
        deleted_at: null,
        pengguna: { deleted_at: null },
      },
      include: { kamar: true },
    });
    if (!detail) {
      throw new BadRequestException(
        'Penghuni belum menempati kamar aktif sehingga tagihan tidak bisa dibuat.'
      );
    }

    const periode = dto.periode ?? periodeSekarang();
    const bentrok = await this.prisma.tagihan.findFirst({
      where: { id_user: dto.id_user, periode, deleted_at: null },
      select: { id_tagihan: true },
    });
    if (bentrok) {
      throw new ConflictException(`Penghuni sudah memiliki tagihan untuk periode ${periode}.`);
    }

    const tagihan = await this.prisma.tagihan.create({
      data: {
        id_user: dto.id_user,
        id_kamar: detail.id_kamar,
        periode,
        jumlah: dto.jumlah ?? detail.kamar.harga,
        jatuh_tempo: dto.jatuh_tempo
          ? new Date(`${dto.jatuh_tempo}T00:00:00+08:00`)
          : jatuhTempoPeriode(periode),
        status: StatusTagihan.BELUM_BAYAR,
        catatan: dto.catatan ?? null,
      },
    });

    this.logger.log(`Tagihan manual dibuat untuk ${dto.id_user} periode ${periode}`);
    return this.findOne(tagihan.id_tagihan);
  }

  /** List tagihan — admin (semua) atau penghuni (miliknya sendiri). */
  async findAll(query: QueryTagihanDto, idUser?: string, role?: string) {
    const where = this.buildWhere(query, role === 'PENGHUNI' ? idUser : query.id_user);

    const [total, data] = await this.prisma.$transaction([
      this.prisma.tagihan.count({ where }),
      this.prisma.tagihan.findMany({
        where,
        orderBy: [{ jatuh_tempo: 'desc' }],
        skip: query.skip,
        take: query.take,
        include: {
          pengguna: { select: { id_user: true, nama_lengkap: true, username: true } },
          kamar: { select: { id_kamar: true, no_kamar: true } },
          pembayaran: {
            where: { deleted_at: null },
            orderBy: { created_at: 'desc' },
            select: {
              id_pembayaran: true,
              jumlah_bayar: true,
              status: true,
              bukti_bayar: true,
            },
          },
        },
      }),
    ]);

    return {
      data: data.map((t) => this.toView(t)),
      meta: {
        page: query.page,
        perPage: query.perPage,
        total,
        totalPage: Math.ceil(total / query.perPage),
      },
    };
  }

  /**
   * Detail satu tagihan (FR-19).
   *
   * Penghuni hanya boleh melihat tagihannya sendiri — pengecekan kepemilikan
   * dilakukan di sini (service layer), bukan hanya di routing (PRD-4 §3).
   */
  async findOne(
    idTagihan: string,
    pemohon?: { id_user: string; role: string }
  ): Promise<TagihanView> {
    const tagihan = await this.prisma.tagihan.findFirst({
      where: { id_tagihan: idTagihan, deleted_at: null },
      include: {
        pengguna: { select: { id_user: true, nama_lengkap: true, username: true } },
        kamar: { select: { id_kamar: true, no_kamar: true } },
        pembayaran: {
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
          select: {
            id_pembayaran: true,
            jumlah_bayar: true,
            status: true,
            bukti_bayar: true,
          },
        },
      },
    });
    if (!tagihan) throw new NotFoundException('Tagihan tidak ditemukan.');

    if (pemohon && pemohon.role === 'PENGHUNI' && tagihan.id_user !== pemohon.id_user) {
      // 404 (bukan 403) agar keberadaan tagihan milik orang lain tidak terungkap.
      throw new NotFoundException('Tagihan tidak ditemukan.');
    }

    return this.toView(tagihan);
  }

  /** Soft delete tagihan — ditolak bila sudah ada pembayaran (FR-21). */
  async remove(idTagihan: string): Promise<{ id_tagihan: string }> {
    const tagihan = await this.prisma.tagihan.findFirst({
      where: { id_tagihan: idTagihan, deleted_at: null },
      select: { id_tagihan: true, status: true },
    });
    if (!tagihan) throw new NotFoundException('Tagihan tidak ditemukan.');

    const jumlahPembayaran = await this.prisma.pembayaran.count({
      where: { id_tagihan: idTagihan, deleted_at: null },
    });
    if (jumlahPembayaran > 0) {
      throw new BadRequestException('Tagihan yang sudah memiliki pembayaran tidak dapat dihapus.');
    }

    await this.prisma.tagihan.update({
      where: { id_tagihan: idTagihan },
      data: { deleted_at: new Date() },
    });
    return { id_tagihan: idTagihan };
  }

  private buildWhere(query: QueryTagihanDto, idUser: string | undefined) {
    const where: Record<string, unknown> = { deleted_at: null };

    if (idUser) where.id_user = idUser;
    if (query.status) where.status = query.status;
    if (query.periode) where.periode = query.periode;

    if (query.dari || query.sampai) {
      where.jatuh_tempo = {
        ...(query.dari ? { gte: new Date(query.dari) } : {}),
        ...(query.sampai ? { lte: new Date(query.sampai) } : {}),
      };
    }
    return where;
  }

  private toView(tagihan: {
    id_tagihan: string;
    id_user: string;
    periode: string;
    jumlah: unknown;
    jatuh_tempo: Date;
    status: StatusTagihan;
    catatan: string | null;
    created_at: Date;
    pengguna?: { id_user: string; nama_lengkap: string; username: string } | null;
    kamar?: { id_kamar: string; no_kamar: string } | null;
    pembayaran?: {
      id_pembayaran: string;
      jumlah_bayar: unknown;
      status: string;
      bukti_bayar: string | null;
    }[];
  }): TagihanView {
    return {
      id_tagihan: tagihan.id_tagihan,
      id_user: tagihan.id_user,
      periode: tagihan.periode,
      jumlah: toNumber(tagihan.jumlah as never),
      jatuh_tempo: tagihan.jatuh_tempo,
      status: tagihan.status,
      catatan: tagihan.catatan,
      penghuni: tagihan.pengguna ?? null,
      kamar: tagihan.kamar ?? null,
      pembayaran: (tagihan.pembayaran ?? []).map((p) => ({
        id_pembayaran: p.id_pembayaran,
        jumlah_bayar: toNumber(p.jumlah_bayar as never),
        status: p.status,
        bukti_bayar: p.bukti_bayar,
      })),
      created_at: tagihan.created_at,
    };
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    );
  }
}
