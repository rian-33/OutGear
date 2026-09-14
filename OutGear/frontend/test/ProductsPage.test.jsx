import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Products from "../src/pages/Products.jsx";
import { CartProvider } from "../src/context/CartContext.jsx";
import { WishlistProvider } from "../src/context/WishlistContext.jsx";
import { ToastProvider } from "../src/components/Toast.jsx";
import { api } from "../src/services/api.js";

vi.mock("../src/services/api.js", () => ({
  api: { getProducts: vi.fn() },
}));

const products = [
  {
    id: "p1",
    name: "Tenda Tersedia",
    category: "tenda",
    rentPrice: 60000,
    buyPrice: 850000,
    stock: 3,
  },
  {
    id: "p2",
    name: "Kompor Portable",
    category: "peralatan",
    rentPrice: 35000,
    buyPrice: 450000,
    stock: 4,
  },
];

function renderProducts() {
  return render(
    <MemoryRouter initialEntries={["/products"]}>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <Products />
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe("ProductsPage", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders products from the API", async () => {
    api.getProducts.mockResolvedValue({ data: products });
    renderProducts();

    expect(await screen.findByText("Tenda Tersedia")).toBeInTheDocument();
    expect(screen.getByText("Kompor Portable")).toBeInTheDocument();
  });

  it("filters the grid interactively when a category is selected", async () => {
    api.getProducts.mockResolvedValue({ data: products });
    renderProducts();
    await screen.findByText("Tenda Tersedia");

    fireEvent.click(screen.getByRole("button", { name: /Tenda & Shelter/ }));

    expect(screen.queryByText("Kompor Portable")).toBeNull();
    expect(screen.getByText("Tenda Tersedia")).toBeInTheDocument();
  });

  it("sorts products by rent price ascending", async () => {
    api.getProducts.mockResolvedValue({ data: products });
    renderProducts();
    await screen.findByText("Tenda Tersedia");

    const select = screen.getByLabelText("Urutkan:");
    fireEvent.change(select, { target: { value: "price-low" } });

    const firstCardTitle = document.querySelector(
      ".catalog-grid .product-card h3",
    );
    expect(firstCardTitle.textContent).toBe("Kompor Portable");
  });
});