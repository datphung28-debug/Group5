import express from "express";
import { getSchedules, createSchedule, updateSchedule, deleteSchedule, copyWeekSchedules, autoAssignSchedules } from "../controllers/scheduleController.js";
import { protect, staffOnly, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // Tất cả các endpoint đều yêu cầu đăng nhập

// Cả admin và dược sĩ đều được xem lịch phân ca
router.get("/", staffOnly, getSchedules);

// Chỉ admin được phép chỉnh sửa lịch phân ca
router.post("/", staffOnly, adminOnly, createSchedule);
router.put("/:id", staffOnly, adminOnly, updateSchedule);
router.delete("/:id", staffOnly, adminOnly, deleteSchedule);
router.post("/copy-week", staffOnly, adminOnly, copyWeekSchedules);
router.post("/auto-assign", staffOnly, adminOnly, autoAssignSchedules);

export default router;
