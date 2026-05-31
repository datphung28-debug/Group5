import mongoose from "mongoose";

const timesheetSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Định dạng YYYY-MM-DD
      required: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shift: {
      type: String, // 'Ca sáng', 'Ca chiều', 'Ca tối', 'Ca tự chọn', etc.
      required: true,
    },
    scheduledTime: {
      type: String, // '07:00 - 12:00', etc.
      required: true,
    },
    checkIn: {
      type: String, // Định dạng HH:mm
      required: true,
    },
    checkOut: {
      type: String, // Định dạng HH:mm
      default: null,
    },
    workHours: {
      type: Number,
      default: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String, // 'complete', 'late', 'missing', 'absent'
      required: true,
      enum: ["complete", "late", "missing", "absent"],
      default: "missing",
    },
    method: {
      type: String, // 'pos', 'face', etc.
      default: "pos",
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Tránh trùng chấm công trong cùng một ngày của cùng một nhân sự cho cùng một ca
timesheetSchema.index({ date: 1, staff: 1, shift: 1 }, { unique: true });

const Timesheet = mongoose.model("Timesheet", timesheetSchema);
export default Timesheet;
