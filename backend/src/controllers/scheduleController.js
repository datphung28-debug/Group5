import Schedule from "../models/Schedule.js";
import User from "../models/User.js";
import { sendErrorResponse } from "../utils/errorResponse.js";

// @GET /api/schedule - Lấy danh sách lịch phân ca kèm bộ lọc
export const getSchedules = async (req, res) => {
  try {
    const { startDate, endDate, staffId, shiftType, status } = req.query;
    const filter = {};

    // Bộ lọc khoảng ngày
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }

    if (staffId && staffId !== "all") {
      filter.staff = staffId;
    }
    if (shiftType && shiftType !== "all") {
      filter.shiftType = shiftType;
    }
    if (status && status !== "all") {
      filter.status = status;
    }

    const schedules = await Schedule.find(filter)
      .populate("staff", "name role")
      .sort({ date: 1, shiftType: 1 });

    res.json({ schedules });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @POST /api/schedule - Tạo ca làm mới
export const createSchedule = async (req, res) => {
  try {
    const { date, day, staffId, shiftType, area, status, note } = req.body;

    if (!date || !day || !staffId || !shiftType) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc" });
    }

    // Kiểm tra nhân viên tồn tại
    const staffUser = await User.findById(staffId);
    if (!staffUser) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    // Kiểm tra trùng ca
    const existing = await Schedule.findOne({ date, staff: staffId, shiftType });
    if (existing) {
      return res.status(400).json({ message: "Nhân viên đã có lịch làm việc trong ca này" });
    }

    const newSchedule = await Schedule.create({
      date,
      day,
      staff: staffId,
      shiftType,
      area: area || "Quầy thuốc",
      status: status || "confirmed",
      note: note || "",
    });

    const populated = await newSchedule.populate("staff", "name role");
    res.status(201).json({ schedule: populated, message: "Tạo ca làm thành công" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @PUT /api/schedule/:id - Cập nhật ca làm
export const updateSchedule = async (req, res) => {
  try {
    const { date, day, staffId, shiftType, area, status, note } = req.body;
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: "Không tìm thấy lịch làm việc" });
    }

    // Nếu đổi ca/ngày/nhân sự, kiểm tra xem có bị trùng với ca khác không
    const checkDate = date || schedule.date;
    const checkStaff = staffId || schedule.staff;
    const checkShiftType = shiftType || schedule.shiftType;

    if (
      (date && date !== schedule.date) ||
      (staffId && staffId.toString() !== schedule.staff.toString()) ||
      (shiftType && shiftType !== schedule.shiftType)
    ) {
      const existing = await Schedule.findOne({
        _id: { $ne: req.params.id },
        date: checkDate,
        staff: checkStaff,
        shiftType: checkShiftType,
      });
      if (existing) {
        return res.status(400).json({ message: "Nhân viên đã có lịch làm việc trong ca này" });
      }
    }

    if (date) schedule.date = date;
    if (day) schedule.day = day;
    if (staffId) {
      const staffUser = await User.findById(staffId);
      if (!staffUser) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }
      schedule.staff = staffId;
    }
    if (shiftType) schedule.shiftType = shiftType;
    if (area) schedule.area = area;
    if (status) schedule.status = status;
    if (note !== undefined) schedule.note = note;

    const updated = await schedule.save();
    const populated = await updated.populate("staff", "name role");
    res.json({ schedule: populated, message: "Cập nhật ca làm thành công" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @DELETE /api/schedule/:id - Xóa ca làm
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: "Không tìm thấy lịch làm việc" });
    }

    await schedule.deleteOne();
    res.json({ message: "Xóa ca làm thành công" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @POST /api/schedule/copy-week - Sao chép ca làm từ tuần này sang tuần sau
export const copyWeekSchedules = async (req, res) => {
  try {
    const { sourceStartDate } = req.body; // Ngày bắt đầu của tuần nguồn (YYYY-MM-DD), ví dụ: '2026-05-25'
    if (!sourceStartDate) {
      return res.status(400).json({ message: "Vui lòng nhập ngày bắt đầu của tuần cần sao chép" });
    }

    // Tính ngày kết thúc của tuần nguồn (sau 6 ngày)
    const srcStart = new Date(sourceStartDate);
    const srcEnd = new Date(sourceStartDate);
    srcEnd.setDate(srcEnd.getDate() + 6);

    const sourceEndDateStr = srcEnd.toISOString().split("T")[0];

    // Tìm toàn bộ ca làm trong tuần nguồn
    const sourceSchedules = await Schedule.find({
      date: { $gte: sourceStartDate, $lte: sourceEndDateStr }
    });

    if (sourceSchedules.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy ca làm nào trong tuần nguồn" });
    }

    let copiedCount = 0;
    let duplicateCount = 0;

    for (const sched of sourceSchedules) {
      // Tính ngày mới (cộng thêm 7 ngày)
      const schedDate = new Date(sched.date);
      schedDate.setDate(schedDate.getDate() + 7);
      const targetDateStr = schedDate.toISOString().split("T")[0];

      // Kiểm tra trùng
      const existing = await Schedule.findOne({
        date: targetDateStr,
        staff: sched.staff,
        shiftType: sched.shiftType,
      });

      if (!existing) {
        await Schedule.create({
          date: targetDateStr,
          day: sched.day,
          staff: sched.staff,
          shiftType: sched.shiftType,
          area: sched.area,
          status: "confirmed", // Đặt về mặc định đã xác nhận khi sao chép
          note: sched.note,
        });
        copiedCount++;
      } else {
        duplicateCount++;
      }
    }

    res.json({
      message: `Sao chép lịch tuần thành công! Đã tạo ${copiedCount} ca mới, bỏ qua ${duplicateCount} ca đã tồn tại ở tuần mới.`,
      copiedCount,
      duplicateCount,
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
