import type { Decimal } from '@prisma/client/runtime/library';

/**
 * Ubah nilai uang dari Prisma (`Decimal`) menjadi `number` untuk response API.
 *
 * PRD-4 §9 menetapkan satu mata uang IDR, sehingga nilai monetary selalu jauh
 * di bawah `Number.MAX_SAFE_INTEGER` dan aman dikonversi ke number. Database
 * tetap memakai `Decimal(12,2)` demi akurasi akuntansi.
 *
 * Catatan: `Decimal` dari Prisma sudah `toJSON()` menjadi string, sehingga
 * pemanggil yang membaca JSON mentah (`request.json()`) aman mengoper langsung
 * ke fungsi ini.
 */
export function toNumber(value: Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const n = Number(value.toString());
  return Number.isFinite(n) ? n : 0;
}
