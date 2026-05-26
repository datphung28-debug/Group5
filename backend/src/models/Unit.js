import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true }, // vd: viên, hộp, chai
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Unit = mongoose.model("Unit", unitSchema);
export default Unit;
