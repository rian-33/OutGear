import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";

export async function protect(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      throw new AppError("Anda harus login terlebih dahulu", 401);
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(payload.sub);
    if (!user) {
      throw new AppError("Akun tidak ditemukan", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Sesi berakhir, silakan login kembali", 401));
    }
    return next(new AppError("Token tidak valid", 401));
  }
}

export function adminOnly(req, _res, next) {
  if (req.user?.role !== "admin") {
    return next(new AppError("Akses khusus admin", 403));
  }
  next();
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}