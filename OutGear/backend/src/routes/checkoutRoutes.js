import { Router } from "express";
import {
  createOrder,
  getOrder,
} from "../controllers/checkoutController.js";
import { validate, orderSchema } from "../middleware/validate.js";

const router = Router();

router.post("/", validate(orderSchema), createOrder);
router.get("/:orderNumber", getOrder);

export default router;
