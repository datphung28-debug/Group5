import express from "express";
import { createCashbookTransaction, getCashbook } from "../controllers/cashbookController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, staffOnly);

router.get("/", getCashbook);
router.post("/", createCashbookTransaction);

export default router;
