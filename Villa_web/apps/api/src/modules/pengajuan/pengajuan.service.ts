import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { StatusKamar, StatusPengajuan } from '@kost/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import type {
  CreatePengajuanDto,
  QueryPengajuanDto,
  SetujuiPengajuanDto,
  TolakPengajuanDto,
} from './dto/pengajuan.dto';

export interface PengajuanView {
  id_pengajuan: string;
  id_user: string;
  kamar_lama: { id_kamar: string; no_kamar: string } | null;
  kamar_baru: { id_kamar: string; no_kamar: string } | null;
  status: StatusPengajuan;
  alasan: string | null;
  catatan_admin: string | null;
  tgl_respons: Date | null;
  penghuni: { id_user: string; nama_lengkap: string; username: string } | null;
  created_at: Date;
}

/**
 * Modul pengajuan pindah kamar (F-22 s/d F-24 — FR-28 s/d FR-31).
 *
 * Persetujuan dilakukan dalam satu `$transaction` karena menyentuh tiga tabel
 * (`detail_kos`, `kamar` lama, `kamar` baru) — PRD-4 §4.
 */
@Injectable()
export class PengajuanService {
  private readonly logger = new Logger(PengajuanService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Penghuni mengajukan pindah kamar (FR-28). */
  async create(idUser: string, dto: CreatePengajuanDto): Promise<PengajuanView> {
    const detail = await this.prisma.detailKos.findFirst({
      where: { id_user: idUser, aktif: true, deleted_at: null },
      select: { id_kamar: true },
    });
    if (!detail) {
      throw new BadRequestException('Anda belum menempati kamar aktif.');
    }
    if (detail.id_kamar === dto.id_kamar_baru) {
      throw new BadRequestException('Kamar tujuan sama dengan kamar yang sedang ditempati.');
    }

    const pending = await this.prisma.pengajuanPindah.findFirst({
      where: { id_user: idUser, status: StatusPengajuan.PENDING, deleted_at: null },
      select: { id_pengajuan: true },
    });
    if (pending) {
      throw new ConflictException('Anda sudah memiliki pengajuan yang sedang diproses.');
    }

    const tujuan = await this.prisma.kamar.findFirst({
      where: { id_kamar: dto.id_kamar_baru, deleted_at: null },
      select: { id_kamar: true, status: true },
    });
    if (!tujuan) throw new NotFoundException('Kamar tujuan tidak ditemukan.');
    if (tujuan.status !== StatusKamar.KOSONG) {
      throw new BadRequestException('Kamar tujuan tidak tersedia. Pilih kamar berstatus Kosong.');
    }

    const pengajuan = await this.prisma.pengajuanPindah.create({
      data: {
        id_user: idUser,
        kamar_lama: detail.id_kamar,
        kamar_baru: dto.id_kamar_baru,
        alasan: dto.alasan ?? null,
        status: StatusPengajuan.PENDING,
      },
    });

    this.logger.log(`Pengajuan pindah kamar dibuat oleh ${idUser}`);
    return this.findOne(pengajuan.id_pengajuan, { id_user: idUser, role: 'PENGHUNI' });
  }

  async findAll(query: QueryPengajuanDto, pemohon?: { id_user: string; role: string }) {
    const where: Record<string, unknown> = { deleted_at: null };
    if (query.status) where.status = query.status;
    if (pemohon?.role === 'PENGHUNI') where.id_user = pemohon.id_user;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.pengajuanPindah.count({ where }),
      this.prisma.pengajuanPindah.findMany({
        where,
        orderBy: [{ created_at: 'desc' }],
        skip: query.skip,
        take: query.take,
        include: this.detailInclude(),
      }),
    ]);

