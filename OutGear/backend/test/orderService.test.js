import { describe, it, expect } from "vitest";
import {
  generateOrderNumber,
  computeDeliveryFee,
  buildServerPricing,
  RENT_DEPOSIT,
  FLAT_DELIVERY_FEE,
} from "../src/services/orderService.js";

describe("generateOrderNumber", () => {
  it("produces unique OG-prefixed numbers", () => {
    const seen = new Set();
    for (let i = 0; i < 1000; i += 1) {
      const n = generateOrderNumber();
      expect(n.startsWith("OG-")).toBe(true);
      expect(seen.has(n)).toBe(false);
      seen.add(n);
    }
  });
});

describe("computeDeliveryFee", () => {
  it("uses distance-based fee when destination matches format", () => {
    // same as store location -> only base fee from calculateDeliveryFee
    expect(computeDeliveryFee({ lat: -5.1477, lng: 119.4327 })).toBe(10000);
  });

  it("falls back to flat fee when no destination", () => {
    expect(computeDeliveryFee(null)).toBe(FLAT_DELIVERY_FEE);
    expect(computeDeliveryFee(undefined)).toBe(FLAT_DELIVERY_FEE);
  });

  it("falls back to flat fee for invalid coordinates", () => {
    expect(computeDeliveryFee({ lat: "abc", lng: 1 })).toBe(FLAT_DELIVERY_FEE);
  });
});

describe("buildServerPricing", () => {
  const pricing = {
    subtotal: 330000,
    tax: 33000,
    deliveryFee: 50000,
    totalAmount: 413000,
    lines: [],
  };

  it("marks verified when client totals match server totals", () => {
    const result = buildServerPricing(
      { subtotal: 330000, tax: 33000, deliveryFee: 50000, totalAmount: 413000 },
      pricing,
    );
    expect(result.serverVerified).toBe(true);
    expect(result.totalAmount).toBe(413000);
  });

  it("marks unverified when totals differ", () => {
    const result = buildServerPricing(
      { subtotal: 1, tax: 0, deliveryFee: 0, totalAmount: 1 },
      pricing,
    );
    expect(result.serverVerified).toBe(false);
  });

  it("treats missing optional client values as agreeing with server", () => {
    const result = buildServerPricing({ totalAmount: 413000 }, pricing);
    expect(result.serverVerified).toBe(true);
  });
});

describe("RENT_DEPOSIT", () => {
  it("is 50000 IDR for rentals", () => {
    expect(RENT_DEPOSIT).toBe(50000);
  });
});