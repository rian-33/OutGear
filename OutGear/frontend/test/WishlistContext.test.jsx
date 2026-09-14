import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { WishlistProvider, useWishlist } from "../src/context/WishlistContext.jsx";

const product = {
  id: "tenda-1",
  name: "Tenda 2 Person",
  category: "tenda",
  rentPrice: 60000,
  buyPrice: 850000,
  stock: 5,
};

function Harness() {
  const { count, isWishlisted, toggleWishlist } = useWishlist();
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="listed">{String(isWishlisted(product))}</span>
      <button onClick={() => toggleWishlist(product)}>toggle</button>
    </div>
  );
}

function renderWishlist() {
  return render(
    <WishlistProvider>
      <Harness />
    </WishlistProvider>,
  );
}

describe("WishlistContext", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("starts empty", () => {
    renderWishlist();
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("listed").textContent).toBe("false");
  });

  it("toggles an item on and off", () => {
    renderWishlist();
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("listed").textContent).toBe("true");

    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("listed").textContent).toBe("false");
  });

  it("persists and restores items from localStorage", () => {
    const { unmount } = renderWishlist();
    fireEvent.click(screen.getByText("toggle"));
    expect(screen.getByTestId("count").textContent).toBe("1");
    unmount();

    renderWishlist();
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("listed").textContent).toBe("true");
  });
});