    return {
      data: data.map((p) => this.toView(p)),
      meta: {
        page: query.page,
        perPage: query.perPage,
        total,
        totalPage: Math.ceil(total / query.perPage),
      },
    };
  }

  async findOne(id: string, pemohon?: { id_user: string; role: string }): Promise<PengajuanView> {
    const pengajuan = await this.prisma.pengajuanPindah.findFirst({
      where: { id_pengajuan: id, deleted_at: null },
      include: this.detailInclude(),
    });
    if (!pengajuan) throw new NotFoundException('Pengajuan tidak ditemukan.');

    if (pemohon && pemohon.role === 'PENGHUNI' && pengajuan.id_user !== pemohon.id_user) {
      throw new NotFoundException('Pengajuan tidak ditemukan.');
    }
    return this.toView(pengajuan);
  }

  /**
   * Setujui pengajuan (FR-30): dalam satu transaksi —
   * detail_kos → kamar baru, kamar lama → KOSONG, kamar baru → TERISI,
   * pengajuan → DISETUJUI.
   */
  async setujui(id: string, dto: SetujuiPengajuanDto): Promise<PengajuanView> {
    const pengajuan = await this.prisma.pengajuanPindah.findFirst({
      where: { id_pengajuan: id, deleted_at: null },
      select: {
        id_pengajuan: true,
        status: true,
        kamar_lama: true,
        kamar_baru: true,
        id_user: true,
      },
    });
    if (!pengajuan) throw new NotFoundException('Pengajuan tidak ditemukan.');
    if (pengajuan.status !== StatusPengajuan.PENDING) {
      throw new BadRequestException('Pengajuan ini sudah diproses sebelumnya.');
    }

    await this.prisma.$transaction(async (tx) => {
      const detail = await tx.detailKos.findFirst({
        where: { id_user: pengajuan.id_user, aktif: true, deleted_at: null },
        select: { id_kamar: true },
      });
      if (!detail) {
        throw new BadRequestException('Penghuni sudah tidak menempati kamar aktif.');
      }

      const tujuan = await tx.kamar.findFirst({
        where: { id_kamar: pengajuan.kamar_baru, deleted_at: null },
        select: { id_kamar: true, status: true },
      });
      if (!tujuan) throw new NotFoundException('Kamar tujuan tidak ditemukan.');
      if (tujuan.status !== StatusKamar.KOSONG) {
        throw new ConflictException(
          'Kamar tujuan sudah terisi. Tolak pengajuan ini dan minta penghuni memilih kamar lain.'
        );
      }

      const kamarLama = detail.id_kamar ?? pengajuan.kamar_lama;
      if (kamarLama && kamarLama !== pengajuan.kamar_baru) {
        await tx.kamar.update({
          where: { id_kamar: kamarLama },
          data: { status: StatusKamar.KOSONG },
        });
      }

      await tx.detailKos.updateMany({
        where: { id_user: pengajuan.id_user, aktif: true },
        data: { id_kamar: pengajuan.kamar_baru },
      });

      await tx.kamar.update({
        where: { id_kamar: pengajuan.kamar_baru },
        data: { status: StatusKamar.TERISI },
      });

      await tx.pengajuanPindah.update({
        where: { id_pengajuan: pengajuan.id_pengajuan },
        data: {
          status: StatusPengajuan.DISETUJUI,
          catatan_admin: dto.catatan_admin ?? null,
          tgl_respons: new Date(),
        },
      });
    });

    this.logger.log(`Pengajuan ${id} disetujui`);
    return this.findOne(id);
  }

  /** Tolak pengajuan (FR-31) — `catatan_admin` wajib, kamar tidak berubah. */
  async tolak(id: string, dto: TolakPengajuanDto): Promise<PengajuanView> {
    const pengajuan = await this.prisma.pengajuanPindah.findFirst({
      where: { id_pengajuan: id, deleted_at: null },
      select: { id_pengajuan: true, status: true },
    });
    if (!pengajuan) throw new NotFoundException('Pengajuan tidak ditemukan.');
    if (pengajuan.status !== StatusPengajuan.PENDING) {
      throw new BadRequestException('Pengajuan ini sudah diproses sebelumnya.');
    }

    await this.prisma.pengajuanPindah.update({
      where: { id_pengajuan: pengajuan.id_pengajuan },
      data: {
        status: StatusPengajuan.DITOLAK,
        catatan_admin: dto.catatan_admin,
        tgl_respons: new Date(),
      },
    });

    this.logger.log(`Pengajuan ${id} ditolak`);
    return this.findOne(id);
  }

  private detailInclude() {
    return {
      pengguna: { select: { id_user: true, nama_lengkap: true, username: true } },
      kamarLama: { select: { id_kamar: true, no_kamar: true } },
      kamarBaru: { select: { id_kamar: true, no_kamar: true } },
    } as const;
  }

  private toView(pengajuan: {
    id_pengajuan: string;
    id_user: string;
    status: StatusPengajuan;
    alasan: string | null;
    catatan_admin: string | null;
    tgl_respons: Date | null;
    created_at: Date;
    pengguna?: { id_user: string; nama_lengkap: string; username: string } | null;
    kamarLama?: { id_kamar: string; no_kamar: string } | null;
    kamarBaru?: { id_kamar: string; no_kamar: string } | null;
  }): PengajuanView {
    return {
      id_pengajuan: pengajuan.id_pengajuan,
      id_user: pengajuan.id_user,
      kamar_lama: pengajuan.kamarLama ?? null,
      kamar_baru: pengajuan.kamarBaru ?? null,
      status: pengajuan.status,
      alasan: pengajuan.alasan,
      catatan_admin: pengajuan.catatan_admin,
      tgl_respons: pengajuan.tgl_respons,
      penghuni: pengajuan.pengguna ?? null,
      created_at: pengajuan.created_at,
    };
  }
}
