import { describe, it, expect } from "vitest";
import { calculateLateFee } from "../src/utils/lateFee.js";

describe("calculateLateFee", () => {
  it("returns no fee when returned on time", () => {
    expect(
      calculateLateFee({ dueDate: "2026-09-01", returnedAt: "2026-09-01", dailyFee: 25000 }),
    ).toEqual({ lateDays: 0, lateFee: 0 });
  });

  it("counts full late days and fee", () => {
    expect(
      calculateLateFee({ dueDate: "2026-09-01", returnedAt: "2026-09-04", dailyFee: 25000 }),
    ).toEqual({ lateDays: 3, lateFee: 75000 });
  });

  it("never goes negative for early returns", () => {
    expect(
      calculateLateFee({ dueDate: "2026-09-05", returnedAt: "2026-09-01", dailyFee: 25000 }),
    ).toEqual({ lateDays: 0, lateFee: 0 });
  });

  it("throws on invalid dates", () => {
    expect(() =>
      calculateLateFee({ dueDate: "bukan-tanggal", returnedAt: "2026-09-01", dailyFee: 25000 }),
    ).toThrow("Tanggal tidak valid");
  });
});