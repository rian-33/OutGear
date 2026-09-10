import { describe, it, expect } from "vitest";
import { calculateDistanceKm, calculateDeliveryFee } from "../src/utils/distance.js";

describe("calculateDistanceKm", () => {
  it("returns 0 at the same coordinate", () => {
    expect(calculateDistanceKm(-5.1477, 119.4327, -5.1477, 119.4327)).toBe(0);
  });

  it("returns a plausible distance between Makassar and Jakarta (~1400 km)", () => {
    const km = calculateDistanceKm(-5.1477, 119.4327, -6.2088, 106.8456);
    expect(km).toBeGreaterThan(1300);
    expect(km).toBeLessThan(1500);
  });

  it("is symmetric", () => {
    const a = calculateDistanceKm(-5.1477, 119.4327, -6.2088, 106.8456);
    const b = calculateDistanceKm(-6.2088, 106.8456, -5.1477, 119.4327);
    expect(a).toBeCloseTo(b, 6);
  });
});

describe("calculateDeliveryFee", () => {
  it("charges a base fee for zero distance", () => {
    expect(calculateDeliveryFee(0)).toBe(10000);
  });

  it("adds per-km cost", () => {
    expect(calculateDeliveryFee(5)).toBe(10000 + 5 * 3000);
  });

  it("never charges negative distance", () => {
    expect(calculateDeliveryFee(-10)).toBe(10000);
  });
});