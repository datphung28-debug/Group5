import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";
import Medicine from "../models/Medicine.js";
import Import from "../models/Import.js";
import { createImport } from "./importController.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gpp_task_84";

test.describe("Supplier Debt Integration Tests", () => {
  let testUser;
  let testSupplier;
  let testCategory;
  let testUnit;
  let testMedicine;

  test.before(async () => {
    await mongoose.connect(MONGO_URI);
    await Supplier.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await Medicine.deleteMany({});
    await Import.deleteMany({});

    testUser = await User.create({
      name: "Dược Sĩ Test",
      email: "pharmacist.debt@gpp.com",
      password: "hashedpassword123",
      role: "pharmacist",
    });

    testSupplier = await Supplier.create({
      name: "Supplier Debt Test Ltd",
      code: "NCC-DEBT-TEST",
      phone: "0988111222",
      currentDebt: 0,
      status: "Bình thường",
    });

    testCategory = await Category.create({ name: "Nhóm Thuốc Nợ", code: "CAT-DEBT" });
    testUnit = await Unit.create({ name: "Viên" });

    testMedicine = await Medicine.create({
      name: "Thuốc Test Nợ",
      code: "MED-DEBT-TEST",
      sellPrice: 5000,
      importPrice: 3000,
      unit: testUnit._id,
      category: testCategory._id,
      stock: 10,
      minStock: 2,
    });
  });

  test.after(async () => {
    await Supplier.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await Medicine.deleteMany({});
    await Import.deleteMany({});
    await mongoose.disconnect();
  });

  test("Creating unpaid import increases supplier currentDebt and updates status and history", async () => {
    // Mock req and res objects
    const req = {
      user: { _id: testUser._id },
      body: {
        supplier: testSupplier._id.toString(),
        paymentStatus: "unpaid",
        importDate: new Date(),
        notes: "Test debt import",
        items: [
          {
            medicine: testMedicine._id.toString(),
            quantity: 10,
            importPrice: 3000,
            expiryDate: new Date("2028-12-31"),
            manufacturingDate: new Date("2026-01-01"),
            batchNumber: "LOT-999",
          },
        ],
      },
    };

    let statusResult;
    let jsonResult;

    const res = {
      status(code) {
        statusResult = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    // Invoke controller
    await createImport(req, res);

    assert.equal(statusResult, 201);
    assert.ok(jsonResult.code);

    // Verify supplier debt updates
    const updatedSupplier = await Supplier.findById(testSupplier._id);
    assert.equal(updatedSupplier.currentDebt, 30000, "currentDebt should increase by totalAmount (10 * 3000 = 30000)");
    assert.equal(updatedSupplier.status, "Đang nợ", "supplier status should change to 'Đang nợ'");
    assert.equal(updatedSupplier.debtHistory.length, 1);
    assert.equal(updatedSupplier.debtHistory[0].amount, 30000);
    assert.equal(updatedSupplier.debtHistory[0].id, jsonResult.code);
  });
});
