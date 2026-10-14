import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Tandai endpoint sebagai publik — `JwtAuthGuard` akan dilewati.
 * dipakai pada login, refresh, ketersediaan/booking villa, dan health check.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
