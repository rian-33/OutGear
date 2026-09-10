import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { validate, productSchema, productUpdateSchema } from "../middleware/validate.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

router.post("/", validate(productSchema), createProduct);
router.put("/:id", validate(productUpdateSchema), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
