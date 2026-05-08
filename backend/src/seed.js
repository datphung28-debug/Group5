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
import Sale from "./models/Sale.js";
import Import from "./models/Import.js";

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
      Sale.deleteMany({}),
      Import.deleteMany({}),
    ]);
    console.log("🗑️  Đã xóa dữ liệu cũ");

    // ── USERS ──────────────────────────────────────────────
    const users = await User.create([
      { name: "Admin GPP", email: "admin@pharmacy.com", password: "123456", role: "admin", phone: "0901234567" },
      { name: "Dược sĩ Minh", email: "duocsi@pharmacy.com", password: "123456", role: "pharmacist", phone: "0912345678" },
    ]);
    console.log("👤 Đã tạo người dùng");
    const adminId = users[0]._id;

    // ── CATEGORIES ─────────────────────────────────────────
    const categories = await Category.create([
      { name: "Kháng sinh", description: "Thuốc kháng sinh các loại" },
      { name: "Giảm đau - Hạ sốt", description: "Thuốc giảm đau, hạ sốt" },
      { name: "Tiêu hóa", description: "Thuốc hỗ trợ tiêu hóa" },
      { name: "Vitamin & Khoáng chất", description: "Vitamin và bổ sung khoáng chất" },
      { name: "Tim mạch", description: "Thuốc điều trị tim mạch" },
      { name: "Hô hấp", description: "Thuốc điều trị đường hô hấp" },
      { name: "Da liễu", description: "Thuốc điều trị bệnh da" },
      { name: "Thần kinh", description: "Thuốc hỗ trợ thần kinh" },
    ]);
    console.log("📂 Đã tạo nhóm thuốc");
    const [catKS, catGD, catTH, catVit, catTM, catHH, catDL, catTK] = categories;

    // ── UNITS ──────────────────────────────────────────────
    const units = await Unit.create([
      { name: "Viên" }, { name: "Hộp" }, { name: "Chai" },
      { name: "Gói" }, { name: "Ống" }, { name: "Tuýp" },
    ]);
    console.log("📏 Đã tạo đơn vị tính");
    const [uVien, uHop, uChai, uGoi, uOng, uTuyp] = units;

    // ── SUPPLIERS ──────────────────────────────────────────
    const suppliers = await Supplier.create([
      { name: "Dược Hậu Giang (DHG)", phone: "02923891433", email: "info@dhg.com.vn", address: "TP. Cần Thơ", contactPerson: "Nguyễn Văn A" },
      { name: "Traphaco", phone: "02438581001", email: "info@traphaco.com.vn", address: "Hà Nội", contactPerson: "Trần Thị B" },
      { name: "IMEXPHARM", phone: "02773979149", email: "info@imexpharm.com", address: "TP. HCM", contactPerson: "Lê Văn C" },
      { name: "Mekophar", phone: "02838640818", email: "info@mekophar.com", address: "TP. HCM", contactPerson: "Phạm Thị D" },
    ]);
    console.log("🏭 Đã tạo nhà cung cấp");
    const [supDHG, supTra, supIME, supMek] = suppliers;

    // ── MEDICINES (20 thuốc) ───────────────────────────────
    const medicines = await Medicine.create([
      // Kháng sinh
      { code: "AMX500", name: "Amoxicillin 500mg", category: catKS._id, unit: uHop._id, supplier: supIME._id, ingredients: "Amoxicillin trihydrate 500mg", requiresPrescription: true, importPrice: 25000, sellPrice: 35000, stock: 150, minStock: 20, expiryDate: new Date("2026-12-31") },
      { code: "AZI500", name: "Azithromycin 500mg", category: catKS._id, unit: uHop._id, supplier: supIME._id, ingredients: "Azithromycin 500mg", requiresPrescription: true, importPrice: 45000, sellPrice: 65000, stock: 80, minStock: 15, expiryDate: new Date("2026-10-31") },
      { code: "CIP500", name: "Ciprofloxacin 500mg", category: catKS._id, unit: uHop._id, supplier: supDHG._id, ingredients: "Ciprofloxacin hydrochloride", requiresPrescription: true, importPrice: 30000, sellPrice: 42000, stock: 60, minStock: 10, expiryDate: new Date("2027-03-31") },
      // Giảm đau
      { code: "PARA500", name: "Paracetamol 500mg", category: catGD._id, unit: uHop._id, supplier: supTra._id, ingredients: "Paracetamol 500mg", requiresPrescription: false, importPrice: 15000, sellPrice: 22000, stock: 500, minStock: 50, expiryDate: new Date("2027-06-30") },
      { code: "IBU400", name: "Ibuprofen 400mg", category: catGD._id, unit: uHop._id, supplier: supMek._id, ingredients: "Ibuprofen 400mg", requiresPrescription: false, importPrice: 18000, sellPrice: 28000, stock: 200, minStock: 30, expiryDate: new Date("2027-01-31") },
      { code: "MEF500", name: "Mefenamic Acid 500mg", category: catGD._id, unit: uHop._id, supplier: supDHG._id, ingredients: "Mefenamic acid 500mg", requiresPrescription: true, importPrice: 22000, sellPrice: 32000, stock: 120, minStock: 20, expiryDate: new Date("2026-09-30") },
      // Tiêu hóa
      { code: "OMP20", name: "Omeprazole 20mg", category: catTH._id, unit: uHop._id, supplier: supIME._id, ingredients: "Omeprazole 20mg", requiresPrescription: true, importPrice: 30000, sellPrice: 45000, stock: 5, minStock: 20, expiryDate: new Date("2026-03-31") },
      { code: "MET10", name: "Metoclopramide 10mg", category: catTH._id, unit: uHop._id, supplier: supMek._id, ingredients: "Metoclopramide hydrochloride", requiresPrescription: true, importPrice: 12000, sellPrice: 18000, stock: 90, minStock: 15, expiryDate: new Date("2026-11-30") },
      { code: "BIS262", name: "Bismuth Subsalicylate", category: catTH._id, unit: uChai._id, supplier: supTra._id, ingredients: "Bismuth subsalicylate 262mg/15ml", requiresPrescription: false, importPrice: 55000, sellPrice: 78000, stock: 40, minStock: 10, expiryDate: new Date("2027-04-30") },
      // Vitamin
      { code: "VITC500", name: "Vitamin C 500mg", category: catVit._id, unit: uHop._id, supplier: supDHG._id, ingredients: "Ascorbic acid 500mg", requiresPrescription: false, importPrice: 8000, sellPrice: 15000, stock: 600, minStock: 100, expiryDate: new Date("2027-12-31") },
      { code: "VITB12", name: "Vitamin B12 500mcg", category: catVit._id, unit: uHop._id, supplier: supTra._id, ingredients: "Cyanocobalamin 500mcg", requiresPrescription: false, importPrice: 20000, sellPrice: 32000, stock: 180, minStock: 30, expiryDate: new Date("2027-08-31") },
      { code: "CALCI", name: "Calcium 500mg + Vit D3", category: catVit._id, unit: uHop._id, supplier: supMek._id, ingredients: "Calcium carbonate 1250mg, Vit D3", requiresPrescription: false, importPrice: 35000, sellPrice: 52000, stock: 250, minStock: 40, expiryDate: new Date("2027-05-31") },
      // Tim mạch
      { code: "AMLO5", name: "Amlodipine 5mg", category: catTM._id, unit: uHop._id, supplier: supIME._id, ingredients: "Amlodipine besylate 6.93mg", requiresPrescription: true, importPrice: 40000, sellPrice: 58000, stock: 100, minStock: 20, expiryDate: new Date("2026-08-31") },
      { code: "ATR25", name: "Atorvastatin 25mg", category: catTM._id, unit: uHop._id, supplier: supDHG._id, ingredients: "Atorvastatin calcium 25mg", requiresPrescription: true, importPrice: 55000, sellPrice: 78000, stock: 70, minStock: 15, expiryDate: new Date("2026-07-31") },
      // Hô hấp
      { code: "SAL200", name: "Salbutamol 2mg", category: catHH._id, unit: uHop._id, supplier: supMek._id, ingredients: "Salbutamol sulphate 2.4mg", requiresPrescription: true, importPrice: 15000, sellPrice: 22000, stock: 130, minStock: 25, expiryDate: new Date("2027-02-28") },
      { code: "ACC600", name: "Acetylcysteine 600mg", category: catHH._id, unit: uGoi._id, supplier: supTra._id, ingredients: "Acetylcysteine 600mg", requiresPrescription: false, importPrice: 28000, sellPrice: 42000, stock: 200, minStock: 30, expiryDate: new Date("2027-06-30") },
      // Da liễu
      { code: "CLO1", name: "Clotrimazole 1% cream", category: catDL._id, unit: uTuyp._id, supplier: supIME._id, ingredients: "Clotrimazole 10mg/g", requiresPrescription: false, importPrice: 18000, sellPrice: 28000, stock: 85, minStock: 15, expiryDate: new Date("2026-06-30") },
      { code: "BET05", name: "Betamethasone 0.5mg", category: catDL._id, unit: uHop._id, supplier: supDHG._id, ingredients: "Betamethasone 0.5mg", requiresPrescription: true, importPrice: 22000, sellPrice: 35000, stock: 50, minStock: 10, expiryDate: new Date("2026-11-30") },
      // Thần kinh
      { code: "DIA5", name: "Diazepam 5mg", category: catTK._id, unit: uHop._id, supplier: supMek._id, ingredients: "Diazepam 5mg", requiresPrescription: true, importPrice: 8000, sellPrice: 13000, stock: 40, minStock: 10, expiryDate: new Date("2027-01-31") },
      { code: "MEM10", name: "Memantine 10mg", category: catTK._id, unit: uHop._id, supplier: supIME._id, ingredients: "Memantine hydrochloride 10mg", requiresPrescription: true, importPrice: 85000, sellPrice: 125000, stock: 25, minStock: 5, expiryDate: new Date("2026-09-30") },
    ]);
    console.log("💊 Đã tạo 20 thuốc");

    // ── CUSTOMERS (10 khách hàng) ──────────────────────────
    const customers = await Customer.create([
      { name: "Nguyễn Văn An", phone: "0901111111", email: "an@gmail.com", address: "123 Lê Lợi, TP.HCM", gender: "male", dateOfBirth: new Date("1985-03-15") },
      { name: "Trần Thị Bình", phone: "0902222222", email: "binh@gmail.com", address: "456 Nguyễn Trãi, Hà Nội", gender: "female", dateOfBirth: new Date("1992-07-20") },
      { name: "Lê Minh Châu", phone: "0903333333", address: "789 Trần Hưng Đạo, Đà Nẵng", gender: "male" },
      { name: "Phạm Thị Dung", phone: "0904444444", email: "dung@gmail.com", address: "12 Hoàng Văn Thụ, TP.HCM", gender: "female", dateOfBirth: new Date("1975-11-08") },
      { name: "Hoàng Văn Em", phone: "0905555555", address: "34 Phan Đình Phùng, Huế", gender: "male", dateOfBirth: new Date("1990-05-22") },
      { name: "Vũ Thị Phượng", phone: "0906666666", email: "phuong@gmail.com", address: "56 Lý Thường Kiệt, Hải Phòng", gender: "female" },
      { name: "Đặng Minh Quân", phone: "0907777777", address: "78 Điện Biên Phủ, TP.HCM", gender: "male", dateOfBirth: new Date("1988-09-14") },
      { name: "Ngô Thị Hoa", phone: "0908888888", email: "hoa@gmail.com", address: "90 Nguyễn Huệ, Cần Thơ", gender: "female", dateOfBirth: new Date("2000-01-30") },
      { name: "Trương Văn Kiên", phone: "0909999999", address: "11 Hai Bà Trưng, Hà Nội", gender: "male" },
      { name: "Bùi Thị Lan", phone: "0910000000", email: "lan@gmail.com", address: "22 Pasteur, TP.HCM", gender: "female", dateOfBirth: new Date("1965-06-18") },
    ]);
    console.log("👥 Đã tạo 10 khách hàng");

    // ── HELPER: tạo ngày trong quá khứ ────────────────────
    const daysAgo = (n) => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d;
    };

    // ── IMPORT RECORDS (5 phiếu nhập) ─────────────────────
    await Import.create([
      {
        code: "PN20260501001",
        supplier: supDHG._id,
        items: [
          { medicine: medicines[0]._id, quantity: 50, importPrice: 25000, batchNumber: "DHG2026A", expiryDate: new Date("2026-12-31"), total: 1250000 },
          { medicine: medicines[3]._id, quantity: 100, importPrice: 15000, batchNumber: "DHG2026B", expiryDate: new Date("2027-06-30"), total: 1500000 },
        ],
        totalAmount: 2750000,
        paymentStatus: "paid",
        importDate: daysAgo(30),
        createdBy: adminId,
        notes: "Nhập hàng tháng 4",
      },
      {
        code: "PN20260508001",
        supplier: supIME._id,
        items: [
          { medicine: medicines[6]._id, quantity: 30, importPrice: 30000, batchNumber: "IME2026A", expiryDate: new Date("2026-03-31"), total: 900000 },
          { medicine: medicines[12]._id, quantity: 40, importPrice: 40000, batchNumber: "IME2026B", expiryDate: new Date("2026-08-31"), total: 1600000 },
        ],
        totalAmount: 2500000,
        paymentStatus: "unpaid",
        importDate: daysAgo(7),
        createdBy: adminId,
      },
    ]);
    console.log("📦 Đã tạo phiếu nhập hàng");

    // ── SALES (30 hóa đơn trải 30 ngày) ───────────────────
    const salesData = [];
    const med = medicines; // shorthand
    const cust = customers;

    // Mảng các giao dịch mẫu theo từng ngày
    const salesTemplate = [
      // [daysAgo, customerId, items: [{medIdx, qty}], discount, paymentMethod]
      [1, cust[0]._id, [{ m: med[3], q: 2 }, { m: med[9], q: 1 }], 0, "cash"],
      [1, null, [{ m: med[3], q: 1 }, { m: med[4], q: 1 }], 0, "cash"],
      [2, cust[1]._id, [{ m: med[0], q: 1 }, { m: med[9], q: 2 }], 5000, "transfer"],
      [2, cust[3]._id, [{ m: med[15], q: 2 }, { m: med[11], q: 1 }], 0, "cash"],
      [3, null, [{ m: med[3], q: 3 }], 0, "cash"],
      [3, cust[2]._id, [{ m: med[1], q: 1 }, { m: med[14], q: 1 }], 10000, "card"],
      [4, cust[4]._id, [{ m: med[9], q: 2 }, { m: med[10], q: 1 }], 0, "cash"],
      [4, null, [{ m: med[3], q: 1 }, { m: med[5], q: 1 }], 0, "cash"],
      [5, cust[5]._id, [{ m: med[11], q: 2 }, { m: med[9], q: 1 }], 0, "transfer"],
      [5, cust[0]._id, [{ m: med[4], q: 2 }], 0, "cash"],
      [6, null, [{ m: med[3], q: 2 }, { m: med[15], q: 1 }], 0, "cash"],
      [7, cust[6]._id, [{ m: med[12], q: 1 }, { m: med[13], q: 1 }], 20000, "card"],
      [8, cust[1]._id, [{ m: med[9], q: 3 }, { m: med[10], q: 1 }], 0, "cash"],
      [9, null, [{ m: med[3], q: 1 }], 0, "cash"],
      [10, cust[7]._id, [{ m: med[0], q: 2 }, { m: med[5], q: 1 }], 0, "transfer"],
      [11, cust[3]._id, [{ m: med[16], q: 1 }, { m: med[9], q: 2 }], 0, "cash"],
      [12, null, [{ m: med[3], q: 2 }, { m: med[4], q: 1 }], 5000, "cash"],
      [13, cust[8]._id, [{ m: med[11], q: 1 }, { m: med[10], q: 2 }], 0, "cash"],
      [14, cust[2]._id, [{ m: med[1], q: 1 }], 0, "card"],
      [15, null, [{ m: med[3], q: 1 }, { m: med[15], q: 2 }], 0, "cash"],
      [16, cust[9]._id, [{ m: med[9], q: 2 }, { m: med[11], q: 1 }], 0, "transfer"],
      [17, cust[4]._id, [{ m: med[12], q: 1 }, { m: med[5], q: 1 }], 10000, "cash"],
      [18, null, [{ m: med[3], q: 3 }], 0, "cash"],
      [19, cust[0]._id, [{ m: med[0], q: 1 }, { m: med[9], q: 1 }], 0, "cash"],
      [20, cust[5]._id, [{ m: med[4], q: 2 }, { m: med[15], q: 1 }], 0, "card"],
      [22, null, [{ m: med[3], q: 1 }, { m: med[10], q: 1 }], 0, "cash"],
      [24, cust[1]._id, [{ m: med[11], q: 2 }, { m: med[9], q: 1 }], 5000, "transfer"],
      [26, cust[6]._id, [{ m: med[14], q: 1 }], 0, "cash"],
      [28, null, [{ m: med[3], q: 2 }, { m: med[4], q: 1 }], 0, "cash"],
      [30, cust[7]._id, [{ m: med[9], q: 1 }, { m: med[10], q: 1 }], 0, "cash"],
    ];

    for (let i = 0; i < salesTemplate.length; i++) {
      const [day, customerId, itemDefs, discount, payMethod] = salesTemplate[i];
      const items = itemDefs.map(({ m, q }) => ({
        medicine: m._id,
        quantity: q,
        unitPrice: m.sellPrice,
        discount: 0,
        total: m.sellPrice * q,
      }));
      const subTotal = items.reduce((s, it) => s + it.total, 0);
      const totalAmount = subTotal - discount;
      const createdAt = daysAgo(day);

      salesData.push({
        code: `HD${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, '0')}${String(createdAt.getDate()).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`,
        customer: customerId || undefined,
        items,
        subTotal,
        discount,
        totalAmount,
        paymentMethod: payMethod,
        amountPaid: totalAmount,
        changeAmount: 0,
        status: "completed",
        createdBy: adminId,
        createdAt,
        updatedAt: createdAt,
      });
    }

    await Sale.insertMany(salesData);
    console.log(`🧾 Đã tạo ${salesData.length} hóa đơn bán hàng`);

    // Tính tổng tiền từng khách hàng
    const customerSpend = {};
    salesData.forEach(s => {
      if (s.customer) {
        const id = s.customer.toString();
        customerSpend[id] = (customerSpend[id] || 0) + s.totalAmount;
      }
    });
    for (const [id, total] of Object.entries(customerSpend)) {
      await Customer.findByIdAndUpdate(id, { totalSpent: total });
    }
    console.log("💰 Đã cập nhật tổng chi tiêu khách hàng");

    console.log("\n🎉 Seed dữ liệu hoàn tất!");
    console.log("================================");
    console.log("📧 Admin:    admin@pharmacy.com / 123456");
    console.log("📧 Dược sĩ: duocsi@pharmacy.com / 123456");
    console.log("================================");
    console.log("📊 Dữ liệu đã tạo:");
    console.log("   - 2 users, 8 nhóm thuốc, 6 đơn vị, 4 NCC");
    console.log("   - 20 thuốc, 10 khách hàng");
    console.log("   - 2 phiếu nhập, 30 hóa đơn bán hàng");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi seed:", error.message);
    process.exit(1);
  }
};

seed();
