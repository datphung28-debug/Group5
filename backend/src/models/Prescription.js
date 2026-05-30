import mongoose from "mongoose";

const prescriptionItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  dosage: { type: String, required: true },   // liều lượng (vd: 1 viên/lần)
  frequency: { type: String, required: true }, // tần suất (vd: 3 lần/ngày)
  duration: { type: String },                  // thời gian dùng
  quantity: { type: Number, required: true, min: 1 },
  notes: { type: String },
});

const prescriptionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    patientName: { type: String, required: true, trim: true },
    patientAge: { type: Number },
    patientGender: { type: String, enum: ["male", "female", "other"] },
    doctorName: { type: String, trim: true },
    hospitalName: { type: String, trim: true },
    diagnosis: { type: String, trim: true },  // chẩn đoán
    items: [prescriptionItemSchema],
    imageUrl: { type: String }, // Link hoặc Base64 ảnh đơn thuốc scan
    issuedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "dispensed", "cancelled"],
      default: "pending",
    },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
