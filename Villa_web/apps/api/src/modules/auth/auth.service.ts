import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { Role } from '@kost/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { JwtAuthGuard } from '../../common/auth/guards/jwt-auth.guard';
import type { AuthUser, JwtPayload } from '../../common/auth/types';
import type { ChangePasswordDto } from './dto/refresh.dto';
import type { LoginDto } from './dto/login.dto';

/** Bcrypt cost factor — PRD-4 §3 mensyaratkan minimal 10. */
const BCRYPT_ROUNDS = 10;

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  access_expires_in: number;
  refresh_expires_in: number;
}

export interface AuthResult extends AuthTokens {
  pengguna: {
    id_user: string;
    username: string;
    nama_lengkap: string;
    email: string;
    no_hp: string | null;
    role: Role;
  };
}

/**
 * Autentikasi & manajemen sesi (PRD-3 FR-01 s/d FR-05).
 *
 * - Password di-hash bcrypt cost 10, tidak pernah dikembalikan ke client.
 * - Access token 15 menit, refresh token 30 hari dengan *rotasi* setiap dipakai
 *   dan *blacklist* token lama (PRD-4 §3).
 * - Pesan kegagalan login sengaja generik agar tidak membocorkan apakah
 *   sebuah username terdaftar.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService
  ) {}

  async login(dto: LoginDto): Promise<AuthResult> {
    const pengguna = await this.prisma.pengguna.findFirst({
      where: {
        deleted_at: null,
        OR: [{ username: dto.username }, { email: dto.username.toLowerCase() }],
      },
    });

    // Selalu jalankan bcrypt, termasuk ketika pengguna tidak ditemukan, agar
    // waktu respons tidak membocorkan keberadaan sebuah akun.
    const hash = pengguna?.password ?? DUMMY_HASH;
    const passwordValid = await bcrypt.compare(dto.password, hash);

    if (!pengguna || !passwordValid) {
      throw new UnauthorizedException('Username atau password salah.');
    }

    if (pengguna.role !== Role.ADMIN) {
      throw new UnauthorizedException('Akses masuk hanya tersedia untuk pengelola villa.');
    }

    if (pengguna.deleted_at !== null) {
      throw new UnauthorizedException('Akun ini telah dinonaktifkan.');
    }

    return this.buildResult(pengguna);
  }

  /**
   * Rotasi refresh token: token lama langsung diblacklist lalu digantikan
   * pasangan token baru. Bila token lama dipakai ulang, akses ditolak.
   */
  async refresh(refreshToken: string): Promise<AuthResult> {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid atau sudah kedaluwarsa.');
    }

    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Jenis token tidak sesuai untuk endpoint ini.');
    }

    if (await this.redis.exists(JwtAuthGuard.blacklistKey(payload.jti))) {
      throw new UnauthorizedException('Refresh token sudah dipakai. Silakan login kembali.');
    }

    const pengguna = await this.prisma.pengguna.findFirst({
      where: { id_user: payload.sub, deleted_at: null },
    });
    if (!pengguna) {
      throw new UnauthorizedException('Akun tidak ditemukan atau telah dinonaktifkan.');
    }

    // Rotasi: token lama langsung tidak berlaku lagi.
    await this.blacklist(payload.jti, this.refreshTtl());

    this.logger.log(`Refresh token diputar untuk ${pengguna.username}`);
    return this.buildResult(pengguna);
  }

  /** Akhikan sesi: blacklist access & refresh token milik pengguna. */
  async logout(cookies: { accessJti?: string; refreshToken?: string }): Promise<void> {
    if (cookies.accessJti) {
      await this.blacklist(cookies.accessJti, this.accessTtl());
    }
    if (cookies.refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(cookies.refreshToken, {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          ignoreExpiration: true,
        });
        if (payload.typ === 'refresh') {
          await this.blacklist(payload.jti, this.refreshTtl());
        }
      } catch {
        // Refresh token tidak valid — tidak perlu di-blacklist.
      }
    }
  }

  async changePassword(user: AuthUser, dto: ChangePasswordDto): Promise<AuthResult> {
    const pengguna = await this.prisma.pengguna.findFirst({
      where: { id_user: user.id_user, deleted_at: null },
    });
    if (!pengguna) {
      throw new UnauthorizedException('Akun tidak ditemukan.');
    }

    const valid = await bcrypt.compare(dto.password_lama, pengguna.password);
    if (!valid) {
      throw new UnauthorizedException('Password lama tidak cocok.');
    }
    if (await bcrypt.compare(dto.password_baru, pengguna.password)) {
      throw new ConflictException('Password baru harus berbeda dari password lama.');
    }

    const updated = await this.prisma.pengguna.update({
      where: { id_user: pengguna.id_user },
      data: { password: await bcrypt.hash(dto.password_baru, BCRYPT_ROUNDS) },
    });

    this.logger.log(`Password diubah untuk ${updated.username} — sesi saat ini diperpanjang.`);
    return this.buildResult(updated);
  }

  /** Profil pengguna yang sedang login (dipakai `GET /auth/me`). */
  async me(user: AuthUser): Promise<AuthResult['pengguna']> {
    const pengguna = await this.prisma.pengguna.findFirst({
      where: { id_user: user.id_user, deleted_at: null },
      select: {
        id_user: true,
        username: true,
        nama_lengkap: true,
        email: true,
        no_hp: true,
        role: true,
      },
    });
    if (!pengguna) {
      throw new UnauthorizedException('Akun tidak ditemukan atau telah dinonaktifkan.');
    }
    return pengguna;
  }

  private async buildResult(pengguna: {
    id_user: string;
    username: string;
    nama_lengkap: string;
    email: string;
    no_hp: string | null;
    role: Role;
    password: string;
  }): Promise<AuthResult> {
    const tokens = await this.issueTokens(pengguna);
    return {
      ...tokens,
      pengguna: {
        id_user: pengguna.id_user,
        username: pengguna.username,
        nama_lengkap: pengguna.nama_lengkap,
        email: pengguna.email,
        no_hp: pengguna.no_hp,
        role: pengguna.role,
      },
    };
  }

  private async issueTokens(pengguna: { id_user: string; username: string; role: Role }) {
    const accessTtl = this.accessTtl();
    const refreshTtl = this.refreshTtl();
    const base = { sub: pengguna.id_user, username: pengguna.username, role: pengguna.role };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { ...base, typ: 'access' as const, jti: randomUUID() },
        {
          secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: accessTtl,
        }
      ),
      this.jwtService.signAsync(
        { ...base, typ: 'refresh' as const, jti: randomUUID() },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: refreshTtl,
        }
      ),
    ]);

    return {
      access_token,
      refresh_token,
      access_expires_in: accessTtl,
      refresh_expires_in: refreshTtl,
    };
  }

  private async blacklist(jti: string, ttlSeconds: number): Promise<void> {
    await this.redis.setNxWithTtl(JwtAuthGuard.blacklistKey(jti), Math.max(ttlSeconds, 60));
  }

  private accessTtl(): number {
    return Number(this.config.get<string>('ACCESS_TOKEN_TTL') ?? 900);
  }

  private refreshTtl(): number {
    return Number(this.config.get<string>('REFRESH_TOKEN_TTL') ?? 2592000);
  }
}

/** Hash bcrypt valid namun tidak pernah cocok — dipakai untuk timing defence. */
const DUMMY_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
