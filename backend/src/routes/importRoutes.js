import express from "express";
import { getImports, getImportById, createImport, getSuggestedImports } from "../controllers/importController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, staffOnly);

router.get("/suggest", getSuggestedImports);
router.get("/", getImports);
router.get("/:id", getImportById);
router.post("/", createImport);

export default router;
