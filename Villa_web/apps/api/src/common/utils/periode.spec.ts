import { geserPeriode, isValidPeriode, jatuhTempoPeriode, periodeSekarang } from './periode';

describe('isValidPeriode', () => {
  it('menerima format YYYY-MM yang valid', () => {
    expect(isValidPeriode('2026-01')).toBe(true);
    expect(isValidPeriode('1999-12')).toBe(true);
  });

  it('menolak bulan di luar 01–12 dan format salah', () => {
    expect(isValidPeriode('2026-00')).toBe(false);
    expect(isValidPeriode('2026-13')).toBe(false);
    expect(isValidPeriode('2026-1')).toBe(false);
    expect(isValidPeriode('2026')).toBe(false);
    expect(isValidPeriode('2026-12-01')).toBe(false);
    expect(isValidPeriode('abc-def')).toBe(false);
  });
});

describe('geserPeriode', () => {
  it('menggeser maju', () => {
    expect(geserPeriode('2026-01', 1)).toBe('2026-02');
    expect(geserPeriode('2026-12', 1)).toBe('2027-01');
  });

  it('menggeser mundur', () => {
    expect(geserPeriode('2026-01', -1)).toBe('2025-12');
    expect(geserPeriode('2026-06', -5)).toBe('2026-01');
  });

  it('nilai 0 tidak mengubah apa pun', () => {
    expect(geserPeriode('2030-03', 0)).toBe('2030-03');
  });

  it('melempar error untuk periode tidak valid', () => {
    expect(() => geserPeriode('2026-13', 1)).toThrow('Periode tidak valid');
  });
});

describe('periOdeSekarang', () => {
  it('menggunakan zona waktu Asia/Makassar (UTC+8)', () => {
    // 2026-09-30 20:00 UTC sudah masuk 2026-10-01 di Makassar.
    expect(periodeSekarang(new Date('2026-09-30T20:00:00Z'))).toBe('2026-10');
    // 2026-09-30 15:00 UTC masih 2026-09-30 di Makassar.
    expect(periodeSekarang(new Date('2026-09-30T15:00:00Z'))).toBe('2026-09');
  });
});

describe('jatuhTempoPeriode', () => {
  it('jatuh tempo pukul 08:00 WITA = 00:00 UTC pada tanggal 10', () => {
    expect(jatuhTempoPeriode('2026-09').toISOString()).toBe('2026-09-10T00:00:00.000Z');
  });

  it('menghormati parameter hari khusus', () => {
    expect(jatuhTempoPeriode('2026-01', 5).toISOString()).toBe('2026-01-05T00:00:00.000Z');
  });

  it('membatasi hari maksimal 28 (aman untuk bulan Februari)', () => {
    expect(jatuhTempoPeriode('2026-02', 31).toISOString()).toBe('2026-02-28T00:00:00.000Z');
  });

  it('melempar error untuk periode tidak valid', () => {
    expect(() => jatuhTempoPeriode('2026-00')).toThrow('Periode tidak valid');
  });
});
