import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Tentang from "../src/pages/Tentang.jsx";
import { api } from "../src/services/api.js";

vi.mock("../src/services/api.js", () => ({
  api: { getProducts: vi.fn() },
}));

function renderTentang() {
  return render(
    <MemoryRouter>
      <Tentang />
    </MemoryRouter>,
  );
}

describe("TentangPage", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders story, vision and mission sections", () => {
    api.getProducts.mockResolvedValue({ data: [] });
    renderTentang();

    expect(screen.getByText("The Story Behind")).toBeInTheDocument();
    expect(screen.getByText("Perjalanan Kami")).toBeInTheDocument();
  });

  it("renders FAQ items", () => {
    api.getProducts.mockResolvedValue({ data: [] });
    renderTentang();

    expect(screen.getByText("Bagaimana cara menyewa alat di OutGear?")).toBeInTheDocument();
    expect(screen.getByText("Bisakah saya membeli putus alat?")).toBeInTheDocument();
  });

  it("expands and collapses FAQ answers when clicked", () => {
    api.getProducts.mockResolvedValue({ data: [] });
    renderTentang();

    const question = screen.getByText("Apakah ada deposit?");
    expect(screen.queryByText(/Rp 50\.000/)).toBeNull();

    fireEvent.click(question);
    expect(screen.getByText(/Rp 50\.000/)).toBeInTheDocument();

    fireEvent.click(question);
    expect(screen.queryByText(/Rp 50\.000/)).toBeNull();
  });
});