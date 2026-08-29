import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  mode: { type: String, enum: ["rent", "buy"], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    name: String,
    phone: String,
    address: String,
  },
  items: [orderItemSchema],
  deliveryType: String,
  deliveryFee: Number,
  totalAmount: Number,
  paymentMethod: String,
  status: { type: String, default: "Menunggu Pembayaran" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Order", orderSchema);
