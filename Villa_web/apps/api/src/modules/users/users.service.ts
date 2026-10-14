import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Role, StatusKamar } from '@kost/types';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { toNumber } from '../../common/utils/money';
import type {
  AssignKamarDto,
  CreatePenghuniDto,
  UpdatePenghuniDto,
  UpdateProfilDto,
} from './dto/users.dto';
import type { QueryUsersDto } from './dto/query-users.dto';

const BCRYPT_ROUNDS = 10;

/** Masa sewa default bila admin tidak menentukan: 1 tahun dari tanggal masuk. */
const DEFAULT_MASA_SEWA_BULAN = 12;

export interface PenghuniView {
  id_user: string;
  username: string;
  nama_lengkap: string;
  email: string;
  no_hp: string | null;
  role: Role;
  kamar: {
    id_kamar: string;
    no_kamar: string;
    harga: number;
    status: StatusKamar;
  } | null;
  detail: { tgl_masuk: Date; jatuh_tempo: Date; aktif: boolean } | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Manajemen penghuni (F-06 s/d F-10 — FR-11 s/d FR-15).
 *
 * Setiap operasi yang menyentuh lebih dari satu tabel dibungkus `$transaction`
 * (PRD-4 §4): buat penghuni + assign kamar, pindah kamar, dan nonaktifkan
 * penghuni tidak boleh meninggalkan data setengah jadi.
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Akhiri masa inap yang lewat tenggat: nonaktifkan akun dan kosongkan kamar. */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'Asia/Makassar',
    name: 'users.expireStays',
  })
  async expireStays(now: Date = new Date()): Promise<number> {
    const expired = await this.prisma.detailKos.findMany({
      where: {
        aktif: true,
        deleted_at: null,
        jatuh_tempo: { lte: now },
        pengguna: { deleted_at: null, role: Role.PENGHUNI },
      },
      select: { id_user: true, id_kamar: true },
    });

    for (const stay of expired) {
      await this.prisma.$transaction([
        this.prisma.detailKos.updateMany({
          where: { id_user: stay.id_user, aktif: true, deleted_at: null },
          data: { aktif: false, deleted_at: now },
        }),
        this.prisma.kamar.updateMany({
          where: { id_kamar: stay.id_kamar, status: StatusKamar.TERISI },
          data: { status: StatusKamar.KOSONG },
        }),
        this.prisma.pengguna.updateMany({
          where: { id_user: stay.id_user, deleted_at: null, role: Role.PENGHUNI },
          data: { deleted_at: now },
        }),
      ]);
    }

    if (expired.length > 0) {
      this.logger.log(`${expired.length} akun dinonaktifkan setelah masa inap berakhir.`);
    }
    return expired.length;
  }

  /**
   * Buat penghuni baru + langsung assign kamar dalam satu transaksi (FR-11).
   * Bila `id_kamar` tidak diberikan, akun dibuat tanpa kamar dan bisa
   * di-assign kemudian lewat `POST /users/:id/assign-kamar`.
   */
  async create(dto: CreatePenghuniDto): Promise<PenghuniView> {
    const email = dto.email.toLowerCase();
    const bentrok = await this.prisma.pengguna.findFirst({
      where: { deleted_at: null, OR: [{ email }, { username: dto.username }] },
      select: { email: true, username: true },
    });
    if (bentrok) {
      throw new ConflictException(
        bentrok.email === email
          ? 'Email sudah terdaftar.'
          : 'Username sudah digunakan. Silakan pilih username lain.'
      );
    }

    const hashed = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const tglMasuk = dto.tgl_masuk ? this.parseTanggal(dto.tgl_masuk) : new Date();
    const jatuhTempo = this.hitungJatuhTempo(tglMasuk);

    const pengguna = await this.prisma.pengguna.create({
      data: {
        username: dto.username,
        nama_lengkap: dto.nama_lengkap,
        email,
        no_hp: dto.no_hp ?? null,
        password: hashed,
        role: Role.PENGHUNI,
      },
    });

    // Kamar hanya dikunci bila memang diberikan; bila penargetan kamar gagal,
    // akun dibatalkan agar tidak ada penghuni yatim tanpa kamar yang diminta.
    try {
      await this.assignKamarInternal(pengguna.id_user, dto.id_kamar, tglMasuk, jatuhTempo);
    } catch (error) {
      await this.prisma.pengguna.delete({ where: { id_user: pengguna.id_user } });
      throw error;
    }

    this.logger.log(`Penghuni dibuat: ${pengguna.username} (${pengguna.id_user})`);
    return this.findOne(pengguna.id_user);
  }

  async findAll(query: QueryUsersDto) {
    const where: Record<string, unknown> = { deleted_at: null };

    if (query.role) {
      where.role = query.role;
    } else {
      where.role = Role.PENGHUNI;
    }

    if (query.search) {
      where.OR = [
        { nama_lengkap: { contains: query.search, mode: 'insensitive' } },
        { username: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tanpa_kamar) {
      where.detailKos = { is: null };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.pengguna.count({ where }),
      this.prisma.pengguna.findMany({
        where,
        orderBy: [{ nama_lengkap: 'asc' }],
        skip: query.skip,
        take: query.take,
        include: {
          detailKos: {
            where: { aktif: true, deleted_at: null },
            include: { kamar: true },
          },
        },
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

  async findOne(id: string): Promise<PenghuniView> {
    const pengguna = await this.prisma.pengguna.findFirst({
      where: { id_user: id, deleted_at: null },
      include: {
        detailKos: { where: { aktif: true, deleted_at: null }, include: { kamar: true } },
      },
    });
    if (!pengguna) throw new NotFoundException('Pengguna tidak ditemukan.');
    return this.toView(pengguna);
  }

  /** Profil milik pengguna yang sedang login (dipakai halaman `/profil`). */
  async me(idUser: string): Promise<PenghuniView> {
    return this.findOne(idUser);
  }

  async update(id: string, dto: UpdatePenghuniDto): Promise<PenghuniView> {
    const pengguna = await this.findOne(id);

    if (dto.email && dto.email !== pengguna.email) {
      const bentrok = await this.prisma.pengguna.findFirst({
        where: { id_user: { not: id }, deleted_at: null, email: dto.email },
        select: { id_user: true },
      });
      if (bentrok) throw new ConflictException('Email sudah digunakan pengguna lain.');
    }

    const data: Record<string, unknown> = {};
    if (dto.nama_lengkap !== undefined) data.nama_lengkap = dto.nama_lengkap;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.no_hp !== undefined) data.no_hp = dto.no_hp;
    if (dto.password !== undefined) data.password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    if (Object.keys(data).length > 0) {
      await this.prisma.pengguna.update({ where: { id_user: id }, data });
    }

    if (dto.jatuh_tempo !== undefined) {
      await this.prisma.detailKos.updateMany({
        where: { id_user: id, aktif: true, deleted_at: null },
        data: { jatuh_tempo: this.parseTanggal(dto.jatuh_tempo) },
      });
    }

    this.logger.log(`Profil penghuni diperbarui: ${pengguna.username}`);
    return this.findOne(id);
  }

  /** Penghuni memperbarui profilnya sendiri (tanpa menyentuh field sensitif). */
  async updateProfil(idUser: string, dto: UpdateProfilDto): Promise<PenghuniView> {
    const data: Record<string, unknown> = {};
    if (dto.nama_lengkap !== undefined) data.nama_lengkap = dto.nama_lengkap;
    if (dto.no_hp !== undefined) data.no_hp = dto.no_hp;

    if (Object.keys(data).length > 0) {
      await this.prisma.pengguna.update({ where: { id_user: idUser }, data });
    }
    return this.findOne(idUser);
  }

  /**
   * Nonaktifkan penghuni (FR-14): soft delete pengguna, lepas kamar
   * (`detail_kos.aktif = false` dan kamar kembali `KOSONG`).
   */
  async remove(id: string): Promise<{ id_user: string }> {
    const pengguna = await this.prisma.pengguna.findFirst({
      where: { id_user: id, deleted_at: null },
      select: { id_user: true, role: true, username: true },
    });
    if (!pengguna) throw new NotFoundException('Pengguna tidak ditemukan.');
    if (pengguna.role === Role.ADMIN) {
      throw new BadRequestException('Akun admin tidak dapat dinonaktifkan lewat modul penghuni.');
    }

    const tagihanMenunggu = await this.prisma.pembayaran.count({
      where: {
        pengguna: { id_user: id },
        status: 'MENUNGGU_KONFIRMASI',
        deleted_at: null,
      },
    });
    if (tagihanMenunggu > 0) {
      throw new BadRequestException(
        'Masih ada pembayaran yang menunggu konfirmasi. Selesaikan peninjauan terlebih dahulu.'
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const detail = await tx.detailKos.findFirst({
        where: { id_user: id, aktif: true, deleted_at: null },
        select: { id_kamar: true },
      });

      if (detail) {
        await tx.detailKos.updateMany({
          where: { id_user: id, aktif: true },
          data: { aktif: false, deleted_at: new Date() },
        });
        await tx.kamar.update({
          where: { id_kamar: detail.id_kamar },
          data: { status: StatusKamar.KOSONG },
        });
      }

      await tx.pengguna.update({
        where: { id_user: id },
        data: { deleted_at: new Date() },
      });
    });

    this.logger.log(`Penghuni dinonaktifkan: ${pengguna.username}`);
    return { id_user: id };
  }

  /** Pindahkan penghuni ke kamar kosong lain (FR-15) dalam satu transaksi. */
  async assignKamar(id: string, dto: AssignKamarDto): Promise<PenghuniView> {
    const tglMasuk = dto.tgl_masuk ? this.parseTanggal(dto.tgl_masuk) : new Date();
    await this.assignKamarInternal(id, dto.id_kamar, tglMasuk, this.hitungJatuhTempo(tglMasuk));
    return this.findOne(id);
  }

  /**
   * Inti assign/pindah kamar — dipakai `create` (tanpa kamar) dan
   * `assignKamar`. Bila `idKamar` undefined, hanya memastikan record
   * `detail_kos` dibuat tanpa kamar.
   */
  private async assignKamarInternal(
    idUser: string,
    idKamar: string | undefined,
    tglMasuk: Date,
    jatuhTempo: Date
  ): Promise<{ id_kamar: string | null }> {
    const pengguna = await this.prisma.pengguna.findFirst({
      where: { id_user: idUser, deleted_at: null },
      select: { id_user: true },
    });
    if (!pengguna) throw new NotFoundException('Pengguna tidak ditemukan.');

    if (!idKamar) {
      const detail = await this.prisma.detailKos.findFirst({
        where: { id_user: idUser, deleted_at: null },
        select: { id_kamar: true },
      });
      return detail ?? { id_kamar: null };
    }

    return this.prisma.$transaction(async (tx) => {
      const kamar = await tx.kamar.findFirst({
        where: { id_kamar: idKamar, deleted_at: null },
        select: { id_kamar: true, status: true },
      });
      if (!kamar) throw new NotFoundException('Kamar tidak ditemukan.');
      if (kamar.status === StatusKamar.MAINTENANCE) {
        throw new BadRequestException('Kamar sedang dalam maintenance dan tidak dapat dipilih.');
      }

      const penghuniLain = await tx.detailKos.findFirst({
        where: { id_kamar: idKamar, aktif: true, deleted_at: null },
        select: { id_user: true },
      });
      if (penghuniLain && penghuniLain.id_user !== idUser) {
        throw new ConflictException('Kamar sudah ditempati penghuni lain.');
      }

      const detail = await tx.detailKos.findFirst({
        where: { id_user: idUser, deleted_at: null },
        select: { id_kamar: true },
      });

      if (detail?.id_kamar && detail.id_kamar !== idKamar) {
        await tx.kamar.update({
          where: { id_kamar: detail.id_kamar },
          data: { status: StatusKamar.KOSONG },
        });
      }

      // `id_user` unik pada detail_kos → satu penghuni hanya punya satu baris,
      // sehingga perpindahan kamar memperbarui baris yang sama.
      await tx.detailKos.upsert({
        where: { id_user: idUser },
        update: {
          id_kamar: idKamar,
          tgl_masuk: tglMasuk,
          jatuh_tempo: jatuhTempo,
          aktif: true,
          deleted_at: null,
        },
        create: {
          id_user: idUser,
          id_kamar: idKamar,
          tgl_masuk: tglMasuk,
          jatuh_tempo: jatuhTempo,
          aktif: true,
        },
      });

      await tx.kamar.update({
        where: { id_kamar: idKamar },
        data: { status: StatusKamar.TERISI },
      });

      return { id_kamar: idKamar };
    });
  }

  private toView(pengguna: {
    id_user: string;
    username: string;
    nama_lengkap: string;
    email: string;
    no_hp: string | null;
    role: Role;
    created_at: Date;
    updated_at: Date;
    detailKos?: {
      tgl_masuk: Date;
      jatuh_tempo: Date;
      aktif: boolean;
      kamar: { id_kamar: string; no_kamar: string; harga: unknown; status: StatusKamar };
    } | null;
  }): PenghuniView {
    const detail = pengguna.detailKos ?? undefined;
    return {
      id_user: pengguna.id_user,
      username: pengguna.username,
      nama_lengkap: pengguna.nama_lengkap,
      email: pengguna.email,
      no_hp: pengguna.no_hp,
      role: pengguna.role,
      kamar: detail
        ? {
            id_kamar: detail.kamar.id_kamar,
            no_kamar: detail.kamar.no_kamar,
            harga: toNumber(detail.kamar.harga as never),
            status: detail.kamar.status,
          }
        : null,
      detail: detail
        ? { tgl_masuk: detail.tgl_masuk, jatuh_tempo: detail.jatuh_tempo, aktif: detail.aktif }
        : null,
      created_at: pengguna.created_at,
      updated_at: pengguna.updated_at,
    };
  }

  private parseTanggal(value: string): Date {
    const tanggal = new Date(`${value}T00:00:00+08:00`);
    if (Number.isNaN(tanggal.getTime())) {
      throw new BadRequestException(`Tanggal tidak valid: ${value}`);
    }
    return tanggal;
  }

  private hitungJatuhTempo(tglMasuk: Date): Date {
    const jatuh = new Date(tglMasuk);
    jatuh.setMonth(jatuh.getMonth() + DEFAULT_MASA_SEWA_BULAN);
    return jatuh;
  }
}
