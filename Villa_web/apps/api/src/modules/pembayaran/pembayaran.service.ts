import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MetodeBayar, StatusPembayaran, StatusTagihan } from '@kost/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { toNumber } from '../../common/utils/money';
import { StorageService } from '../storage/storage.service';
import type {
  CreatePembayaranDto,
  KonfirmasiPembayaranDto,
  QueryPembayaranDto,
  TolakPembayaranDto,
} from './dto/pembayaran.dto';

export interface PembayaranView {
  id_pembayaran: string;
  id_tagihan: string;
  id_user: string;
  jumlah_bayar: number;
  metode: MetodeBayar;
  bukti_bayar: string | null;
  catatan: string | null;
  status: StatusPembayaran;
  alasan_tolak: string | null;
  catatan_admin: string | null;
  confirmed_by: string | null;
  pengkonfirmasi: { id_user: string; nama_lengkap: string } | null;
  tagihan: { periode: string; jumlah: number; status: StatusTagihan } | null;
  penghuni: { id_user: string; nama_lengkap: string; username: string } | null;
  created_at: Date;
  updated_at: Date;
}

/** Status tagihan yang boleh dibayar penghuni (FR-22). */
const BAYARABLE: StatusTagihan[] = [StatusTagihan.BELUM_BAYAR, StatusTagihan.OVERDUE];

/** Query internal list pembayaran — dipisahkan dari DTO agar mudah dipakai internal. */
interface PembayaranFilter {
  page: number;
  perPage: number;
  skip: number;
  take: number;
  status?: StatusPembayaran;
  metode?: MetodeBayar;
  id_tagihan?: string;
  id_user?: string;
}

/**
 * Modul pembayaran (F-17 s/d F-19 — FR-22 s/d FR-27).
 *
 * Konfirmasi & penolakan selalu dibungkus `$transaction` karena keduanya
 * mengubah dua tabel sekaligus (`pembayaran` + `tagihan`) — PRD-4 §4.
 */
