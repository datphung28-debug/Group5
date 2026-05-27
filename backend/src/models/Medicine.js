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
    manufacturer: { type: String, trim: true },        // nhà sản xuất
    usage: { type: String, trim: true },               // cách dùng
    sideEffects: { type: String, trim: true },         // tác dụng phụ
    contraindications: { type: String, trim: true },   // chống chỉ định
    requiresPrescription: { type: Boolean, default: false }, // cần đơn thuốc?
    isAntibiotic: { type: Boolean, default: false },
    isNarcotic: { type: Boolean, default: false },
    importPrice: { type: Number, required: true, min: 0 },  // giá nhập
    sellPrice: { type: Number, required: true, min: 0 },    // giá bán
    stock: { type: Number, default: 0, min: 0 },            // tồn kho
    minStock: { type: Number, default: 10, min: 0 },        // tồn kho tối thiểu (cảnh báo)
    expiryDate: { type: Date },                             // hạn sử dụng
    manufacturingDate: { type: Date },                      // ngày sản xuất
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
    // Vị trí trong kho thuốc
    location: {
      storageType: { type: String, enum: ["room_temp", "cool", "cold", "freezer"], default: "room_temp" },
      zone: { type: String, default: "A" },   // Khu vực: A, B, C, D, E
      shelf: { type: Number, default: 1 },      // Số kệ: 1-10
      row: { type: Number, default: 1 },      // Hàng: 1-5
      column: { type: Number, default: 1 },      // Cột: 1-10
      label: { type: String },                  // Mã nhãn: "A-02-3-1"
      notes: { type: String },                  // Ghi chú bổ sung
    },
  },
  { timestamps: true }
);

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;
