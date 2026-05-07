import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true }, // mã thuốc
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
    description: { type: String, trim: true },
    ingredients: { type: String, trim: true },         // thành phần
    usage: { type: String, trim: true },               // cách dùng
    sideEffects: { type: String, trim: true },         // tác dụng phụ
    contraindications: { type: String, trim: true },   // chống chỉ định
    requiresPrescription: { type: Boolean, default: false }, // cần đơn thuốc?
    importPrice: { type: Number, required: true, min: 0 },  // giá nhập
    sellPrice: { type: Number, required: true, min: 0 },    // giá bán
    stock: { type: Number, default: 0, min: 0 },            // tồn kho
    minStock: { type: Number, default: 10, min: 0 },        // tồn kho tối thiểu (cảnh báo)
    expiryDate: { type: Date },                             // hạn sử dụng
    manufacturingDate: { type: Date },                      // ngày sản xuất
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
