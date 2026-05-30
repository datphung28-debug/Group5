import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Định dạng YYYY-MM-DD
      required: true,
    },
    day: {
      type: String, // 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'
      required: true,
      enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shiftType: {
      type: String, // 'morning', 'afternoon', 'evening', 'custom'
      required: true,
      enum: ["morning", "afternoon", "evening", "custom"],
    },
    startTime: {
      type: String, // Định dạng HH:mm
      required: true,
      default: "07:00",
    },
    endTime: {
      type: String, // Định dạng HH:mm
      required: true,
      default: "12:00",
    },
    area: {
      type: String,
      required: true,
      default: "Quầy thuốc",
    },
    status: {
      type: String, // 'confirmed', 'pending', 'absent'
      required: true,
      enum: ["confirmed", "pending", "absent"],
      default: "confirmed",
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Tránh trùng ca của cùng một nhân sự bắt đầu cùng giờ trong cùng một ngày
scheduleSchema.index({ date: 1, staff: 1, startTime: 1 }, { unique: true });

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
