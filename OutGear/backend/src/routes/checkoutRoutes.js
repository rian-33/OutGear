import { Router } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const {
      customer,
      items,
      deliveryType,
      deliveryFee,
      paymentMethod,
      totalAmount,
    } = req.body;

    // Kurangi stok di database
    for (const item of items) {
      await Product.findOneAndUpdate(
        { id: item.productId },
        { $inc: { stock: -item.quantity } },
      );
    }

    const newOrder = await Order.create({
      orderNumber: `OG-${Math.floor(Math.random() * 100000000)}`,
      customer,
      items,
      deliveryType,
      deliveryFee,
      paymentMethod,
      totalAmount,
    });

    res.status(201).json(newOrder);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Gagal memproses pesanan", error: error.message });
  }
});

// Endpoint untuk halaman konfirmasi
router.get("/:orderNumber", async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });
  res.json(order);
});

export default router;
