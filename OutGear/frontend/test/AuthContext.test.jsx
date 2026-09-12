import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "../src/context/AuthContext.jsx";

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

const customer = { id: "1", name: "Tono", email: "tono@mail.com", role: "customer" };
const admin = { id: "2", name: "Budi", email: "budi@mail.com", role: "admin" };

function Harness() {
  const { user, loading, isAdmin, login, register, logout, updateProfile } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.email : "none"}</span>
      <span data-testid="admin">{String(isAdmin)}</span>
      <button onClick={() => login({ email: "tono@mail.com", password: "rahasia123" })}>
        login
      </button>
      <button onClick={() => register({ name: "Tono", email: "tono@mail.com", password: "rahasia123" })}>
        register
      </button>
      <button onClick={logout}>logout</button>
      <button onClick={() => updateProfile({ name: "Tono Baru" })}>updateProfile</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <Harness />
    </AuthProvider>,
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("starts logged out when there is no token", async () => {
    mocks.getToken.mockReturnValue(null);
    renderAuth();
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("restores the session when a token exists", async () => {
    mocks.getToken.mockReturnValue("token");
    mocks.getMe.mockResolvedValue({ data: customer });
    renderAuth();

    expect(screen.getByTestId("loading").textContent).toBe("true");
    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("tono@mail.com"),
    );
    expect(screen.getByTestId("admin").textContent).toBe("false");
  });

  it("logs in and stores the token", async () => {
    mocks.getToken.mockReturnValue(null);
    mocks.login.mockResolvedValue({ data: { user: customer, token: "abc123" } });
    renderAuth();

    fireEvent.click(screen.getByText("login"));
    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("tono@mail.com"),
    );
    expect(mocks.setToken).toHaveBeenCalledWith("abc123");
  });

  it("detects admin role", async () => {
    mocks.getToken.mockReturnValue(null);
    mocks.login.mockResolvedValue({ data: { user: admin, token: "t" } });
    renderAuth();

    fireEvent.click(screen.getByText("login"));
    await waitFor(() =>
      expect(screen.getByTestId("admin").textContent).toBe("true"),
    );
  });

  it("logs out and clears the token", async () => {
    mocks.getToken.mockReturnValue("token");
    mocks.getMe.mockResolvedValue({ data: customer });
    renderAuth();
    await waitFor(() =>
      expect(screen.getByTestId("user").textContent).toBe("tono@mail.com"),
    );

    fireEvent.click(screen.getByText("logout"));
    expect(mocks.setToken).toHaveBeenCalledWith(null);
    expect(screen.getByTestId("user").textContent).toBe("none");
  });
});