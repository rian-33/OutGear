import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface NormalizedError {
  statusCode: number;
  message: string;
  details?: unknown;
}

/**
 * Normalisasi seluruh error menjadi satu bentuk JSON agar frontend dapat
 * menampilkannya konsisten (PRD-4 §3 & §5.5).
 *
 * Bentuk: `{ statusCode, message, details?, path, timestamp }`.
 * Detail internal (stack trace, pesan driver database) tidak pernah dibocorkan
 * ke client pada environment production.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const normalized = this.normalize(exception);

    if (normalized.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} → ${normalized.statusCode}: ${normalized.message}`,
        exception instanceof Error ? exception.stack : String(exception)
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} → ${normalized.statusCode}: ${normalized.message}`
      );
    }

    response.status(normalized.statusCode).json({
      statusCode: normalized.statusCode,
      message: normalized.message,
      ...(normalized.details !== undefined ? { details: normalized.details } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private normalize(exception: unknown): NormalizedError {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      return {
        statusCode: status,
        ...this.fromHttpBody(body, status),
      };
    }

    if (this.isPrismaKnownError(exception)) {
      return this.fromPrismaError(exception);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
    };
  }

  private fromHttpBody(
    body: string | object,
    status: number
  ): { message: string; details?: unknown } {
    if (typeof body === 'string') return { message: body };

    const record = body as Record<string, unknown>;
    const rawMessage = record.message;

    if (Array.isArray(rawMessage)) {
      return { message: 'Data yang dikirim tidak valid.', details: rawMessage };
    }
    if (typeof rawMessage === 'string') {
      const { message: _message, ...rest } = record;
      return {
        message: rawMessage,
        details: Object.keys(rest).length > 0 ? rest : undefined,
      };
    }
    return { message: this.defaultMessage(status) };
  }

  private defaultMessage(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Permintaan tidak valid.';
      case HttpStatus.UNAUTHORIZED:
        return 'Autentikasi diperlukan.';
      case HttpStatus.FORBIDDEN:
        return 'Akses ditolak.';
      case HttpStatus.NOT_FOUND:
        return 'Data tidak ditemukan.';
      case HttpStatus.CONFLICT:
        return 'Data sudah ada.';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Terlalu banyak permintaan. Silakan coba beberapa saat lagi.';
      default:
        return 'Terjadi kesalahan pada server.';
    }
  }

  /** Deteksi error Prisma tanpa mengimpor `@prisma/client` runtime di sini. */
  private isPrismaKnownError(exception: unknown): exception is { code: string; meta?: unknown } {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      typeof (exception as { code: unknown }).code === 'string' &&
      (exception as { code: string }).code.startsWith('P')
    );
  }

  /**
   * Petakan error Prisma yang umum menjadi pesan ramah, tanpa membocorkan
   * detail skema database.
   */
  private fromPrismaError(exception: { code: string; meta?: unknown }): NormalizedError {
    const target = this.prismaTarget(exception.meta);

    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `Data sudah ada${target ? ` (${target})` : ''}.`,
        };
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Data masih terhubung dengan data lain sehingga tidak dapat dihapus.',
        };
      case 'P2025':
        return { statusCode: HttpStatus.NOT_FOUND, message: 'Data tidak ditemukan.' };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
        };
    }
  }

  private prismaTarget(meta: unknown): string | undefined {
    if (typeof meta !== 'object' || meta === null) return undefined;
    const target = (meta as { target?: unknown }).target;
    return Array.isArray(target) ? target.join(', ') : undefined;
  }
}
