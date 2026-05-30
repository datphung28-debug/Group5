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
      type: String, // 'morning', 'afternoon', 'evening'
      required: true,
      enum: ["morning", "afternoon", "evening"],
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

// Tránh trùng ca của cùng một nhân sự trong cùng một ngày và cùng một ca
scheduleSchema.index({ date: 1, staff: 1, shiftType: 1 }, { unique: true });

const Schedule = mongoose.model("Schedule", scheduleSchema);
export default Schedule;
