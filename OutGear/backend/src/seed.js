import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import { products } from "./data/products.js"; // File data dummy awal Anda

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Menghapus data lama...");
    await Product.deleteMany({});

    console.log("Memasukkan data baru...");
    await Product.insertMany(products);

    console.log("✅ Seed berhasil!");
    process.exit();
  })
  .catch((err) => {
    console.error("Gagal melakukan seed:", err);
    process.exit(1);
  });
