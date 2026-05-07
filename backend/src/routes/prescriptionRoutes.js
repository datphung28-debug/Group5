import express from "express";
import {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
} from "../controllers/prescriptionController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, staffOnly);

router.get("/", getPrescriptions);
router.get("/:id", getPrescriptionById);
router.post("/", createPrescription);
router.put("/:id", updatePrescription);

export default router;
