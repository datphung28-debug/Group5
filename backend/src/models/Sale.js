import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 }, // giá bán tại thời điểm bán
  discount: { type: Number, default: 0, min: 0, max: 100 }, // % giảm giá
  total: { type: Number, required: true, min: 0 },
  dosage: { type: String }, // Hướng dẫn sử dụng
});

const saleSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
    items: { type: [saleItemSchema], required: true },
    subTotal: { type: Number, required: true, min: 0 },   // tổng trước giảm giá
    discount: { type: Number, default: 0, min: 0 },       // giảm giá (VNĐ)
    totalAmount: { type: Number, required: true, min: 0 }, // tổng sau giảm giá
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer"],
      default: "cash",
    },
    amountPaid: { type: Number, min: 0 },   // tiền khách đưa
    changeAmount: { type: Number, min: 0 }, // tiền thừa
    status: {
      type: String,
      enum: ["completed", "cancelled", "refunded"],
      default: "completed",
    },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

saleSchema.index({ createdAt: -1 });
saleSchema.index({ customer: 1 });
saleSchema.index({ status: 1 });

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
