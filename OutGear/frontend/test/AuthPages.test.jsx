import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { ToastProvider } from "../src/components/Toast.jsx";
import Login from "../src/pages/Login.jsx";
import Register from "../src/pages/Register.jsx";

const mocks = vi.hoisted(() => ({
  getMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  updateMe: vi.fn(),
  getToken: vi.fn(),
  setToken: vi.fn(),
}));

vi.mock("../src/services/api.js", () => ({
  api: {
    getMe: mocks.getMe,
    login: mocks.login,
    register: mocks.register,
    updateMe: mocks.updateMe,
  },
  getToken: mocks.getToken,
  setToken: mocks.setToken,
}));

function submitForm(fieldPlaceholder) {
  const input = screen.getByPlaceholderText(fieldPlaceholder);
  fireEvent.submit(input.closest("form"));
}

function renderWithProviders(ui, path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path={path} element={ui} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe("Login page validation", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.getToken.mockReturnValue(null);
  });

  it("rejects invalid email", async () => {
    renderWithProviders(<Login />, "/login");
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "bukan-email" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "rahasia123" },
    });
    submitForm("Email");

    expect(await screen.findByText("Email tidak valid")).toBeTruthy();
    expect(mocks.login).not.toHaveBeenCalled();
  });

  it("rejects empty password", async () => {
    renderWithProviders(<Login />, "/login");
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "a@b.com" },
    });
    submitForm("Email");

    expect(await screen.findByText("Password wajib diisi")).toBeTruthy();
    expect(mocks.login).not.toHaveBeenCalled();
  });
});

describe("Register page validation", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.getToken.mockReturnValue(null);
  });

  it("rejects empty name", async () => {
    renderWithProviders(<Register />, "/register");
    submitForm("Nama Lengkap");

    expect(await screen.findByText("Nama lengkap wajib diisi")).toBeTruthy();
    expect(mocks.register).not.toHaveBeenCalled();
  });

  it("rejects short password", async () => {
    renderWithProviders(<Register />, "/register");
    fireEvent.change(screen.getByPlaceholderText("Nama Lengkap"), {
      target: { value: "Tono" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "a@b.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/), {
      target: { value: "123" },
    });
    submitForm("Nama Lengkap");

    expect(await screen.findByText("Password minimal 8 karakter")).toBeTruthy();
    expect(mocks.register).not.toHaveBeenCalled();
  });
});