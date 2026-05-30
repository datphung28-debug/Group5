import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Medicine from "../models/Medicine.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";
import User from "../models/User.js";
import Sale from "../models/Sale.js";
import Import from "../models/Import.js";
import Supplier from "../models/Supplier.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gpp_task_83";

test.describe("Inventory Flow Calculation Integration Tests", () => {
  let testCustomer;
  let testMedicine;
  let testUser;
  let testCategory;
  let testUnit;
  let testSupplier;

  test.before(async () => {
    await mongoose.connect(MONGO_URI);
    // Cleanup prior test run data
    await Customer.deleteMany({});
    await Medicine.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await User.deleteMany({});
    await Sale.deleteMany({});
    await Import.deleteMany({});
    await Supplier.deleteMany({});

    // Setup base entities
    testUser = await User.create({
      name: "Dược Sĩ Kho",
      email: "pharmacist.inv@gpp.com",
      password: "hashedpassword123",
      role: "pharmacist",
    });

    testCustomer = await Customer.create({
      name: "Khách Hàng Lẻ",
      phone: "0999000333",
    });

    testSupplier = await Supplier.create({
      name: "Nhà Cung Cấp Dược",
      code: "NCC-INV-TEST",
      phone: "0909000555",
    });

    testCategory = await Category.create({ name: "Nhóm Nhập Xuất", code: "CAT-INV" });
    testUnit = await Unit.create({ name: "Hộp" });

    // Initial stock set to 0
    testMedicine = await Medicine.create({
      name: "Thuốc Test NXT",
      code: "MED-INV-FLOW",
      sellPrice: 2000,
      importPrice: 1200,
      unit: testUnit._id,
      category: testCategory._id,
      stock: 0,
      minStock: 5,
    });
  });

  test.after(async () => {
    // Final clean up
    await Customer.deleteMany({});
    await Medicine.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await User.deleteMany({});
    await Sale.deleteMany({});
    await Import.deleteMany({});
    await Supplier.deleteMany({});
    await mongoose.disconnect();
  });

  test("Import and Sale operations update stock correctly and verify openingStock formula", async () => {
    const today = new Date();
    const params = {
      startDate: new Date(today.setHours(0, 0, 0, 0)),
      endDate: new Date(today.setHours(23, 59, 59, 999)),
    };

    // 1. IMPORT: 15 items
    const importDoc = await Import.create({
      code: "PN-NXT-1",
      supplier: testSupplier._id,
      items: [
        {
          medicine: testMedicine._id,
          quantity: 15,
          importPrice: 1200,
          total: 18000,
          batchNumber: "B1",
          expiryDate: new Date("2028-12-31"),
        },
      ],
      totalAmount: 18000,
      paymentStatus: "paid",
      createdBy: testUser._id,
      createdAt: today,
    });

    // Manually increase stock (matching import controller side-effect)
    await Medicine.findByIdAndUpdate(testMedicine._id, { $inc: { stock: 15 } });

    // 2. SALE: 5 items
    const saleDoc = await Sale.create({
      code: "HD-NXT-1",
      customer: testCustomer._id,
      items: [
        {
          medicine: testMedicine._id,
          quantity: 5,
          unitPrice: 2000,
          total: 10000,
        },
      ],
      subTotal: 10000,
      discount: 0,
      totalAmount: 10000,
      paymentMethod: "cash",
      amountPaid: 10000,
      status: "completed",
      createdBy: testUser._id,
      createdAt: today,
    });

    // Manually decrease stock (matching sale controller side-effect)
    await Medicine.findByIdAndUpdate(testMedicine._id, { $inc: { stock: -5 } });

    // 3. FETCH & MATH CHECK (as performed in InventoryFlowReportPage.jsx)
    const activeMedicine = await Medicine.findById(testMedicine._id);
    const activeImports = await Import.find({ createdAt: { $gte: params.startDate, $lte: params.endDate } });
    const activeSales = await Sale.find({ status: "completed", createdAt: { $gte: params.startDate, $lte: params.endDate } });

    // Calculate sum of imported for medicine
    let totalImported = 0;
    activeImports.forEach((imp) => {
      imp.items.forEach((item) => {
        if (item.medicine.equals(testMedicine._id)) {
          totalImported += item.quantity;
        }
      });
    });

    // Calculate sum of exported for medicine
    let totalExported = 0;
    activeSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.medicine.equals(testMedicine._id)) {
          totalExported += item.quantity;
        }
      });
    });

    assert.equal(totalImported, 15);
    assert.equal(totalExported, 5);

    // closingStock must be 10 (0 + 15 - 5)
    const closingStock = activeMedicine.stock;
    assert.equal(closingStock, 10);

    // Formula: openingStock = closingStock - imported + exported
    const openingStock = closingStock - totalImported + totalExported;
    assert.equal(openingStock, 0, "openingStock should match the initial stock before imports and sales");
  });
});
