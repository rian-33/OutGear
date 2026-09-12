import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import User from "./models/User.js";
import { products } from "./data/products.js"; // File data dummy awal Anda

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Menghapus data lama...");
    await Product.deleteMany({});
    await User.deleteMany({ role: "admin" });

    console.log("Memasukkan data produk...");
    await Product.insertMany(
      products.map((p) => ({
        ...p,
        description: "",
        category: p.category.toLowerCase(),
      })),
    );

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@outgear.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      console.log("Memasukkan akun admin default...");
      await User.create({
        name: "Admin OutGear",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        phone: "",
        address: "",
      });
    } else {
      console.log("Akun admin sudah ada, dilewati.");
    }

    console.log("✅ Seed berhasil!");
    process.exit();
  })
  .catch((err) => {
    console.error("Gagal melakukan seed:", err);
    process.exit(1);
  });