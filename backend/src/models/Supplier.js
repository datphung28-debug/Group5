import mongoose from "mongoose";

const supplierPurchaseHistorySchema = new mongoose.Schema(
  {
    id: { type: String, trim: true },
    date: { type: String, trim: true },
    value: { type: Number, default: 0, min: 0 },
    status: { type: String, trim: true },
  },
  { _id: false }
);

const supplierDebtHistorySchema = new mongoose.Schema(
  {
    id: { type: String, trim: true },
    date: { type: String, trim: true },
    note: { type: String, trim: true },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    taxCode: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    contactName: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    currentDebt: { type: Number, default: 0, min: 0 },
    debtLimit: { type: Number, default: 0, min: 0 },
    paymentTerms: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Bình thường", "Đang nợ", "Quá hạn", "Tạm ngưng"],
      default: "Bình thường",
    },
    notes: { type: String, trim: true },
    purchaseHistory: { type: [supplierPurchaseHistorySchema], default: [] },
    debtHistory: { type: [supplierDebtHistorySchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
