import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ACCESS_COOKIE } from '../cookies';
import { RedisService } from '../../redis/redis.service';
import type { AuthUser, JwtPayload } from '../types';

/**
 * Guard autentikasi bearer token (PRD-3 FR-02, PRD-4 §3).
 *
 * Alur:
 *  1. Endpoint bertanda `@Public()` dilewati.
 *  2. Token diambil dari header `Authorization: Bearer <token>`.
 *  3. Signature & masa berlaku diverifikasi via `JwtService`.
 *  4. Token `refresh` ditolak di sini (hanya untuk `/auth/refresh`).
 *  5. `jti` dicek terhadap blacklist (Redis / in-memory) agar logout langsung
 *     menidimensionalkan access token yang masih hidup.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser; authJti?: string }>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Token akses tidak ditemukan. Silakan login kembali.');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Token akses tidak valid atau sudah kedaluwarsa.');
    }

    if (payload.typ !== 'access') {
      throw new UnauthorizedException('Jenis token tidak sesuai untuk endpoint ini.');
    }

    if (await this.redis.exists(JwtAuthGuard.blacklistKey(payload.jti))) {
      throw new UnauthorizedException('Sesi telah diakhiri. Silakan login kembali.');
    }

    request.user = {
      id_user: payload.sub,
      username: payload.username,
      role: payload.role,
    };
    request.authJti = payload.jti;
    return true;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (header) {
      const [scheme, value] = header.split(' ');
      if (value && scheme?.toLowerCase() === 'bearer') return value.trim();
    }
    // Fallback: token disimpan sebagai httpOnly cookie oleh frontend browser.
    const cookies = (request as Request & { cookies?: Record<string, string> }).cookies;
    return cookies?.[ACCESS_COOKIE] ?? null;
  }

  static blacklistKey(jti: string): string {
    return `kost:token:blacklist:${jti}`;
  }
}
