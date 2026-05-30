import express from "express";
import {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  getNationalPrescriptionByCode,
} from "../controllers/prescriptionController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";
import { scanPrescriptionWithAI } from "../utils/aiVisionOCR.js";

const router = express.Router();

router.use(protect, staffOnly);

router.get("/", getPrescriptions);
router.get("/national/:code", getNationalPrescriptionByCode);
router.get("/:id", getPrescriptionById);
router.post("/", createPrescription);
router.put("/:id", updatePrescription);

// ═══ AI Vision Scan — Nhận diện đơn thuốc bằng Gemini ═══
router.post("/scan-ai", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "Thiếu ảnh đơn thuốc (imageBase64)" });
    }

    console.log("🔍 Đang gọi AI Vision scan đơn thuốc...");
    const result = await scanPrescriptionWithAI(imageBase64, mimeType || "image/jpeg");

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    console.log("✅ AI Vision scan thành công:", result.data?.items?.length, "thuốc");
    return res.json(result);
  } catch (error) {
    console.error("❌ Scan AI Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
