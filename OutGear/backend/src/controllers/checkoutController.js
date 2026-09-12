import Order from "../models/Order.js";
import {
  generateOrderNumber,
  computeDeliveryFee,
  verifyAndPriceItems,
  deductStock,
  buildServerPricing,
  restoreStock,
  canTransitionStatus,
  ORDER_STATUS,
  TAX_RATE,
} from "../services/orderService.js";
import { AppError } from "../middleware/errorHandler.js";

function canManageOrder(order, req) {
  if (req.user?.role === "admin") return true;
  if (!order.user) return true;
  return req.user && order.user.toString() === req.user._id.toString();
}

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
          user: req.user?._id || null,
          customer,
          items: lines,
          subtotal,
          tax,
          deliveryType,
          deliveryFee,
          totalAmount,
          destination,
          paymentMethod,
          status: ORDER_STATUS.waitingPayment,
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

export const payOrder = async (req, res, next) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).session(session);

    if (!order) {
      throw new AppError("Order tidak ditemukan", 404);
    }
    if (!canManageOrder(order, req)) {
      throw new AppError("Tidak berhak atas pesanan ini", 403);
    }
    if (order.status !== ORDER_STATUS.waitingPayment) {
      throw new AppError("Pesanan sudah tidak dapat dibayar", 400);
    }

    order.status = ORDER_STATUS.processed;
    order.paidAt = new Date();
    await order.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Pembayaran berhasil diproses",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const cancelOrder = async (req, res, next) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).session(session);

    if (!order) {
      throw new AppError("Order tidak ditemukan", 404);
    }
    if (!canManageOrder(order, req)) {
      throw new AppError("Tidak berhak atas pesanan ini", 403);
    }
    if (!canTransitionStatus(order.status, ORDER_STATUS.cancelled)) {
      throw new AppError(
        `Pesanan berstatus "${order.status}" tidak dapat dibatalkan`,
        400,
      );
    }

    await restoreStock(order.items, session);

    order.status = ORDER_STATUS.cancelled;
    await order.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Pesanan dibatalkan dan stok dikembalikan",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: orders,
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

export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
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

export const updateOrderStatus = async (req, res, next) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const { orderNumber } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({ orderNumber }).session(session);
    if (!order) {
      throw new AppError("Order tidak ditemukan", 404);
    }

    if (!canTransitionStatus(order.status, status)) {
      throw new AppError(
        `Transisi status dari "${order.status}" ke "${status}" tidak valid`,
        400,
      );
    }

    if (status === ORDER_STATUS.cancelled) {
      await restoreStock(order.items, session);
    }

    order.status = status;
    if (status === ORDER_STATUS.processed && !order.paidAt) {
      order.paidAt = new Date();
    }
    await order.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Status pesanan diperbarui",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};