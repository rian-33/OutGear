import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CartProvider, useCart } from "../src/context/CartContext.jsx";

function Harness() {
  const { cart, total, itemCount, totalDeposit, addToCart, removeFromCart, clearCart } =
    useCart();

  return (
    <div>
      <span data-testid="count">{itemCount}</span>
      <span data-testid="total">{total}</span>
      <span data-testid="deposit">{totalDeposit}</span>
      <span data-testid="cartLen">{cart.length}</span>
      <button
        onClick={() =>
          addToCart(
            { id: "tenda", name: "Tenda", rentPrice: 50000, buyPrice: 900000, stock: 2 },
            "rent",
            5,
            { duration: 2, startDate: "2026-09-01", endDate: "2026-09-03" },
          )
        }
      >
        addRent
      </button>
      <button
        onClick={() =>
          addToCart({ id: "kompor", name: "Kompor", rentPrice: 0, buyPrice: 200000, stock: 1 }, "buy", 3)
        }
      >
        addBuy
      </button>
      <button onClick={() => removeFromCart(cart[0]?.cartId)}>removeFirst</button>
      <button onClick={() => clearCart()}>clear</button>
    </div>
  );
}

function renderHarness() {
  return render(
    <CartProvider>
      <Harness />
    </CartProvider>,
  );
}

describe("CartContext", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("caps quantity at stock for rental items", () => {
    renderHarness();
    fireEvent.click(screen.getByText("addRent"));

    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("total").textContent).toBe("300000");
    expect(screen.getByTestId("deposit").textContent).toBe("100000");
  });

  it("caps quantity at stock for buy items and accumulates totals", () => {
    renderHarness();
    fireEvent.click(screen.getByText("addRent"));
    fireEvent.click(screen.getByText("addBuy"));

    expect(screen.getByTestId("count").textContent).toBe("3");
    expect(screen.getByTestId("cartLen").textContent).toBe("2");
    expect(screen.getByTestId("total").textContent).toBe("500000");
  });

  it("removes and clears items", () => {
    renderHarness();
    fireEvent.click(screen.getByText("addRent"));
    fireEvent.click(screen.getByText("removeFirst"));
    expect(screen.getByTestId("cartLen").textContent).toBe("0");

    fireEvent.click(screen.getByText("addRent"));
    fireEvent.click(screen.getByText("clear"));
    expect(screen.getByTestId("cartLen").textContent).toBe("0");
    expect(screen.getByTestId("count").textContent).toBe("0");
  });
});