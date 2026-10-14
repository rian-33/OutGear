/**
 * Enum & status bersama — sumber tunggal dari PRD-3 §2.1.
 * Dipakai silang oleh backend (NestJS), frontend (Next.js), dan UI kit.
 *
 * Sengaja ditulis sebagai `const object` + union type (bukan `enum` bawaan
 * TypeScript): bentuknya jadi identik dengan enum yang dihasilkan Prisma
 * Client, sehingga tipe dari database dan tipe shared bisa saling ditukar
 * tanpa casting. Daughteran juga lebih ringan untuk tree-shaking.
 */

export const Role = {
  ADMIN: 'ADMIN',
  PENGHUNI: 'PENGHUNI',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const StatusKamar = {
  KOSONG: 'KOSONG',
  TERISI: 'TERISI',
  MAINTENANCE: 'MAINTENANCE',
} as const;
export type StatusKamar = (typeof StatusKamar)[keyof typeof StatusKamar];

export const StatusTagihan = {
  BELUM_BAYAR: 'BELUM_BAYAR',
  PENDING: 'PENDING',
  LUNAS: 'LUNAS',
  OVERDUE: 'OVERDUE',
} as const;
export type StatusTagihan = (typeof StatusTagihan)[keyof typeof StatusTagihan];

export const StatusPembayaran = {
  MENUNGGU_KONFIRMASI: 'MENUNGGU_KONFIRMASI',
  DIKONFIRMASI: 'DIKONFIRMASI',
  DITOLAK: 'DITOLAK',
} as const;
export type StatusPembayaran = (typeof StatusPembayaran)[keyof typeof StatusPembayaran];

export const MetodeBayar = {
  TRANSFER_BANK: 'TRANSFER_BANK',
  CASH: 'CASH',
  EWALLET: 'EWALLET',
} as const;
export type MetodeBayar = (typeof MetodeBayar)[keyof typeof MetodeBayar];

export const StatusPengajuan = {
  PENDING: 'PENDING',
  DISETUJUI: 'DISETUJUI',
  DITOLAK: 'DITOLAK',
} as const;
export type StatusPengajuan = (typeof StatusPengajuan)[keyof typeof StatusPengajuan];

export const StatusReservasi = {
  MENUNGGU: 'MENUNGGU',
  DIKONFIRMASI: 'DIKONFIRMASI',
  DIBATALKAN: 'DIBATALKAN',
  SELESAI: 'SELESAI',
} as const;
export type StatusReservasi = (typeof StatusReservasi)[keyof typeof StatusReservasi];

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin',
  PENGHUNI: 'Penghuni',
};

export const STATUS_KAMAR_LABEL: Record<StatusKamar, string> = {
  KOSONG: 'Tersedia',
  TERISI: 'Terisi',
  MAINTENANCE: 'Perawatan',
};

export const STATUS_TAGIHAN_LABEL: Record<StatusTagihan, string> = {
  BELUM_BAYAR: 'Belum Bayar',
  PENDING: 'Pending',
  LUNAS: 'Lunas',
  OVERDUE: 'Overdue',
};

export const STATUS_PEMBAYARAN_LABEL: Record<StatusPembayaran, string> = {
  MENUNGGU_KONFIRMASI: 'Menunggu Konfirmasi',
  DIKONFIRMASI: 'Dikonfirmasi',
  DITOLAK: 'Ditolak',
};

export const METODE_BAYAR_LABEL: Record<MetodeBayar, string> = {
  TRANSFER_BANK: 'Transfer Bank',
  CASH: 'Tunai',
  EWALLET: 'E-Wallet',
};

export const STATUS_PENGAJUAN_LABEL: Record<StatusPengajuan, string> = {
  PENDING: 'Pending',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
};

/** Seluruh nilai enum, berguna untuk validasi input berbasis daftar putih. */
export const ROLE_VALUES = Object.values(Role) as Role[];
export const STATUS_KAMAR_VALUES = Object.values(StatusKamar) as StatusKamar[];
export const STATUS_TAGIHAN_VALUES = Object.values(StatusTagihan) as StatusTagihan[];
export const STATUS_PEMBAYARAN_VALUES = Object.values(StatusPembayaran) as StatusPembayaran[];
export const METODE_BAYAR_VALUES = Object.values(MetodeBayar) as MetodeBayar[];
export const STATUS_PENGAJUAN_VALUES = Object.values(StatusPengajuan) as StatusPengajuan[];

/** Rentang periode untuk laporan pemasukan (PRD-3 FR-34/35). */
export interface PeriodRange {
  dari: string;
  sampai: string;
}

/** Bentuk paginasi yang dipakai seluruh endpoint list API. */
export interface PaginatedMeta {
  page: number;
  perPage: number;
  total: number;
  totalPage: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginatedMeta;
}
