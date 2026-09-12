import User from "../models/User.js";
import { signToken } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError("Email sudah terdaftar", 409);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || "",
      address: address || "",
    });

    res.status(201).json({
      success: true,
      message: "Akun berhasil dibuat",
      data: { user: user.toSafeJSON(), token: signToken(user._id) },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Email atau password salah", 401);
    }

    res.json({
      success: true,
      message: "Login berhasil",
      data: { user: user.toSafeJSON(), token: signToken(user._id) },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const { name, phone, address, password } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (password !== undefined) updates.password = password;

    Object.assign(req.user, updates);
    await req.user.save();

    res.json({
      success: true,
      message: "Profil berhasil diperbarui",
      data: req.user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};