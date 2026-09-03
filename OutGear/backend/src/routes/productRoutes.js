import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = Router();

// Middleware Logging Khusus Produk
router.use((req, res, next) => {
  console.log(`Product route: ${req.method} ${req.path}`);
  next();
});

// GET routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// POST, PUT, DELETE routes
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
