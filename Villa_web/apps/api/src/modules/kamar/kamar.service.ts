import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StatusKamar, StatusReservasi } from '@kost/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { toNumber } from '../../common/utils/money';
import type { CreateKamarDto } from './dto/create-kamar.dto';
import type { QueryKamarDto } from './dto/query-kamar.dto';
import type { UpdateKamarDto } from './dto/update-kamar.dto';

export interface KamarView {
  id_kamar: string;
  no_kamar: string;
  kapasitas: number;
  harga: number;
  fasilitas: string | null;
  status: StatusKamar;
  penghuni: null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class KamarService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateKamarDto): Promise<KamarView> {
    const existing = await this.prisma.kamar.findFirst({ where: { no_kamar: dto.no_kamar, deleted_at: null } });
    if (existing) throw new ConflictException(`Kamar ${dto.no_kamar} sudah terdaftar.`);
    const room = await this.prisma.kamar.create({
      data: { no_kamar: dto.no_kamar, harga: dto.harga, kapasitas: dto.kapasitas, fasilitas: dto.fasilitas ?? null, status: StatusKamar.KOSONG },
    });
    return this.toView(room);
  }

  async findAll(query: QueryKamarDto) {
    const where = {
      deleted_at: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { no_kamar: { contains: query.search, mode: 'insensitive' as const } } : {}),
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.kamar.count({ where }),
      this.prisma.kamar.findMany({ where, orderBy: { no_kamar: 'asc' }, skip: query.skip, take: query.take }),
    ]);
    return {
      data: rows.map((room) => this.toView(room)),
      meta: { page: query.page, perPage: query.perPage, total, totalPage: Math.ceil(total / query.perPage) },
    };
  }

  async findOne(id: string): Promise<KamarView> {
    const room = await this.prisma.kamar.findFirst({ where: { id_kamar: id, deleted_at: null } });
    if (!room) throw new NotFoundException('Kamar villa tidak ditemukan.');
    return this.toView(room);
  }

  async update(id: string, dto: UpdateKamarDto): Promise<KamarView> {
    await this.ensureExists(id);
    const data: { harga?: number; kapasitas?: number; fasilitas?: string | null } = {};
    if (dto.harga !== undefined) data.harga = dto.harga;
    if (dto.kapasitas !== undefined) data.kapasitas = dto.kapasitas;
    if (dto.fasilitas !== undefined) data.fasilitas = dto.fasilitas;
    if (Object.keys(data).length) await this.prisma.kamar.update({ where: { id_kamar: id }, data });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ id_kamar: string }> {
    await this.ensureExists(id);
    const active = await this.prisma.reservasi.count({
      where: { id_kamar: id, deleted_at: null, status: { in: [StatusReservasi.MENUNGGU, StatusReservasi.DIKONFIRMASI] } },
    });
    if (active) throw new BadRequestException('Kamar memiliki reservasi aktif dan belum dapat diarsipkan.');
    await this.prisma.kamar.update({ where: { id_kamar: id }, data: { deleted_at: new Date() } });
    return { id_kamar: id };
  }

  async updateStatus(id: string, status: StatusKamar): Promise<KamarView> {
    await this.ensureExists(id);
    if (status === StatusKamar.TERISI) {
      throw new BadRequestException('Status terisi ditentukan otomatis dari kalender reservasi.');
    }
    await this.prisma.kamar.update({ where: { id_kamar: id }, data: { status } });
    return this.findOne(id);
  }

  private async ensureExists(id: string): Promise<void> {
    const room = await this.prisma.kamar.findFirst({ where: { id_kamar: id, deleted_at: null }, select: { id_kamar: true } });
    if (!room) throw new NotFoundException('Kamar villa tidak ditemukan.');
  }

  private toView(room: { id_kamar: string; no_kamar: string; harga: unknown; kapasitas: number; fasilitas: string | null; status: StatusKamar; created_at: Date; updated_at: Date }): KamarView {
    return {
      id_kamar: room.id_kamar, no_kamar: room.no_kamar, harga: toNumber(room.harga as never),
      kapasitas: room.kapasitas, fasilitas: room.fasilitas, status: room.status, penghuni: null,
      created_at: room.created_at, updated_at: room.updated_at,
    };
  }
}

