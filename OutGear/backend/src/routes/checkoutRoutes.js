import { Router } from "express";
import {
  createOrder,
  getOrder,
  payOrder,
  cancelOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/checkoutController.js";
import { validate, orderSchema, orderStatusSchema } from "../middleware/validate.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.post("/", validate(orderSchema), createOrder);
router.get("/orders/me", protect, getMyOrders);
router.get("/orders", protect, adminOnly, getAllOrders);
router.patch(
  "/orders/:orderNumber/status",
  protect,
  adminOnly,
  validate(orderStatusSchema),
  updateOrderStatus,
);
router.post("/:orderNumber/pay", protect, payOrder);
router.post("/:orderNumber/cancel", protect, cancelOrder);
router.get("/:orderNumber", getOrder);

export default router;