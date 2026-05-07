import express from "express";
import { getImports, getImportById, createImport } from "../controllers/importController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, staffOnly);

router.get("/", getImports);
router.get("/:id", getImportById);
router.post("/", createImport);

export default router;
