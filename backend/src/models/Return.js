import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
});

const returnSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    sale: { type: mongoose.Schema.Types.ObjectId, ref: "Sale", required: true },
    invoiceCode: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    items: { type: [returnItemSchema], required: true },
    refundAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "rejected"],
      default: "pending",
    },
    refundMethod: {
      type: String,
      enum: ["cash", "transfer"],
      default: "cash",
    },
    reason: { type: String, required: true },
    note: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

returnSchema.index({ createdAt: -1 });
returnSchema.index({ sale: 1 });
returnSchema.index({ status: 1 });

const Return = mongoose.model("Return", returnSchema);
export default Return;
