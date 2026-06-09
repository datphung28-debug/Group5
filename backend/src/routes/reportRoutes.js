import express from "express";
import { getDashboard, getRevenueReport, getTopMedicines, getInventoryReport } from "../controllers/reportController.js";
import { protect, staffOnly, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, staffOnly);

router.get("/dashboard", getDashboard);
router.get("/revenue", adminOnly, getRevenueReport);
router.get("/top-medicines", adminOnly, getTopMedicines);
router.get("/inventory", adminOnly, getInventoryReport);

export default router;
