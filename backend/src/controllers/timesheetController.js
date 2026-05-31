import Timesheet from "../models/Timesheet.js";
import User from "../models/User.js";
import { sendErrorResponse } from "../utils/errorResponse.js";

// @GET /api/timesheet - Lấy danh sách chấm công
export const getTimesheets = async (req, res) => {
  try {
    const { startDate, endDate, staffId, status, method } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.date = { $gte: startDate };
    } else if (endDate) {
      filter.date = { $lte: endDate };
    }

    if (req.user.role !== "admin") {
      filter.staff = req.user._id;
    } else if (staffId && staffId !== "all") {
      filter.staff = staffId;
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (method && method !== "all") {
      filter.method = method;
    }

    const timesheets = await Timesheet.find(filter)
      .populate("staff", "name role")
      .sort({ date: -1, checkIn: -1 });

    res.json({ timesheets });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @POST /api/timesheet - Tạo/Ghi nhận chấm công mới (Check-in)
export const createTimesheet = async (req, res) => {
  try {
    const { date, staffId, shift, scheduledTime, checkIn, checkOut, workHours, overtimeHours, status, method, note } = req.body;

    if (!date || !staffId || !shift || !scheduledTime || !checkIn) {
      return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin bắt buộc" });
    }

    const staffUser = await User.findById(staffId);
    if (!staffUser) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    // Kiểm tra xem đã có ca chấm công này trong ngày chưa
    const existing = await Timesheet.findOne({ date, staff: staffId, shift });
    if (existing) {
      return res.status(400).json({ message: "Nhân viên đã chấm công ca này trong ngày hôm nay" });
    }

    const newTimesheet = await Timesheet.create({
      date,
      staff: staffId,
      shift,
      scheduledTime,
      checkIn,
      checkOut: checkOut || null,
      workHours: workHours || 0,
      overtimeHours: overtimeHours || 0,
      status: status || "missing",
      method: method || "pos",
      note: note || "",
    });

    const populated = await newTimesheet.populate("staff", "name role");
    res.status(201).json({ timesheet: populated, message: "Ghi nhận chấm công thành công" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @PUT /api/timesheet/:id - Cập nhật chấm công (Check-out hoặc Sửa đổi)
export const updateTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const timesheet = await Timesheet.findById(id);
    if (!timesheet) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi chấm công" });
    }

    if (updateData.staffId) {
      const staffUser = await User.findById(updateData.staffId);
      if (!staffUser) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }
      updateData.staff = updateData.staffId;
    }

    const updated = await Timesheet.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate("staff", "name role");

    res.json({ timesheet: updated, message: "Cập nhật chấm công thành công" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};

// @DELETE /api/timesheet/:id - Xóa bản ghi chấm công
export const deleteTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const timesheet = await Timesheet.findById(id);
    if (!timesheet) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi chấm công" });
    }

    await Timesheet.findByIdAndDelete(id);
    res.json({ message: "Đã xóa bản ghi chấm công thành công" });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
