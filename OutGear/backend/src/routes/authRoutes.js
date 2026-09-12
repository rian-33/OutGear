import { Router } from "express";
import {
  register,
  login,
  getMe,
  updateMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import {
  validate,
  registerSchema,
  loginSchema,
  profileUpdateSchema,
} from "../middleware/validate.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);
router.put("/me", protect, validate(profileUpdateSchema), updateMe);

export default router;