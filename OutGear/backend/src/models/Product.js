import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  buyPrice: { type: Number, required: true },
  rentPrice: { type: Number, required: true },
  stock: { type: Number, required: true },
  store: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

export default mongoose.model("Product", productSchema);
