import { describe, expect, it, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

const mocks = vi.hoisted(() => ({ findById: vi.fn() }));

vi.mock("../src/models/User.js", () => ({
  default: { findById: (...args) => mocks.findById(...args) },
}));

import { protect, adminOnly, signToken } from "../src/middleware/auth.js";
import { env } from "../src/config/env.js";
import { AppError } from "../src/middleware/errorHandler.js";

function makeRes() {
  const sendStatus = vi.fn();
  return {
    status: vi.fn(() => ({ json: vi.fn() })),
    json: vi.fn(),
    sendStatus,
  };
}

describe("signToken", () => {
  it("produces a JWT containing the user id as sub", () => {
    const token = signToken("user123");
    const payload = jwt.verify(token, env.jwtSecret);
    expect(payload.sub).toBe("user123");
  });
});

describe("protect", () => {
  beforeEach(() => {
    mocks.findById.mockReset();
  });

  it("rejects requests without a Bearer header", async () => {
    const req = { headers: {} };
    const next = vi.fn();
    await protect(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].status).toBe(401);
  });

  it("rejects invalid tokens", async () => {
    const req = { headers: { authorization: "Bearer not-a-token" } };
    const next = vi.fn();
    await protect(req, makeRes(), next);
    expect(next.mock.calls[0][0].status).toBe(401);
  });

  it("attaches the user and calls next when token is valid", async () => {
    const user = { _id: { toString: () => "abc" }, name: "Tono", role: "customer" };
    mocks.findById.mockResolvedValue(user);

    const token = signToken("abc");
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = vi.fn();
    await protect(req, makeRes(), next);

    expect(mocks.findById).toHaveBeenCalledWith("abc");
    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalledWith();
  });
});

describe("adminOnly", () => {
  it("allows admin role", () => {
    const next = vi.fn();
    adminOnly({ user: { role: "admin" } }, makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects non-admin roles", () => {
    const next = vi.fn();
    adminOnly({ user: { role: "customer" } }, makeRes(), next);
    expect(next.mock.calls[0][0].status).toBe(403);
  });
});