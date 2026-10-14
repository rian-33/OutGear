import { Decimal } from '@prisma/client/runtime/library';
import { toNumber } from './money';

describe('toNumber', () => {
  it('mengembalikan 0 untuk null/undefined', () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
  });

  it('meneruskan number apa adanya', () => {
    expect(toNumber(250000)).toBe(250000);
    expect(toNumber(-5000)).toBe(-5000);
  });

  it('mengubah string angka', () => {
    expect(toNumber('100000')).toBe(100000);
    expect(toNumber('500.75')).toBe(500.75);
  });

  it('mengubah Decimal Prisma', () => {
    expect(toNumber(new Decimal('1250000'))).toBe(1250000);
    expect(toNumber(new Decimal('99.99'))).toBe(99.99);
  });

  it('aman untuk nilai non-angka (mis. JSON toast() dari Prisma)', () => {
    expect(toNumber('')).toBe(0);
    expect(toNumber('abc')).toBe(0);
    expect(toNumber('123abc')).toBe(0);
  });
});
