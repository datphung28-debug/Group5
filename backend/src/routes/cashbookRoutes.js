import express from "express";
import { createCashbookTransaction, getCashbook } from "../controllers/cashbookController.js";
import { protect, staffOnly, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, staffOnly);

router.get("/", adminOnly, getCashbook);
router.post("/", adminOnly, createCashbookTransaction);

export default router;
