import { describe, it, expect } from "vitest";
import { formatRupiah } from "../src/utils/productImages.js";

describe("formatRupiah", () => {
  it("formats numbers with id-ID separators", () => {
    expect(formatRupiah(1234567)).toBe("1.234.567");
  });

  it("handles zero", () => {
    expect(formatRupiah(0)).toBe("0");
  });

  it("returns 0 for null/undefined", () => {
    expect(formatRupiah(null)).toBe("0");
    expect(formatRupiah(undefined)).toBe("0");
  });
});