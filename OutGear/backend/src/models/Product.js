import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: { type: String, required: true, trim: true },
    buyPrice: { type: Number, required: true, min: 0 },
    rentPrice: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    store: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);
