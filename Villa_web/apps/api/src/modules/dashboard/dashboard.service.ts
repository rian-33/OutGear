import { Injectable, NotFoundException } from '@nestjs/common';
import {
  MetodeBayar,
  StatusKamar,
  StatusPembayaran,
  StatusPengajuan,
  StatusTagihan,
} from '@kost/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { toNumber } from '../../common/utils/money';
import { periodeSekarang } from '../../common/utils/periode';

export interface DashboardAdmin {
  total_penghuni: number;
  total_kamar: number;
  kamar_kosong: number;
  kamar_terisi: number;
  kamar_maintenance: number;
  kamar_tersedia: number;
  tagihan_bulan_ini: {
    total: number;
    lunas: number;
    belum_bayar: number;
    pending: number;
    overdue: number;
  };
  pemasukan_bulan_ini: number;
  menunggu_konfirmasi: number;
  pengajuan_pending: number;
  kurva_tagihan: { periode: string; total: number; lunas: number }[];
}

export interface DashboardPenghuni {
  profil: {
    nama_lengkap: string;
    username: string;
    email: string;
  };
  kamar: { id_kamar: string; no_kamar: string; harga: number; status: StatusKamar } | null;
  masa_sewa: { tgl_masuk: Date; jatuh_tempo: Date; aktif: boolean } | null;
  tagihan_aktif: {
    id_tagihan: string;
    periode: string;
    jumlah: number;
    jatuh_tempo: Date;
    status: StatusTagihan;
    catatan: string | null;
  } | null;
  ringkasan: {
    total_tagihan: number;
    lunas: number;
    belum_bayar: number;
    overdue: number;
    total_pembayaran: number;
  };
  riwayat_terbaru: {
    id_pembayaran: string;
    jumlah_bayar: number;
    metode: MetodeBayar;
    status: StatusPembayaran;
    periode: string;
    created_at: Date;
  }[];
  pengajuan_terakhir: {
    id_pengajuan: string;
    kamar_baru: string | null;
    status: StatusPengajuan;
    catatan_admin: string | null;
    created_at: Date;
  } | null;
}

