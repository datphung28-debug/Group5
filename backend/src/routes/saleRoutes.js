import express from "express";
import { getSales, getSaleById, createSale, cancelSale } from "../controllers/saleController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route cho Hóa đơn điện tử
router.get("/public/:id", getSaleById);

router.use(protect, staffOnly);

router.get("/", getSales);
router.get("/:id", getSaleById);
router.post("/", createSale);
router.put("/:id/cancel", cancelSale);

export default router;
