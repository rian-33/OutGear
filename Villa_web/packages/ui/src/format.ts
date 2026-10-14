const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format angka/nominal menjadi Rupiah (PRD-4 §6.2: tabular-nums utk rupiah).
 * Menerima number atau string desimal (Prisma Decimal via JSON).
 */
export function formatRupiah(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(n)) return 'Rp 0';
  return IDR_FORMATTER.format(n);
}

const DATE_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Makassar',
});

/** Format tanggal ke gaya Indonesia, selalu dalam zona Asia/Makassar. */
export function formatTanggal(date: string | Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : new Date(date);
  return DATE_FORMATTER.format(d);
}

/** '2026-09' → 'September 2026' (periode tagihan, PRD-3 FR-16). */
export function formatPeriode(periode: string): string {
  const [year, month] = periode.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) return periode;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Sisa hari dari tanggal (positif = masih menuju ke depan). */
export function sisaHari(target: string | Date): number {
  const t = typeof target === 'string' ? new Date(target) : target;
  const diff = t.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
