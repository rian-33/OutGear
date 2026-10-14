import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { Public } from '../../common/auth/decorators/public.decorator';
import { ACCESS_COOKIE, REFRESH_COOKIE, sessionCookieOptions } from '../../common/auth/cookies';
import type { AuthUser } from '../../common/auth/types';
import { AuthService, type AuthResult } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto, RefreshDto } from './dto/refresh.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly isProduction: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService
  ) {
    this.isProduction = this.config.get<string>('NODE_ENV') === 'production';
  }

@Public()
  @Throttle({
    default: {
      limit: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 5),
      ttl: Number(process.env.AUTH_RATE_LIMIT_TTL_MS ?? 60_000),
    },
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login dan terima sepasang token (F-02)' })
  @ApiTooManyRequestsResponse({ description: 'Maksimal 5 percobaan per menit per IP.' })
  @ApiUnauthorizedResponse({ description: 'Username atau password salah.' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResult> {
    const hasil = await this.authService.login(dto);
    this.setSessionCookies(response, hasil);
    return hasil;
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotasi refresh token (F-03)' })
  @ApiUnauthorizedResponse({ description: 'Refresh token tidak valid / sudah dipakai.' })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResult> {
    // Cookie diprioritaskan; body tetap diterima agar klien non-browser bisa memakai.
    const token = request.cookies?.[REFRESH_COOKIE] ?? dto.refresh_token;
    if (!token) {
      throw new UnauthorizedException('Sesi tidak ditemukan. Silakan masuk kembali.');
    }
    const hasil = await this.authService.refresh(token);
    this.setSessionCookies(response, hasil);
    return hasil;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOperation({ summary: 'Akhiri sesi dan blacklist token (F-04)' })
  async logout(
    @Req() request: Request & { authJti?: string },
    @Res({ passthrough: true }) response: Response
  ): Promise<void> {
    await this.authService.logout({
      accessJti: request.authJti,
      refreshToken: request.cookies?.[REFRESH_COOKIE],
    });

    this.clearSessionCookies(response);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOperation({ summary: 'Profil pengguna yang sedang login' })
  @ApiOkResponse({ description: 'Profil pengguna aktif' })
  async me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user);
  }

  @Patch('password')
  @ApiBearerAuth()
  @ApiCookieAuth(ACCESS_COOKIE)
  @ApiOperation({ summary: 'Ganti password (F-05)' })
  @ApiUnauthorizedResponse({ description: 'Password lama tidak cocok.' })
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResult> {
    const hasil = await this.authService.changePassword(user, dto);
    this.setSessionCookies(response, hasil);
    return hasil;
  }

  private setSessionCookies(response: Response, hasil: AuthResult): void {
    const options = sessionCookieOptions(hasil.access_expires_in, this.isProduction);
    const refreshOptions = sessionCookieOptions(hasil.refresh_expires_in, this.isProduction);

    response.cookie(ACCESS_COOKIE, hasil.access_token, options);
    response.cookie(REFRESH_COOKIE, hasil.refresh_token, refreshOptions);
  }

  private clearSessionCookies(response: Response): void {
    const options = sessionCookieOptions(0, this.isProduction);
    response.clearCookie(ACCESS_COOKIE, { ...options, maxAge: undefined });
    response.clearCookie(REFRESH_COOKIE, { ...options, maxAge: undefined });
  }
}
