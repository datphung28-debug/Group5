import express from "express";
import { login, register, getMe, changePassword } from "../controllers/authController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", protect, adminOnly, register); // Chỉ admin tạo tài khoản
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

export default router;