@Injectable()
export class PembayaranService {
  private readonly logger = new Logger(PembayaranService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  /**
   * Penghuni mengirim pembayaran + bukti transfer (FR-22).
   *
   * Validasi: tagihan milik pemohon, status tagihan dapat dibayar, dan belum
   * ada pembayaran lain yang masih menunggu konfirmasi.
   */
  async create(
    idUser: string,
    dto: CreatePembayaranDto,
    file: Express.Multer.File | undefined
  ): Promise<PembayaranView> {
    const tagihan = await this.prisma.tagihan.findFirst({
      where: { id_tagihan: dto.id_tagihan, deleted_at: null },
      select: {
        id_tagihan: true,
        id_user: true,
        jumlah: true,
        status: true,
        periode: true,
      },
    });

    if (!tagihan) throw new NotFoundException('Tagihan tidak ditemukan.');
    if (tagihan.id_user !== idUser) {
      throw new ForbiddenException('Tagihan ini bukan milik Anda.');
    }
    if (!BAYARABLE.includes(tagihan.status)) {
      throw new BadRequestException(
        tagihan.status === StatusTagihan.LUNAS
          ? 'Tagihan ini sudah lunas.'
          : 'Sudah ada pembayaran yang menunggu konfirmasi untuk tagihan ini.'
      );
    }

    const nominalTagihan = toNumber(tagihan.jumlah as never);
    if (dto.jumlah_bayar !== nominalTagihan) {
      throw new BadRequestException(
        `Nominal harus sama dengan total tagihan (${nominalTagihan}). Pembayaran sebagian belum tersedia di MVP (PRD-2 F-21).`
      );
    }

    const berkas = await this.storage.simpanBukti(file, 'bukti');

    const pembayaran = await this.prisma.$transaction(async (tx) => {
      const dibuat = await tx.pembayaran.create({
        data: {
          id_tagihan: dto.id_tagihan,
          id_user: idUser,
          jumlah_bayar: dto.jumlah_bayar,
          metode: dto.metode,
          bukti_bayar: berkas.key,
          catatan: dto.catatan ?? null,
          status: StatusPembayaran.MENUNGGU_KONFIRMASI,
        },
      });

      // Tandai tagihan sedang diproses agar penghuni tidak mengirim dua kali.
      await tx.tagihan.update({
        where: { id_tagihan: dto.id_tagihan },
        data: { status: StatusTagihan.PENDING },
      });

      return dibuat;
    });

    this.logger.log(`Pembayaran baru dari ${idUser} untuk tagihan ${dto.id_tagihan}`);
    return this.findOne(pembayaran.id_pembayaran, { id_user: idUser, role: 'PENGHUNI' });
  }

  /** Riwayat pembayaran penghuni (FR-23). */
  async findMine(idUser: string, query: QueryPembayaranDto) {
    // Getter `skip`/`take` ada di prototype DTO sehingga tidak ikut saat spread.
    return this.findAll({
      page: query.page,
      perPage: query.perPage,
      skip: query.skip,
      take: query.take,
      status: query.status,
      metode: query.metode,
      id_tagihan: query.id_tagihan,
      id_user: idUser,
    });
  }

  /** List pembayaran — admin melihat semua (FR-24). */
  async findAll(query: PembayaranFilter) {
    const where: Record<string, unknown> = { deleted_at: null };

    if (query.id_user) where.id_user = query.id_user;
    if (query.status) where.status = query.status;
    if (query.metode) where.metode = query.metode;
    if (query.id_tagihan) where.id_tagihan = query.id_tagihan;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.pembayaran.count({ where }),
      this.prisma.pembayaran.findMany({
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

  async findOne(
    idPembayaran: string,
    pemohon?: { id_user: string; role: string }
  ): Promise<PembayaranView> {
    const pembayaran = await this.prisma.pembayaran.findFirst({
      where: { id_pembayaran: idPembayaran, deleted_at: null },
      include: this.detailInclude(),
    });
    if (!pembayaran) throw new NotFoundException('Pembayaran tidak ditemukan.');

    if (pemohon && pemohon.role === 'PENGHUNI' && pembayaran.id_user !== pemohon.id_user) {
      throw new NotFoundException('Pembayaran tidak ditemukan.');
    }

    return this.toView(pembayaran);
  }

  /**
   * Admin mengonfirmasi pembayaran (FR-25): pembayaran → `DIKONFIRMASI`,
   * tagihan → `LUNAS`, dalam satu transaksi.
   */
  async konfirmasi(
    idPembayaran: string,
    adminId: string,
    dto: KonfirmasiPembayaranDto
  ): Promise<PembayaranView> {
    const pembayaran = await this.prisma.pembayaran.findFirst({
      where: { id_pembayaran: idPembayaran, deleted_at: null },
      select: { id_pembayaran: true, status: true, id_tagihan: true },
    });
    if (!pembayaran) throw new NotFoundException('Pembayaran tidak ditemukan.');
    if (pembayaran.status !== StatusPembayaran.MENUNGGU_KONFIRMASI) {
      throw new BadRequestException('Pembayaran ini sudah diproses sebelumnya.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.pembayaran.update({
        where: { id_pembayaran: idPembayaran },
        data: {
          status: StatusPembayaran.DIKONFIRMASI,
          confirmed_by: adminId,
          catatan_admin: dto.catatan_admin ?? null,
        },
      });
      await tx.tagihan.update({
        where: { id_tagihan: pembayaran.id_tagihan },
        data: { status: StatusTagihan.LUNAS },
      });
    });

    this.logger.log(`Pembayaran ${idPembayaran} dikonfirmasi oleh ${adminId}`);
    return this.findOne(idPembayaran);
  }

  /**
   * Admin menolak pembayaran (FR-26): `alasan_tolak` wajib, pembayaran →
   * `DITOLAK`, tagihan kembali `BELUM_BAYAR`.
   */
  async tolak(
    idPembayaran: string,
    adminId: string,
    dto: TolakPembayaranDto
  ): Promise<PembayaranView> {
    const pembayaran = await this.prisma.pembayaran.findFirst({
      where: { id_pembayaran: idPembayaran, deleted_at: null },
      select: { id_pembayaran: true, status: true, id_tagihan: true },
    });
    if (!pembayaran) throw new NotFoundException('Pembayaran tidak ditemukan.');
    if (pembayaran.status !== StatusPembayaran.MENUNGGU_KONFIRMASI) {
      throw new BadRequestException('Pembayaran ini sudah diproses sebelumnya.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.pembayaran.update({
        where: { id_pembayaran: idPembayaran },
        data: {
          status: StatusPembayaran.DITOLAK,
          confirmed_by: adminId,
          alasan_tolak: dto.alasan_tolak,
        },
      });
      await tx.tagihan.update({
        where: { id_tagihan: pembayaran.id_tagihan },
        data: { status: StatusTagihan.BELUM_BAYAR },
      });
    });

    this.logger.log(`Pembayaran ${idPembayaran} ditolak oleh ${adminId}`);
    return this.findOne(idPembayaran);
  }

