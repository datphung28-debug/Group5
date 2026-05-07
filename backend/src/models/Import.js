import mongoose from "mongoose";

const importItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  quantity: { type: Number, required: true, min: 1 },
  importPrice: { type: Number, required: true, min: 0 }, // giá nhập tại thời điểm
  expiryDate: { type: Date },
  manufacturingDate: { type: Date },
  batchNumber: { type: String, trim: true }, // số lô
  total: { type: Number, required: true, min: 0 },
});

const importSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: { type: [importItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "partial"],
      default: "unpaid",
    },
    importDate: { type: Date, default: Date.now },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Import = mongoose.model("Import", importSchema);
export default Import;
