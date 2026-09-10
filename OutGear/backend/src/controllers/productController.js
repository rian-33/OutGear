import mongoose from "mongoose";
import Product from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";
import { STORE_COORDS } from "../services/orderService.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function resolveProductQuery(id) {
  return mongoose.Types.ObjectId.isValid(id)
    ? { $or: [{ _id: id }, { id }] }
    : { id };
}

function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeProductData(data, existing = {}) {
  const normalized = { ...data };
  if (normalized.name !== undefined) normalized.name = String(normalized.name).trim();
  if (normalized.category !== undefined) {
    normalized.category = String(normalized.category).trim().toLowerCase();
  }
  if (normalized.id !== undefined) {
    normalized.id = normalized.id.trim().toLowerCase();
  } else if (normalized.name && (!existing.id || existing.name !== normalized.name)) {
    normalized.id = createSlug(normalized.name);
  }
  if (!normalized.store) normalized.store = STORE_COORDS;
  return normalized;
}

export const getProducts = async (req, res, next) => {
  try {
    const { category, maxPrice, q, sort, page = 1, limit = 12 } = req.query;

    const filter = {};
    if (category) filter.category = String(category).toLowerCase();
    if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };
    if (maxPrice) {
      filter.$or = [
        { rentPrice: { $lte: Number(maxPrice) } },
        { buyPrice: { $lte: Number(maxPrice) } },
      ];
    }

    const sortObj = { createdAt: -1 };
    if (sort === "price-low") sortObj.rentPrice = 1;
    if (sort === "price-high") sortObj.rentPrice = -1;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne(resolveProductQuery(id));
    if (!product) {
      throw new AppError("Produk tidak ditemukan", 404);
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = normalizeProductData(req.body);
    const newProduct = await Product.create(productData);
    res.status(201).json({
      success: true,
      message: "Produk dibuat",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const existing = await Product.findOne(resolveProductQuery(req.params.id));
    if (!existing) {
      throw new AppError("Produk tidak ditemukan", 404);
    }

    const updateData = normalizeProductData(req.body, existing);

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: existing._id },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      message: "Produk diupdate",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findOneAndDelete(
      resolveProductQuery(req.params.id),
    );
    if (!deletedProduct) {
      throw new AppError("Produk tidak ditemukan", 404);
    }
    res.json({ success: true, message: "Produk dihapus" });
  } catch (error) {
    next(error);
  }
};