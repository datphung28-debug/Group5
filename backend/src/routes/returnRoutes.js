import express from "express";
import { getReturns, createReturn, updateReturnStatus } from "../controllers/returnController.js";
import { protect, staffOnly, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, staffOnly);

router.get("/", getReturns);
router.post("/", createReturn);
router.put("/:id/status", adminOnly, updateReturnStatus);

export default router;
