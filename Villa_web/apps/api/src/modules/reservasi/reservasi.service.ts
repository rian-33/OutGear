import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusKamar, StatusReservasi } from '@kost/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { toNumber } from '../../common/utils/money';
import type {
  CheckAvailabilityDto,
  CreateReservasiDto,
  DateRangeDto,
  UpdateReservasiDto,
} from './dto/check-availability.dto';

@Injectable()
export class ReservasiService {
  constructor(private readonly prisma: PrismaService) {}

  async available(query: CheckAvailabilityDto) {
    const { checkIn, checkOut } = this.parseRange(query);
    const kamar = await this.prisma.kamar.findMany({
      where: { deleted_at: null, status: StatusKamar.KOSONG },
      orderBy: { harga: 'asc' },
      include: {
        reservasi: {
          where: {
            deleted_at: null,
            status: { in: [StatusReservasi.MENUNGGU, StatusReservasi.DIKONFIRMASI] },
            check_in: { lt: checkOut },
            check_out: { gt: checkIn },
          },
          select: { id_reservasi: true },
        },
      },
    });

    return kamar
      .filter((room) => room.reservasi.length === 0 && room.kapasitas >= (query.jumlah_tamu ?? 1))
      .map(({ reservasi: _reservasi, ...room }) => ({
        id_kamar: room.id_kamar,
        nama: room.no_kamar,
        harga_per_malam: toNumber(room.harga),
        kapasitas: room.kapasitas,
        fasilitas: room.fasilitas?.split(',').map((item) => item.trim()).filter(Boolean) ?? [],
      }));
  }

  async create(dto: CreateReservasiDto) {
    const { checkIn, checkOut, nights } = this.parseRange(dto);
    const kamar = await this.prisma.kamar.findFirst({
      where: { id_kamar: dto.id_kamar, deleted_at: null, status: StatusKamar.KOSONG },
    });
    if (!kamar) throw new NotFoundException('Kamar tidak tersedia.');
    if (dto.jumlah_tamu > kamar.kapasitas) {
      throw new BadRequestException(`Kapasitas kamar ini maksimal ${kamar.kapasitas} tamu.`);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const conflict = await tx.reservasi.findFirst({
          where: {
            id_kamar: dto.id_kamar,
            deleted_at: null,
            status: { in: [StatusReservasi.MENUNGGU, StatusReservasi.DIKONFIRMASI] },
            check_in: { lt: checkOut },
            check_out: { gt: checkIn },
          },
          select: { id_reservasi: true },
        });
        if (conflict) throw new ConflictException('Kamar baru saja dipesan untuk tanggal tersebut.');

        return tx.reservasi.create({
          data: {
            nama_tamu: dto.nama_tamu.trim(),
            email: dto.email.trim().toLowerCase(),
            no_hp: dto.no_hp.trim(),
            id_kamar: dto.id_kamar,
            check_in: checkIn,
            check_out: checkOut,
            jumlah_tamu: dto.jumlah_tamu,
            total_harga: toNumber(kamar.harga) * nights,
            catatan: dto.catatan?.trim() || null,
          },
          include: { kamar: { select: { no_kamar: true } } },
        });
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2034') {
        throw new ConflictException('Kamar baru saja dipesan untuk tanggal tersebut.');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.reservasi.findMany({
      where: { deleted_at: null },
      include: { kamar: { select: { id_kamar: true, no_kamar: true, fasilitas: true } } },
      orderBy: [{ created_at: 'desc' }],
    });
  }

  async updateStatus(id: string, dto: UpdateReservasiDto) {
    const booking = await this.prisma.reservasi.findFirst({ where: { id_reservasi: id, deleted_at: null } });
    if (!booking) throw new NotFoundException('Reservasi tidak ditemukan.');
    if (!Object.values(StatusReservasi).includes(dto.status)) {
      throw new BadRequestException('Status reservasi tidak valid.');
    }
    if (dto.status === StatusReservasi.DIKONFIRMASI) {
      const duplicate = await this.prisma.reservasi.findFirst({
        where: {
          id_reservasi: { not: id }, id_kamar: booking.id_kamar, deleted_at: null,
          status: StatusReservasi.DIKONFIRMASI,
          check_in: { lt: booking.check_out }, check_out: { gt: booking.check_in },
        }, select: { id_reservasi: true },
      });
      if (duplicate) throw new ConflictException('Tanggal kamar bertabrakan dengan reservasi terkonfirmasi lain.');
    }
    return this.prisma.reservasi.update({ where: { id_reservasi: id }, data: { status: dto.status } });
  }

  private parseRange(range: DateRangeDto) {
    const checkIn = new Date(`${range.check_in}T00:00:00.000Z`);
    const checkOut = new Date(`${range.check_out}T00:00:00.000Z`);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
    if (!Number.isFinite(checkIn.getTime()) || !Number.isFinite(checkOut.getTime()) || nights < 1) {
      throw new BadRequestException('Tanggal check-out harus setelah tanggal check-in.');
    }
    const localToday = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Singapore', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date());
    if (range.check_in < localToday) throw new BadRequestException('Check-in tidak dapat menggunakan tanggal yang sudah lewat.');
    return { checkIn, checkOut, nights };
  }
}
