import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';

/** Batas ukuran berkas bukti bayar (PRD-4 §3 / FR-27). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** MIME yang diizinkan (whitelist, PRD-4 §3). */
export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'] as const;

export type Penyimpanan = 'r2' | 'lokal';

export interface BerkasTersimpan {
  /** Kunci objek yang disimpan di bucket/direktori lokal. */
  key: string;
  nama_asli: string;
  mime: string;
  ukuran: number;
  penyimpanan: Penyimpanan;
}

/**
 * Penyimpanan bukti bayar — Cloudflare R2 (S3-compatible) bila kredensial
 * tersedia, atau direktori lokal bila tidak.
 *
 * Fallback lokal dipertahankan agar aplikasi dapat langsung dipakai pada
 * lingkungan pengembangan tanpa akun cloud; di produksi `R2_*` wajib terisi.
 * Berkas TIDAK pernah diekspos sebagai URL publik — pembacaan memakai
 * URL bertanda tangan yang berumur pendek (PRD-4 §3 "disimpan private").
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null = null;
  private readonly bucket: string;
  private readonly direktoriLokal: string;
  private readonly maxAgeUrlDetik: number;

  /** True bila memakai Cloudflare R2, false bila fallback direktori lokal. */
  get terpakaiR2(): boolean {
    return this.client !== null;
  }

  constructor(config: ConfigService) {
    const endpoint = config.get<string>('R2_ENDPOINT');
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = config.get<string>('R2_BUCKET') ?? 'kostmanager-bukti';
    this.direktoriLokal = resolve(process.cwd(), 'storage');
    this.maxAgeUrlDetik = Number(config.get<string>('R2_SIGNED_URL_TTL') ?? 300);

    if (endpoint && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
    } else {
      this.logger.warn(
        'Kredensial R2 belum lengkap — bukti bayar disimpan di direktori lokal `storage/`.'
      );
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.client) await mkdir(this.direktoriLokal, { recursive: true });
  }

  get mode(): Penyimpanan {
    return this.client ? 'r2' : 'lokal';
  }

  /**
   * Validasi & simpan berkas bukti bayar.
   * Nama berkas di-randomize (PRD-4 §3) sehingga nama asli pengguna tidak
   * terekspos maupun mengizinkan path traversal.
   */
  async simpanBukti(
    file: Express.Multer.File | undefined,
    prefix: string
  ): Promise<BerkasTersimpan> {
    if (!file) {
      throw new BadRequestException('Bukti bayar wajib diunggah.');
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new PayloadTooLargeException('Ukuran berkas maksimal 5MB.');
    }
    if (!ALLOWED_MIME.includes(file.mimetype as (typeof ALLOWED_MIME)[number])) {
      throw new UnsupportedMediaTypeException('Format berkas harus JPG, PNG, atau PDF.');
    }

    const ekstensi =
      this.ekstensiDariMime(file.mimetype) ?? extname(file.originalname).toLowerCase();
    const key = `${prefix}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ekstensi}`;

    if (this.client) {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );
    } else {
      const tujuan = this.pathLokal(key);
      await mkdir(join(tujuan, '..'), { recursive: true });
      await writeFile(tujuan, file.buffer);
    }

    return {
      key,
      nama_asli: file.originalname,
      mime: file.mimetype,
      ukuran: file.size,
      penyimpanan: this.mode,
    };
  }

  /**
   * URL bertanda tangan untuk melihat bukti bayar, berlaku singkat (default
   * 5 menit). Endpoint pemanggil wajib memverifikasi kepemilikan tagihan lebih
   * dulu — tanda tangan hanya melindungi akses ke objek.
   */
  async urlTandaTangan(key: string): Promise<string> {
    if (this.client) {
      return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
        expiresIn: this.maxAgeUrlDetik,
      });
    }
    // Mode lokal tidak punya penanda tangan; pemanggil harus memakai endpoint
    // unduh terautentikasi `GET /pembayaran/:id/bukti` (lihat PembayaranService.buktiUrl).
    throw new BadRequestException('Penyimpanan lokal tidak menerbitkan URL bertanda tangan.');
  }

  async hapus(key: string): Promise<void> {
    if (this.client) {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      return;
    }
    await unlink(this.pathLokal(key)).catch(() => undefined);
  }

  /** Baca isi berkas (dipakai endpoint streaming bukti lokal). */
  async baca(key: string): Promise<{ buffer: Buffer; mime: string }> {
    if (this.client) {
      const hasil = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      const bytes = await hasil.Body?.transformToByteArray();
      if (!bytes) throw new BadRequestException('Berkas tidak ditemukan.');
      return { buffer: Buffer.from(bytes), mime: hasil.ContentType ?? 'application/octet-stream' };
    }
    const buffer = await readFile(this.pathLokal(key)).catch(() => {
      throw new BadRequestException('Berkas tidak ditemukan.');
    });
    return { buffer, mime: this.mimeDariKey(key) };
  }

  stream(key: string) {
    return createReadStream(this.pathLokal(key));
  }

  /**
   * Cegah path traversal: pastikan hasil resolve berada di dalam direktori
   * penyimpanan.
   */
  private pathLokal(key: string): string {
    const target = resolve(this.direktoriLokal, key);
    if (target !== this.direktoriLokal && !target.startsWith(this.direktoriLokal + sep)) {
      throw new BadRequestException('Key berkas tidak valid.');
    }
    return target;
  }

  private ekstensiDariMime(mime: string): string | undefined {
    switch (mime) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'application/pdf':
        return '.pdf';
      default:
        return undefined;
    }
  }

  private mimeDariKey(key: string): string {
    if (key.endsWith('.png')) return 'image/png';
    if (key.endsWith('.pdf')) return 'application/pdf';
    return 'image/jpeg';
  }
}
