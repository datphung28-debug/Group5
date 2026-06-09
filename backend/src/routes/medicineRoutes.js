import express from "express";
import {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getExpiringMedicines,
} from "../controllers/medicineController.js";
import { protect, staffOnly, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, staffOnly, getMedicines);
router.get("/expiring", protect, staffOnly, getExpiringMedicines);
router.get("/:id", protect, staffOnly, getMedicineById);
router.post("/", protect, adminOnly, createMedicine);
router.put("/:id", protect, adminOnly, updateMedicine);
router.delete("/:id", protect, adminOnly, deleteMedicine);

export default router;
