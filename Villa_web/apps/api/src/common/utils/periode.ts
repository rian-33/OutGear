/**
 * Utilitas periode tagihan — format `YYYY-MM` (PRD-3 §2, kolom `tagihan.periode`).
 * Seluruh perhitungan memakai zona waktu kos `Asia/Makassar` (PRD-4 §9).
 */

const PERIODE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidPeriode(value: string): boolean {
  return PERIODE_PATTERN.test(value);
}

/** Tahun & bulan berjalan pada zona waktu kos. */
export function periodeSekarang(now: Date = new Date()): string {
  const bagian = formatter.formatToParts(now);
  const tahun = bagian.find((p) => p.type === 'year')?.value ?? '1970';
  const bulan = bagian.find((p) => p.type === 'month')?.value ?? '01';
  return `${tahun}-${bulan}`;
}

/** Geser periode sebesar `jumlah` bulan (boleh negatif). */
export function geserPeriode(periode: string, jumlah: number): string {
  if (!isValidPeriode(periode)) throw new Error(`Periode tidak valid: ${periode}`);
  const [tahun, bulan] = periode.split('-').map(Number);
  const total = tahun * 12 + (bulan - 1) + jumlah;
  const tahunBaru = Math.floor(total / 12);
  const bulanBaru = ((total % 12) + 12) % 12;
  return `${tahunBaru}-${String(bulanBaru + 1).padStart(2, '0')}`;
}

/**
 * Tanggal jatuh tempo tagihan: tanggal 10 pada bulan berjalan, pukul 08:00
 * WITA. Dinyatakan sebagai 00:00 UTC — setara 08:00 WITA — sehingga kalkulasi
 * tidak bergantung pada mapping zona waktu/DST di server.
 */
export function jatuhTempoPeriode(periode: string, hari: number = 10): Date {
  if (!isValidPeriode(periode)) throw new Error(`Periode tidak valid: ${periode}`);
  const [tahun, bulan] = periode.split('-').map(Number);
  // 00.00 UTC == 08.00 WITA (WITA = UTC+8), tanpa offset manual.
  return new Date(Date.UTC(tahun, bulan - 1, Math.min(hari, 28)));
}

const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Makassar',
  year: 'numeric',
  month: '2-digit',
});