/** Modul dashboard (F-25, F-26 — FR-32, FR-33). */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /** Statistik untuk admin (FR-32). */
  async admin(): Promise<DashboardAdmin> {
    const periode = periodeSekarang();
    const whereAktif = { deleted_at: null } as const;

    const [
      totalPenghuni,
      totalKamar,
      kamarKosong,
      kamarTerisi,
      kamarMaintenance,
      totalTagihan,
      lunas,
      belumBayar,
      pending,
      overdue,
      menungguKonfirmasi,
      pengajuanPending,
      pemasukan,
    ] = await this.prisma.$transaction([
      this.prisma.pengguna.count({ where: { ...whereAktif, role: 'PENGHUNI' } }),
      this.prisma.kamar.count({ where: whereAktif }),
      this.prisma.kamar.count({ where: { ...whereAktif, status: StatusKamar.KOSONG } }),
      this.prisma.kamar.count({ where: { ...whereAktif, status: StatusKamar.TERISI } }),
      this.prisma.kamar.count({ where: { ...whereAktif, status: StatusKamar.MAINTENANCE } }),
      this.prisma.tagihan.count({ where: { ...whereAktif, periode } }),
      this.prisma.tagihan.count({ where: { ...whereAktif, periode, status: StatusTagihan.LUNAS } }),
      this.prisma.tagihan.count({
        where: { ...whereAktif, periode, status: StatusTagihan.BELUM_BAYAR },
      }),
      this.prisma.tagihan.count({
        where: { ...whereAktif, periode, status: StatusTagihan.PENDING },
      }),
      this.prisma.tagihan.count({
        where: { ...whereAktif, periode, status: StatusTagihan.OVERDUE },
      }),
      this.prisma.pembayaran.count({
        where: { ...whereAktif, status: StatusPembayaran.MENUNGGU_KONFIRMASI },
      }),
      this.prisma.pengajuanPindah.count({
        where: { ...whereAktif, status: StatusPengajuan.PENDING },
      }),
      this.prisma.pembayaran.aggregate({
        where: { ...whereAktif, status: StatusPembayaran.DIKONFIRMASI, tagihan: { periode } },
        _sum: { jumlah_bayar: true },
      }),
    ]);

    const kurva = await this.prisma.tagihan.groupBy({
      by: ['periode', 'status'],
      where: { ...whereAktif },
      _count: { _all: true },
      orderBy: { periode: 'asc' },
      take: 60,
    });

    const perPeriode = new Map<string, { total: number; lunas: number }>();
    for (const baris of kurva) {
      const entry = perPeriode.get(baris.periode) ?? { total: 0, lunas: 0 };
      entry.total += baris._count._all;
      if (baris.status === StatusTagihan.LUNAS) entry.lunas += baris._count._all;
      perPeriode.set(baris.periode, entry);
    }

    return {
      total_penghuni: totalPenghuni,
      total_kamar: totalKamar,
      kamar_kosong: kamarKosong,
      kamar_terisi: kamarTerisi,
      kamar_maintenance: kamarMaintenance,
      kamar_tersedia: kamarKosong,
      tagihan_bulan_ini: { total: totalTagihan, lunas, belum_bayar: belumBayar, pending, overdue },
      pemasukan_bulan_ini: toNumber(pemasukan._sum.jumlah_bayar as never),
      menunggu_konfirmasi: menungguKonfirmasi,
      pengajuan_pending: pengajuanPending,
      kurva_tagihan: [...perPeriode.entries()].map(([periodeData, nilai]) => ({
        periode: periodeData,
        ...nilai,
      })),
    };
  }

  /** Ringkasan untuk penghuni (FR-33). */
  async penghuni(idUser: string): Promise<DashboardPenghuni> {
    const pengguna = await this.prisma.pengguna.findFirst({
      where: { id_user: idUser, deleted_at: null },
      select: {
        nama_lengkap: true,
        username: true,
        email: true,
        detailKos: {
          where: { aktif: true, deleted_at: null },
          include: { kamar: true },
        },
      },
    });
    if (!pengguna) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    const detail = pengguna.detailKos;

    const [tagihanAktif, totalTagihan, lunas, belumBayar, overdue, pembayaran, riwayat, pengajuan] =
      await this.prisma.$transaction([
        this.prisma.tagihan.findFirst({
          where: {
            id_user: idUser,
            deleted_at: null,
            status: {
              in: [StatusTagihan.BELUM_BAYAR, StatusTagihan.PENDING, StatusTagihan.OVERDUE],
            },
          },
          orderBy: { jatuh_tempo: 'asc' },
        }),
        this.prisma.tagihan.count({ where: { id_user: idUser, deleted_at: null } }),
        this.prisma.tagihan.count({
          where: { id_user: idUser, deleted_at: null, status: StatusTagihan.LUNAS },
        }),
        this.prisma.tagihan.count({
          where: { id_user: idUser, deleted_at: null, status: StatusTagihan.BELUM_BAYAR },
        }),
        this.prisma.tagihan.count({
          where: { id_user: idUser, deleted_at: null, status: StatusTagihan.OVERDUE },
        }),
        this.prisma.pembayaran.aggregate({
          where: { id_user: idUser, deleted_at: null, status: StatusPembayaran.DIKONFIRMASI },
          _sum: { jumlah_bayar: true },
        }),
        this.prisma.pembayaran.findMany({
          where: { id_user: idUser, deleted_at: null },
          orderBy: { created_at: 'desc' },
          take: 5,
          include: { tagihan: { select: { periode: true } } },
        }),
        this.prisma.pengajuanPindah.findFirst({
          where: { id_user: idUser, deleted_at: null },
          orderBy: { created_at: 'desc' },
          include: { kamarBaru: { select: { no_kamar: true } } },
        }),
      ]);

    return {
      profil: {
        nama_lengkap: pengguna.nama_lengkap,
        username: pengguna.username,
        email: pengguna.email,
      },
      kamar: detail
        ? {
            id_kamar: detail.kamar.id_kamar,
            no_kamar: detail.kamar.no_kamar,
            harga: toNumber(detail.kamar.harga as never),
            status: detail.kamar.status,
          }
        : null,
      masa_sewa: detail
        ? { tgl_masuk: detail.tgl_masuk, jatuh_tempo: detail.jatuh_tempo, aktif: detail.aktif }
        : null,
      tagihan_aktif: tagihanAktif
        ? {
            id_tagihan: tagihanAktif.id_tagihan,
            periode: tagihanAktif.periode,
            jumlah: toNumber(tagihanAktif.jumlah as never),
            jatuh_tempo: tagihanAktif.jatuh_tempo,
            status: tagihanAktif.status,
            catatan: tagihanAktif.catatan,
          }
        : null,
      ringkasan: {
        total_tagihan: totalTagihan,
        lunas,
        belum_bayar: belumBayar,
        overdue,
        total_pembayaran: toNumber(pembayaran._sum.jumlah_bayar as never),
      },
      riwayat_terbaru: riwayat.map((p) => ({
        id_pembayaran: p.id_pembayaran,
        jumlah_bayar: toNumber(p.jumlah_bayar as never),
        metode: p.metode,
        status: p.status,
        periode: p.tagihan?.periode ?? '-',
        created_at: p.created_at,
      })),
      pengajuan_terakhir: pengajuan
        ? {
            id_pengajuan: pengajuan.id_pengajuan,
            kamar_baru: pengajuan.kamarBaru?.no_kamar ?? null,
            status: pengajuan.status,
            catatan_admin: pengajuan.catatan_admin,
            created_at: pengajuan.created_at,
          }
        : null,
    };
  }
}
