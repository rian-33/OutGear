import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { ToastProvider } from "../src/components/Toast.jsx";
import OrderTracking from "../src/pages/OrderTracking.jsx";

const mocks = vi.hoisted(() => ({
  getOrder: vi.fn(),
  getMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  updateMe: vi.fn(),
  getToken: vi.fn(),
  setToken: vi.fn(),
}));

vi.mock("../src/services/api.js", () => ({
  api: {
    getOrder: mocks.getOrder,
    getMe: mocks.getMe,
    login: mocks.login,
    register: mocks.register,
    updateMe: mocks.updateMe,
  },
  getToken: mocks.getToken,
  setToken: mocks.setToken,
}));

const order = {
  orderNumber: "OG-TEST123",
  status: "Menunggu Pembayaran",
  customer: { name: "Tono", phone: "08123", address: "Jl. Merdeka" },
  items: [
    {
      name: "Tenda 2p",
      quantity: 1,
      mode: "rent",
      duration: 3,
      price: 60000,
      deposit: 50000,
    },
  ],
  subtotal: 330000,
  tax: 33000,
  deliveryType: "pickup",
  deliveryFee: 0,
  totalAmount: 363000,
  paymentMethod: "credit-card",
};

describe("OrderTracking", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.getToken.mockReturnValue(null);
    mocks.getMe.mockRejectedValue(new Error("no session"));
  });

  function renderTracking() {
    return render(
      <MemoryRouter initialEntries={[`/order/${order.orderNumber}`]}>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/order/:orderNumber" element={<OrderTracking />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>,
    );
  }

  it("shows order details and pay button for guest orders", async () => {
    mocks.getOrder.mockResolvedValue({ success: true, data: order });
    renderTracking();

    expect(await screen.findByText("OG-TEST123")).toBeTruthy();
    expect(screen.getByText(/Menunggu Pembayaran/)).toBeTruthy();
    expect(screen.getByText("Tenda 2p")).toBeTruthy();
    expect(screen.getByText(/Bayar Sekarang/)).toBeTruthy();
    expect(screen.getByText(/Rp 363\.000/)).toBeTruthy();
  });

  it("shows a not-found state when order is missing", async () => {
    mocks.getOrder.mockResolvedValue({ success: true, data: null });
    renderTracking();

    expect(await screen.findByText(/Pesanan tidak ditemukan/)).toBeTruthy();
  });
});