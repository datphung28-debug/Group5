import mongoose from "mongoose";

const cashbookTransactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["thu", "chi"], required: true },
    category: { type: String, required: true, trim: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer"],
      default: "cash",
    },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    transactionDate: { type: Date, default: Date.now },
    reference: { type: String, trim: true },
    note: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

cashbookTransactionSchema.index({ transactionDate: -1 });
cashbookTransactionSchema.index({ type: 1 });
cashbookTransactionSchema.index({ category: 1 });

const CashbookTransaction = mongoose.model("CashbookTransaction", cashbookTransactionSchema);
export default CashbookTransaction;
