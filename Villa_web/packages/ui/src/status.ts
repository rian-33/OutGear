'use client';

import {
  MetodeBayar,
  StatusKamar,
  StatusPembayaran,
  StatusPengajuan,
  StatusTagihan,
} from '@kost/types';
import type { BadgeVariant } from './Badge';

/**
 * Pemetaan status/enum → variant badge, supaya warna status
 * konsisten di seluruh aplikasi (PRD-4 §6.3).
 */
export const TAGIHAN_VARIANT: Record<StatusTagihan, BadgeVariant> = {
  [StatusTagihan.BELUM_BAYAR]: 'warning',
  [StatusTagihan.PENDING]: 'info',
  [StatusTagihan.LUNAS]: 'success',
  [StatusTagihan.OVERDUE]: 'danger',
};

export const PEMBAYARAN_VARIANT: Record<StatusPembayaran, BadgeVariant> = {
  [StatusPembayaran.MENUNGGU_KONFIRMASI]: 'warning',
  [StatusPembayaran.DIKONFIRMASI]: 'success',
  [StatusPembayaran.DITOLAK]: 'danger',
};

export const PENGAJUAN_VARIANT: Record<StatusPengajuan, BadgeVariant> = {
  [StatusPengajuan.PENDING]: 'info',
  [StatusPengajuan.DISETUJUI]: 'success',
  [StatusPengajuan.DITOLAK]: 'danger',
};

export const KAMAR_VARIANT: Record<StatusKamar, BadgeVariant> = {
  [StatusKamar.KOSONG]: 'success',
  [StatusKamar.TERISI]: 'success',
  [StatusKamar.MAINTENANCE]: 'warning',
};

export const METODE_VARIANT: Record<MetodeBayar, BadgeVariant> = {
  [MetodeBayar.TRANSFER_BANK]: 'info',
  [MetodeBayar.CASH]: 'accent',
  [MetodeBayar.EWALLET]: 'accent',
};
