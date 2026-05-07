import express from "express";
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getUnits, createUnit, updateUnit, deleteUnit,
} from "../controllers/configController.js";
import { protect, adminOnly, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Nhóm thuốc
router.get("/categories", protect, staffOnly, getCategories);
router.post("/categories", protect, adminOnly, createCategory);
router.put("/categories/:id", protect, adminOnly, updateCategory);
router.delete("/categories/:id", protect, adminOnly, deleteCategory);

// Nhà cung cấp
router.get("/suppliers", protect, staffOnly, getSuppliers);
router.post("/suppliers", protect, adminOnly, createSupplier);
router.put("/suppliers/:id", protect, adminOnly, updateSupplier);
router.delete("/suppliers/:id", protect, adminOnly, deleteSupplier);

// Đơn vị tính
router.get("/units", protect, staffOnly, getUnits);
router.post("/units", protect, adminOnly, createUnit);
router.put("/units/:id", protect, adminOnly, updateUnit);
router.delete("/units/:id", protect, adminOnly, deleteUnit);

export default router;
