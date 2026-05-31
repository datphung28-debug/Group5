import express from "express";
import { getTimesheets, createTimesheet, updateTimesheet, deleteTimesheet } from "../controllers/timesheetController.js";
import { protect, staffOnly, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); // Tất cả các endpoint đều yêu cầu đăng nhập

// Cả admin và dược sĩ đều được xem bảng chấm công
router.get("/", staffOnly, getTimesheets);

// Nhân viên có thể chấm công vào/ra (create/update), còn admin chỉnh sửa tự do
router.post("/", staffOnly, createTimesheet);
router.put("/:id", staffOnly, updateTimesheet);
router.delete("/:id", staffOnly, adminOnly, deleteTimesheet);

export default router;
