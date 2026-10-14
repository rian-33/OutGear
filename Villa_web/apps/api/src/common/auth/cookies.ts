/**
 * Nama cookie sesi. Token disimpan sebagai httpOnly cookie agar tidak dapat
 * dicuri oleh skrip XSS (PRD-4 §3). `apiFetch` pada frontend mengirim
 * `credentials: 'include'` sehingga cookie ikut pada setiap request.
 */
export const ACCESS_COOKIE = 'kost_at';
export const REFRESH_COOKIE = 'kost_rt';

export interface SessionCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
}

/**
 * Opsi cookie sesi.
 *
 * `secure` diaktifkan saat `NODE_ENV=production` (wajib TLS, PRD-4 §3).
 * `sameSite: 'lax'` cukup untuk lintas-port pada development, dan tetap
 * mencegah cookie ikut pada request cross-site dari pihak ketiga.
 */
export function sessionCookieOptions(
  maxAgeSeconds: number,
  isProduction: boolean
): SessionCookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds * 1000,
  };
}
