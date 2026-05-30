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
    const { date, day, staffId, shiftType, area, status, note, startTime, endTime } = req.body;

    if (!date || !day || !staffId || !shiftType) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin bắt buộc" });
    }

    // Kiểm tra nhân viên tồn tại
    const staffUser = await User.findById(staffId);
    if (!staffUser) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    // Xác định startTime và endTime dựa trên shiftType nếu chưa được truyền
    let start = startTime;
    let end = endTime;
    if (!start || !end) {
      if (shiftType === 'morning') { start = '07:00'; end = '12:00'; }
      else if (shiftType === 'afternoon') { start = '12:00'; end = '17:00'; }
      else if (shiftType === 'evening') { start = '17:00'; end = '21:00'; }
      else if (shiftType === 'fulltime') { start = '07:00'; end = '21:00'; }
      else { start = '07:00'; end = '17:00'; }
    }

    if (start >= end) {
      return res.status(400).json({ message: "Giờ bắt đầu phải trước giờ kết thúc" });
    }

    // Kiểm tra trùng/gối thời gian làm việc với ca khác của cùng nhân viên
    const existing = await Schedule.findOne({
      date,
      staff: staffId,
      startTime: { $lt: end },
      endTime: { $gt: start }
    });
    if (existing) {
      return res.status(400).json({
        message: `Nhân viên đã có lịch làm việc trùng lặp thời gian trong khoảng ${existing.startTime} - ${existing.endTime}`
      });
    }

    const newSchedule = await Schedule.create({
      date,
      day,
      staff: staffId,
      shiftType,
      startTime: start,
      endTime: end,
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
    const { date, day, staffId, shiftType, area, status, note, startTime, endTime } = req.body;
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: "Không tìm thấy lịch làm việc" });
    }

    // Xác định các trường kiểm tra trùng lặp
    const checkDate = date || schedule.date;
    const checkStaff = staffId || schedule.staff;
    let checkStartTime = startTime || schedule.startTime;
    let checkEndTime = endTime || schedule.endTime;

    if (shiftType && shiftType !== schedule.shiftType && !startTime && !endTime) {
      if (shiftType === 'morning') { checkStartTime = '07:00'; checkEndTime = '12:00'; }
      else if (shiftType === 'afternoon') { checkStartTime = '12:00'; checkEndTime = '17:00'; }
      else if (shiftType === 'evening') { checkStartTime = '17:00'; checkEndTime = '21:00'; }
      else if (shiftType === 'fulltime') { checkStartTime = '07:00'; checkEndTime = '21:00'; }
      else if (shiftType === 'custom') { checkStartTime = '07:00'; checkEndTime = '17:00'; }
    }

    if (checkStartTime >= checkEndTime) {
      return res.status(400).json({ message: "Giờ bắt đầu phải trước giờ kết thúc" });
    }

    // Kiểm tra trùng/gối thời gian làm việc với ca khác của cùng nhân viên
    const existing = await Schedule.findOne({
      _id: { $ne: req.params.id },
      date: checkDate,
      staff: checkStaff,
      startTime: { $lt: checkEndTime },
      endTime: { $gt: checkStartTime },
    });
    if (existing) {
      return res.status(400).json({
        message: `Nhân viên đã có lịch làm việc trùng lặp thời gian trong khoảng ${existing.startTime} - ${existing.endTime}`
      });
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
    if (checkStartTime) schedule.startTime = checkStartTime;
    if (checkEndTime) schedule.endTime = checkEndTime;
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

      // Kiểm tra trùng theo giờ bắt đầu của ca
      const existing = await Schedule.findOne({
        date: targetDateStr,
        staff: sched.staff,
        startTime: sched.startTime,
      });

      if (!existing) {
        await Schedule.create({
          date: targetDateStr,
          day: sched.day,
          staff: sched.staff,
          shiftType: sched.shiftType,
          startTime: sched.startTime,
          endTime: sched.endTime,
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

// @POST /api/schedule/auto-assign - Tự động xếp ca làm cả tuần
export const autoAssignSchedules = async (req, res) => {
  try {
    const { startDate, strategy } = req.body;

    if (!startDate || !strategy) {
      return res.status(400).json({ message: "Vui lòng cung cấp ngày bắt đầu và chiến lược xếp ca" });
    }

    if (strategy !== 'rotate' && strategy !== 'fixed') {
      return res.status(400).json({ message: "Chiến lược xếp ca không hợp lệ" });
    }

    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setUTCDate(end.getUTCDate() + 6);
    const endDateStr = end.toISOString().split("T")[0];

    const pharmacists = await User.find({ isActive: true, role: "pharmacist" });
    if (pharmacists.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy dược sĩ nào đang hoạt động để xếp ca" });
    }

    // Xóa các ca làm cũ trong tuần này
    await Schedule.deleteMany({
      date: { $gte: startDate, $lte: endDateStr }
    });

    const shiftTypes = ['morning', 'afternoon', 'evening'];
    const shiftTimes = {
      morning: { start: '07:00', end: '12:00' },
      afternoon: { start: '12:00', end: '17:00' },
      evening: { start: '17:00', end: '21:00' }
    };
    const areas = ['Quầy thuốc', 'Quầy tư vấn', 'Kho', 'POS'];
    const weekDayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    const newSchedules = [];

    if (strategy === 'rotate') {
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setUTCDate(currentDate.getUTCDate() + d);
        const dateStr = currentDate.toISOString().split("T")[0];
        const dayKey = weekDayKeys[d];

        if (pharmacists.length >= 3) {
          // Khi số nhân viên >= 3: mỗi nhân viên làm 1 ca/ngày, xoay ca đều để phủ kín 3 ca
          pharmacists.forEach((pharmacist, index) => {
            const shiftIndex = (index + d) % shiftTypes.length;
            const shiftType = shiftTypes[shiftIndex];
            const { start: startTime, end: endTime } = shiftTimes[shiftType];
            const areaIndex = (index + d) % areas.length;
            const area = areas[areaIndex];

            newSchedules.push({
              date: dateStr,
              day: dayKey,
              staff: pharmacist._id,
              shiftType,
              startTime,
              endTime,
              area,
              status: "confirmed",
              note: "Tự động xếp ca (Xoay ca)"
            });
          });
        } else {
          // Khi số nhân viên < 3: duyệt qua cả 3 ca để chắc chắn ca nào cũng có người làm
          shiftTypes.forEach((shiftType, sIndex) => {
            const pharmacistIndex = (sIndex + d) % pharmacists.length;
            const pharmacist = pharmacists[pharmacistIndex];
            const { start: startTime, end: endTime } = shiftTimes[shiftType];
            const areaIndex = (pharmacistIndex + d) % areas.length;
            const area = areas[areaIndex];

            newSchedules.push({
              date: dateStr,
              day: dayKey,
              staff: pharmacist._id,
              shiftType,
              startTime,
              endTime,
              area,
              status: "confirmed",
              note: "Tự động xếp ca (Xoay ca)"
            });
          });
        }
      }
    } else {
      // Chiến lược Cố định (Fixed)
      if (pharmacists.length >= 3) {
        // Mỗi nhân viên làm 1 ca cố định cả tuần, phủ kín cả 3 ca
        pharmacists.forEach((pharmacist, index) => {
          const shiftIndex = index % shiftTypes.length;
          const shiftType = shiftTypes[shiftIndex];
          const { start: startTime, end: endTime } = shiftTimes[shiftType];
          
          for (let d = 0; d < 7; d++) {
            const currentDate = new Date(startDate);
            currentDate.setUTCDate(currentDate.getUTCDate() + d);
            const dateStr = currentDate.toISOString().split("T")[0];
            const dayKey = weekDayKeys[d];
            const areaIndex = (index + d) % areas.length;
            const area = areas[areaIndex];

            newSchedules.push({
              date: dateStr,
              day: dayKey,
              staff: pharmacist._id,
              shiftType,
              startTime,
              endTime,
              area,
              status: "confirmed",
              note: "Tự động xếp ca (Cố định)"
            });
          }
        });
      } else {
        // Khi số nhân viên < 3: duyệt qua cả 3 ca cho từng ngày để không trống ca
        for (let d = 0; d < 7; d++) {
          const currentDate = new Date(startDate);
          currentDate.setUTCDate(currentDate.getUTCDate() + d);
          const dateStr = currentDate.toISOString().split("T")[0];
          const dayKey = weekDayKeys[d];

          shiftTypes.forEach((shiftType, sIndex) => {
            const pharmacistIndex = sIndex % pharmacists.length;
            const pharmacist = pharmacists[pharmacistIndex];
            const { start: startTime, end: endTime } = shiftTimes[shiftType];
            const areaIndex = (pharmacistIndex + d) % areas.length;
            const area = areas[areaIndex];

            newSchedules.push({
              date: dateStr,
              day: dayKey,
              staff: pharmacist._id,
              shiftType,
              startTime,
              endTime,
              area,
              status: "confirmed",
              note: "Tự động xếp ca (Cố định)"
            });
          });
        }
      }
    }

    await Schedule.insertMany(newSchedules);

    res.status(201).json({
      message: `Tự động xếp ca thành công! Đã xếp ${newSchedules.length} ca làm việc cho ${pharmacists.length} dược sĩ.`,
      count: newSchedules.length
    });
  } catch (error) {
    return sendErrorResponse(res, error);
  }
};