  /**
   * URL bertanda tangan untuk melihat bukti bayar.
   *
   * AUTHORIZATION: pemohon harus admin, atau penghuni yang memiliki
   * pembayaran tersebut. Unggahan disimpan private (FR-27).
   */
  async buktiUrl(
    idPembayaran: string,
    pemohon: { id_user: string; role: string }
  ): Promise<{ url: string; nama_asli: string | null }> {
    const pembayaran = await this.prisma.pembayaran.findFirst({
      where: { id_pembayaran: idPembayaran, deleted_at: null },
      select: { id_user: true, bukti_bayar: true },
    });
    if (!pembayaran) throw new NotFoundException('Pembayaran tidak ditemukan.');
    if (pemohon.role !== 'ADMIN' && pembayaran.id_user !== pemohon.id_user) {
      throw new NotFoundException('Pembayaran tidak ditemukan.');
    }
    if (!pembayaran.bukti_bayar) {
      throw new NotFoundException('Pembayaran ini tidak memiliki bukti.');
    }

    return {
      url: this.storage.terpakaiR2
        ? await this.storage.urlTandaTangan(pembayaran.bukti_bayar)
        : // Mode lokal: arahkan ke endpoint unduh yang terautentikasi, bukan ke path storage.
          `/api/pembayaran/${encodeURIComponent(idPembayaran)}/bukti`,
      nama_asli: pembayaran.bukti_bayar.split('/').pop() ?? null,
    };
  }

  /** Baca isi bukti bayar (dipakai endpoint streaming untuk mode lokal). */
  async bacaBukti(
    idPembayaran: string,
    pemohon: { id_user: string; role: string }
  ): Promise<{ buffer: Buffer; mime: string }> {
    const pembayaran = await this.prisma.pembayaran.findFirst({
      where: { id_pembayaran: idPembayaran, deleted_at: null },
      select: { id_user: true, bukti_bayar: true },
    });
    if (!pembayaran?.bukti_bayar) throw new NotFoundException('Bukti tidak ditemukan.');
    if (pemohon.role !== 'ADMIN' && pembayaran.id_user !== pemohon.id_user) {
      throw new NotFoundException('Bukti tidak ditemukan.');
    }
    return this.storage.baca(pembayaran.bukti_bayar);
  }

  private detailInclude() {
    return {
      pengguna: { select: { id_user: true, nama_lengkap: true, username: true } },
      confirmedBy: { select: { id_user: true, nama_lengkap: true } },
      tagihan: { select: { periode: true, jumlah: true, status: true } },
    } as const;
  }

  private toView(pembayaran: {
    id_pembayaran: string;
    id_tagihan: string;
    id_user: string;
    jumlah_bayar: unknown;
    metode: MetodeBayar;
    bukti_bayar: string | null;
    catatan: string | null;
    status: StatusPembayaran;
    alasan_tolak: string | null;
    catatan_admin: string | null;
    confirmed_by: string | null;
    created_at: Date;
    updated_at: Date;
    pengguna?: { id_user: string; nama_lengkap: string; username: string } | null;
    confirmedBy?: { id_user: string; nama_lengkap: string } | null;
    tagihan?: { periode: string; jumlah: unknown; status: StatusTagihan } | null;
  }): PembayaranView {
    return {
      id_pembayaran: pembayaran.id_pembayaran,
      id_tagihan: pembayaran.id_tagihan,
      id_user: pembayaran.id_user,
      jumlah_bayar: toNumber(pembayaran.jumlah_bayar as never),
      metode: pembayaran.metode,
      bukti_bayar: pembayaran.bukti_bayar,
      catatan: pembayaran.catatan,
      status: pembayaran.status,
      alasan_tolak: pembayaran.alasan_tolak,
      catatan_admin: pembayaran.catatan_admin,
      confirmed_by: pembayaran.confirmed_by,
      pengkonfirmasi: pembayaran.confirmedBy ?? null,
      tagihan: pembayaran.tagihan
        ? {
            periode: pembayaran.tagihan.periode,
            jumlah: toNumber(pembayaran.tagihan.jumlah as never),
            status: pembayaran.tagihan.status,
          }
        : null,
      penghuni: pembayaran.pengguna ?? null,
      created_at: pembayaran.created_at,
      updated_at: pembayaran.updated_at,
    };
  }
}
