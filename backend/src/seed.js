/**
 * Script seed dữ liệu mẫu cho Pharmacy GPP
 * Chạy: node src/seed.js
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Unit from "./models/Unit.js";
import Supplier from "./models/Supplier.js";
import Medicine from "./models/Medicine.js";
import Customer from "./models/Customer.js";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/data_pharmacy");
    console.log("✅ Kết nối MongoDB thành công");

    // Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Unit.deleteMany({}),
      Supplier.deleteMany({}),
      Medicine.deleteMany({}),
      Customer.deleteMany({}),
    ]);
    console.log("🗑️  Đã xóa dữ liệu cũ");

    // Tạo người dùng
    const users = await User.create([
      { name: "Admin GPP", email: "admin@pharmacy.com", password: "123456", role: "admin", phone: "0901234567" },
      { name: "Dược sĩ Minh", email: "duocsi@pharmacy.com", password: "123456", role: "pharmacist", phone: "0912345678" },
    ]);
    console.log("👤 Đã tạo người dùng");

    // Tạo nhóm thuốc
    const categories = await Category.create([
      { name: "Kháng sinh", description: "Thuốc kháng sinh các loại" },
      { name: "Giảm đau - Hạ sốt", description: "Thuốc giảm đau, hạ sốt" },
      { name: "Tiêu hóa", description: "Thuốc hỗ trợ tiêu hóa" },
      { name: "Vitamin & Khoáng chất", description: "Vitamin và bổ sung khoáng chất" },
      { name: "Tim mạch", description: "Thuốc điều trị tim mạch" },
      { name: "Hô hấp", description: "Thuốc điều trị đường hô hấp" },
    ]);
    console.log("📂 Đã tạo nhóm thuốc");

    // Tạo đơn vị tính
    const units = await Unit.create([
      { name: "Viên", description: "Đơn vị tính viên thuốc" },
      { name: "Hộp", description: "Đơn vị tính hộp thuốc" },
      { name: "Chai", description: "Đơn vị tính chai thuốc" },
      { name: "Gói", description: "Đơn vị tính gói thuốc" },
      { name: "Ống", description: "Đơn vị tính ống thuốc" },
    ]);
    console.log("📏 Đã tạo đơn vị tính");

    // Tạo nhà cung cấp
    const suppliers = await Supplier.create([
      { name: "Công ty Dược Hậu Giang", phone: "02923891433", email: "info@dhg.com.vn", address: "TP. Cần Thơ", contactPerson: "Nguyễn Văn A" },
      { name: "Công ty Traphaco", phone: "02438581001", email: "info@traphaco.com.vn", address: "Hà Nội", contactPerson: "Trần Thị B" },
      { name: "Công ty IMEXPHARM", phone: "02773979149", email: "info@imexpharm.com", address: "TP. HCM", contactPerson: "Lê Văn C" },
    ]);
    console.log("🏭 Đã tạo nhà cung cấp");

    // Tạo thuốc mẫu
    await Medicine.create([
      {
        name: "Amoxicillin 500mg",
        code: "AMX500",
        category: categories[0]._id,
        unit: units[1]._id,
        supplier: suppliers[0]._id,
        description: "Thuốc kháng sinh nhóm Penicillin",
        ingredients: "Amoxicillin trihydrate 500mg",
        usage: "Uống 1 viên x 3 lần/ngày sau ăn",
        requiresPrescription: true,
        importPrice: 25000,
        sellPrice: 35000,
        stock: 150,
        minStock: 20,
        expiryDate: new Date("2026-12-31"),
      },
      {
        name: "Paracetamol 500mg",
        code: "PARA500",
        category: categories[1]._id,
        unit: units[1]._id,
        supplier: suppliers[1]._id,
        description: "Thuốc hạ sốt, giảm đau thông thường",
        ingredients: "Paracetamol 500mg",
        usage: "Uống 1-2 viên/lần, cách nhau 4-6 giờ",
        requiresPrescription: false,
        importPrice: 15000,
        sellPrice: 22000,
        stock: 300,
        minStock: 50,
        expiryDate: new Date("2027-06-30"),
      },
      {
        name: "Omeprazole 20mg",
        code: "OMP20",
        category: categories[2]._id,
        unit: units[1]._id,
        supplier: suppliers[2]._id,
        description: "Thuốc điều trị loét dạ dày, GERD",
        ingredients: "Omeprazole 20mg",
        usage: "Uống 1 viên/ngày trước ăn sáng 30 phút",
        requiresPrescription: true,
        importPrice: 30000,
        sellPrice: 45000,
        stock: 5,
        minStock: 20,
        expiryDate: new Date("2026-03-31"),
      },
      {
        name: "Vitamin C 500mg",
        code: "VITC500",
        category: categories[3]._id,
        unit: units[1]._id,
        supplier: suppliers[0]._id,
        description: "Bổ sung Vitamin C, tăng đề kháng",
        ingredients: "Ascorbic acid 500mg",
        usage: "Uống 1 viên/ngày sau ăn",
        requiresPrescription: false,
        importPrice: 8000,
        sellPrice: 15000,
        stock: 500,
        minStock: 100,
        expiryDate: new Date("2027-12-31"),
      },
    ]);
    console.log("💊 Đã tạo danh mục thuốc");

    // Tạo khách hàng
    await Customer.create([
      { name: "Nguyễn Văn An", phone: "0901111111", email: "an@gmail.com", address: "123 Lê Lợi, TP.HCM", gender: "male", dateOfBirth: new Date("1985-03-15") },
      { name: "Trần Thị Bình", phone: "0902222222", email: "binh@gmail.com", address: "456 Nguyễn Trãi, Hà Nội", gender: "female", dateOfBirth: new Date("1992-07-20") },
      { name: "Lê Minh Châu", phone: "0903333333", address: "789 Trần Hưng Đạo, Đà Nẵng", gender: "male" },
    ]);
    console.log("👥 Đã tạo khách hàng mẫu");

    console.log("\n🎉 Seed dữ liệu hoàn tất!");
    console.log("📧 Admin login: admin@pharmacy.com / 123456");
    console.log("📧 Dược sĩ login: duocsi@pharmacy.com / 123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi seed:", error);
    process.exit(1);
  }
};

seed();
