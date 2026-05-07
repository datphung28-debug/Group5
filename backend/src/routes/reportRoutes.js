import express from "express";
import { getDashboard, getRevenueReport, getTopMedicines, getInventoryReport } from "../controllers/reportController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, staffOnly);

router.get("/dashboard", getDashboard);
router.get("/revenue", getRevenueReport);
router.get("/top-medicines", getTopMedicines);
router.get("/inventory", getInventoryReport);

export default router;
