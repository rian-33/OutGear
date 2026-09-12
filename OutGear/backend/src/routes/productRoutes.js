import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { validate, productSchema, productUpdateSchema } from "../middleware/validate.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", protect, adminOnly, validate(productSchema), createProduct);
router.put("/:id", protect, adminOnly, validate(productUpdateSchema), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
