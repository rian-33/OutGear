import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Sambungkan ke MongoDB lokal atau Atlas dari file .env
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Berhasil terhubung ke Database MongoDB"))
  .catch((err) => console.error("❌ Gagal terhubung ke database:", err));
