import express from "express";
import { getSales, getSaleById, createSale, cancelSale } from "../controllers/saleController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, staffOnly);

router.get("/", getSales);
router.get("/:id", getSaleById);
router.post("/", createSale);
router.put("/:id/cancel", cancelSale);

export default router;
