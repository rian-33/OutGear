import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '../types';

/**
 * Ambil user yang sudah diverifikasi JWT dari request.
 * Dijamin ada oleh `JwtAuthGuard` pada endpoint non-publik.
 */
export const CurrentUser = createParamDecorator(
  (
    data: keyof AuthUser | undefined,
    ctx: ExecutionContext
  ): AuthUser | AuthUser[keyof AuthUser] => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);
