import { describe, it, expect } from "vitest";
import {
  fallbackProducts,
  categoryList,
  filterProducts,
  getCategoryLabel,
} from "../src/utils/fallbackData.js";

describe("fallbackProducts", () => {
  it("all categories are lowercase (aligned with backend)", () => {
    for (const p of fallbackProducts) {
      expect(p.category).toBe(p.category.toLowerCase());
    }
  });

  it("product ids are unique", () => {
    const ids = fallbackProducts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("categoryList", () => {
  it("has consistent lowercase values", () => {
    for (const c of categoryList) {
      if (c.value) expect(c.value).toBe(c.value.toLowerCase());
    }
  });
});

describe("filterProducts", () => {
  it("filters by category", () => {
    const result = filterProducts(fallbackProducts, { category: "tas" });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("carrier-60l");
  });

  it("filters by search query (case-insensitive)", () => {
    const result = filterProducts(fallbackProducts, { q: "TENDA" });
    expect(result.length).toBe(1);
    expect(result[0].id).toBe("tenda-2p");
  });

  it("filters by max price", () => {
    const result = filterProducts(fallbackProducts, { maxPrice: "60000" });
    for (const p of result) {
      expect(p.rentPrice <= 60000 || p.buyPrice <= 60000).toBe(true);
    }
  });

  it("returns everything when no filters", () => {
    expect(filterProducts(fallbackProducts, {}).length).toBe(fallbackProducts.length);
  });
});

describe("getCategoryLabel", () => {
  it("maps known value and falls back gracefully", () => {
    expect(getCategoryLabel("tenda")).toBe("Tenda & Shelter");
    expect(getCategoryLabel("unknown")).toBe("unknown");
    expect(getCategoryLabel("")).toBe("Outdoor Gear");
  });
});