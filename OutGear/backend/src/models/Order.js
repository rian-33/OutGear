import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  mode: { type: String, enum: ["rent", "buy"], required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  deposit: { type: Number, default: 0, min: 0 },
  startDate: { type: String },
  endDate: { type: String },
  duration: { type: Number, min: 1, default: 1 },
});

const destinationSchema = new mongoose.Schema(
  {
    lat: { type: Number },
    lng: { type: Number },
    label: { type: String, trim: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, trim: true, lowercase: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    deliveryType: String,
    deliveryFee: { type: Number, default: 0, min: 0 },
    destination: destinationSchema,
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true },
    status: {
      type: String,
      default: "Menunggu Pembayaran",
      enum: [
        "Menunggu Pembayaran",
        "Diproses",
        "Dikirim",
        "Selesai",
        "Dibatalkan",
      ],
    },
    serverPricing: {
      subtotal: { type: Number, min: 0 },
      tax: { type: Number, min: 0 },
      deliveryFee: { type: Number, min: 0 },
      totalAmount: { type: Number, min: 0 },
      lines: [
        {
          productId: String,
          name: String,
          mode: { type: String, enum: ["rent", "buy"] },
          quantity: Number,
          price: Number,
          deposit: Number,
          duration: Number,
        },
      ],
      serverVerified: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);