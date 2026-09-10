import crypto from "node:crypto";
import Product from "../models/Product.js";
import { AppError } from "../middleware/errorHandler.js";
import { calculateDistanceKm, calculateDeliveryFee } from "../utils/distance.js";

export const RENT_DEPOSIT = 50000;
export const STORE_COORDS = { lat: -5.1477, lng: 119.4327 };
export const FLAT_DELIVERY_FEE = 50000;
export const TAX_RATE = 0.1;

export function generateOrderNumber() {
  const prefix = "OG";
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

export function computeDeliveryFee(destination) {
  if (
    destination &&
    Number.isFinite(Number(destination.lat)) &&
    Number.isFinite(Number(destination.lng))
  ) {
    const distance = calculateDistanceKm(
      STORE_COORDS.lat,
      STORE_COORDS.lng,
      Number(destination.lat),
      Number(destination.lng),
    );
    return calculateDeliveryFee(distance);
  }
  return FLAT_DELIVERY_FEE;
}

export async function verifyAndPriceItems(items, session) {
  const lines = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findOne({ id: item.productId }).session(session);

    if (!product) {
      throw new AppError(`Produk ${item.name} tidak ditemukan`, 404);
    }

    if (product.stock < item.quantity) {
      throw new AppError(
        `Stok ${product.name} tidak mencukupi. Sisa: ${product.stock}`,
        400,
      );
    }

    let linePrice;
    let lineDeposit = 0;
    if (item.mode === "rent") {
      const duration = item.duration && item.duration >= 1 ? item.duration : 1;
      linePrice = product.rentPrice * duration;
      lineDeposit = RENT_DEPOSIT;
    } else {
      linePrice = product.buyPrice;
    }

    const lineTotal = (linePrice + lineDeposit) * item.quantity;
    subtotal += lineTotal;

    lines.push({
      productId: item.productId,
      name: product.name,
      mode: item.mode,
      quantity: item.quantity,
      price: linePrice,
      deposit: lineDeposit,
      duration: item.mode === "rent" ? item.duration ?? 1 : 1,
      startDate: item.startDate,
      endDate: item.endDate,
    });
  }

  return { lines, subtotal };
}

export async function deductStock(items, session) {
  for (const item of items) {
    const result = await Product.updateOne(
      { id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { session },
    );

    if (result.matchedCount === 0) {
      const product = await Product.findOne({ id: item.productId }).session(session);
      throw new AppError(
        `Stok ${product?.name || item.name} tidak mencukupi. Sisa: ${product?.stock ?? 0}`,
        400,
      );
    }
  }
}

export function buildServerPricing(clientBody, pricing) {
  const { subtotal, tax, deliveryFee, totalAmount, lines } = pricing;
  const round = (n) => Math.round(Number(n) || 0);

  const serverVerified =
    round(clientBody?.totalAmount) === round(totalAmount) &&
    round(clientBody?.subtotal ?? subtotal) === round(subtotal) &&
    round(clientBody?.tax ?? tax) === round(tax) &&
    round(clientBody?.deliveryFee ?? deliveryFee) === round(deliveryFee);

  return {
    subtotal,
    tax,
    deliveryFee,
    totalAmount,
    lines,
    serverVerified,
  };
}

export async function processOrder(items, session) {
  const { lines, subtotal } = await verifyAndPriceItems(items, session);
  await deductStock(items, session);
  return { lines, subtotal };
}