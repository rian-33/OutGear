import Order from "../models/Order.js";
import {
  generateOrderNumber,
  computeDeliveryFee,
  verifyAndPriceItems,
  deductStock,
  buildServerPricing,
  TAX_RATE,
} from "../services/orderService.js";
import { AppError } from "../middleware/errorHandler.js";

export const createOrder = async (req, res, next) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const { customer, items, destination, deliveryType, paymentMethod } = req.body;

    const { lines, subtotal } = await verifyAndPriceItems(items, session);
    await deductStock(items, session);

    const deliveryFee =
      deliveryType === "pickup" ? 0 : computeDeliveryFee(destination);
    const tax = Math.round(subtotal * TAX_RATE);
    const totalAmount = subtotal + tax + deliveryFee;

    const serverPricing = buildServerPricing(req.body, {
      lines,
      subtotal,
      tax,
      deliveryFee,
      totalAmount,
    });

    const [newOrder] = await Order.create(
      [
        {
          orderNumber: generateOrderNumber(),
          customer,
          items: lines,
          subtotal,
          tax,
          deliveryType,
          deliveryFee,
          totalAmount,
          destination,
          paymentMethod,
          status: "Menunggu Pembayaran",
          serverPricing,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat",
      data: newOrder,
      serverPricing,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      throw new AppError("Nomor pesanan wajib diisi", 400);
    }

    const order = await Order.findOne({ orderNumber });

    if (!order) {
      throw new AppError("Order tidak ditemukan", 404);
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};