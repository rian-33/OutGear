import { NextRequest, NextResponse } from 'next/server';

const PENGHUNI_ROUTES = [
  /^\/dashboard$/,
  /^\/tagihan$/,
  /^\/bayar\//,
  /^\/riwayat$/,
  /^\/pengajuan$/,
  /^\/profil$/,
];

const PUBLIC_ONLY = ['/login', '/register'];

/** Decode klaim dari akses token (tanpa verifikasi — hanya untuk routing awal). */
function decodeTokenRole(token?: string): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = atob(padded);
    return (JSON.parse(json) as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

function homeByRole(role: string | null): string {
  return role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('kost_at')?.value;
  const role = decodeTokenRole(token);

  // Rute operasional lama dihentikan; seluruh pekerjaan admin sekarang lewat
  // reservasi dan inventaris villa.
  if (/^\/admin\/(penghuni|tagihan|pembayaran|pengajuan|laporan)(\/|$)/.test(pathname)) {
    return NextResponse.redirect(new URL('/admin/reservasi', request.url));
  }

  // Halaman admin: wajib admin.
  if (pathname.startsWith('/admin')) {
    if (role !== 'ADMIN') {
      const url = new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Halaman penghuni: wajib login.
  if (PENGHUNI_ROUTES.some((re) => re.test(pathname))) {
    if (!role) {
      const url = new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url);
      return NextResponse.redirect(url);
    }
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Login/register: pengguna sudah login langsung diarahkan ke dashbboardnya.
  if (PUBLIC_ONLY.includes(pathname) && role) {
    return NextResponse.redirect(new URL(homeByRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard',
    '/tagihan',
    '/bayar/:path*',
    '/riwayat',
    '/pengajuan',
    '/profil',
    '/login',
    '/register',
  ],
};
