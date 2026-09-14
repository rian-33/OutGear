import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Kategori from "../src/pages/Kategori.jsx";
import { api } from "../src/services/api.js";

vi.mock("../src/services/api.js", () => ({
  api: { getProducts: vi.fn() },
}));

const products = [
  {
    id: "a",
    name: "Tenda 2 Person",
    category: "tenda",
    rentPrice: 60000,
    buyPrice: 850000,
    stock: 5,
  },
  {
    id: "a2",
    name: "Tenda 4 Person",
    category: "tenda",
    rentPrice: 90000,
    buyPrice: 1400000,
    stock: 3,
  },
  {
    id: "b",
    name: "Headlamp LED",
    category: "lampu",
    rentPrice: 20000,
    buyPrice: 250000,
    stock: 8,
  },
];

function renderKategori() {
  return render(
    <MemoryRouter initialEntries={["/kategori"]}>
      <Routes>
        <Route path="/kategori" element={<Kategori />} />
        <Route path="/products" element={<div>PRODUCTS_PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("KategoriPage", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders all category cards", async () => {
    api.getProducts.mockResolvedValue({ data: [] });
    renderKategori();

    expect(await screen.findByText("Tenda & Shelter")).toBeInTheDocument();
    expect(screen.getByText("Carrier & Tas")).toBeInTheDocument();
    expect(screen.getByText("Sepatu & Boots")).toBeInTheDocument();
    expect(screen.getByText("Jaket & Pakaian")).toBeInTheDocument();
    expect(screen.getByText("Senter & Headlamp")).toBeInTheDocument();
  });

  it("shows live product counts from the API", async () => {
    api.getProducts.mockResolvedValue({ data: products });
    renderKategori();

    expect(await screen.findByText("2 Produk")).toBeInTheDocument();
    expect(screen.getAllByText("1 Produk")).toHaveLength(1);
  });

  it("navigates to products filtered by category on click", async () => {
    api.getProducts.mockResolvedValue({ data: [] });
    renderKategori();
    await screen.findByText("Tenda & Shelter");

    fireEvent.click(screen.getByText("Tenda & Shelter"));
    expect(screen.getByText("PRODUCTS_PAGE")).toBeInTheDocument();
  });
});