import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Medicine from "../models/Medicine.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";
import User from "../models/User.js";
import Sale from "../models/Sale.js";
import { createSale } from "./saleController.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gpp_task_63";

test.describe("Sale & Customer Integration Tests", () => {
  let testCustomer;
  let testMedicine;
  let testUser;
  let testCategory;
  let testUnit;

  test.before(async () => {
    await mongoose.connect(MONGO_URI);
    // Cleanup prior test run data
    await Customer.deleteMany({ phone: "0999000111" });
    await Medicine.deleteMany({ code: "MED-SALE-TEST" });
    await Category.deleteMany({ name: "Nhóm Test" });
    await Unit.deleteMany({ name: "Viên" });
    await User.deleteMany({ email: "pharmacist.test@gpp.com" });
    await Sale.deleteMany({});

    // Setup mock User (required by createSale as req.user._id)
    testUser = await User.create({
      name: "Dược Sĩ Test",
      email: "pharmacist.test@gpp.com",
      password: "hashedpassword123",
      role: "pharmacist",
    });

    // Setup mock Customer
    testCustomer = await Customer.create({
      name: "Khách Hàng A",
      phone: "0999000111",
      totalSpent: 0,
    });

    // Setup Category & Unit for Medicine
    testCategory = await Category.create({ name: "Nhóm Test", code: "CAT-TEST" });
    testUnit = await Unit.create({ name: "Viên" });

    // Setup mock Medicine with stock = 10
    testMedicine = await Medicine.create({
      name: "Thuốc Test POS",
      code: "MED-SALE-TEST",
      sellPrice: 1500,
      importPrice: 1000,
      unit: testUnit._id,
      category: testCategory._id,
      stock: 10,
      minStock: 2,
    });
  });

  test.after(async () => {
    // Final cleanup
    await Customer.deleteMany({ phone: "0999000111" });
    await Medicine.deleteMany({ code: "MED-SALE-TEST" });
    await Category.deleteMany({ name: "Nhóm Test" });
    await Unit.deleteMany({ name: "Viên" });
    await User.deleteMany({ email: "pharmacist.test@gpp.com" });
    await Sale.deleteMany({});
    await mongoose.disconnect();
  });

  test("Successful sale updates customer totalSpent and decreases medicine stock", async () => {
    const req = {
      body: {
        customer: testCustomer._id.toString(),
        items: [
          {
            medicine: testMedicine._id.toString(),
            quantity: 3,
          },
        ],
        discount: 500, // 500đ discount
        paymentMethod: "cash",
        amountPaid: 4000,
      },
      user: {
        _id: testUser._id,
      },
    };

    let responseStatus = 200;
    let responseData = null;

    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(data) {
        responseData = data;
        return this;
      },
    };

    // Trigger controller
    await createSale(req, res);

    assert.equal(responseStatus, 201);
    assert.ok(responseData._id);
    assert.equal(responseData.customer.toString(), testCustomer._id.toString());
    assert.equal(responseData.totalAmount, 4000); // 1500 * 3 - 500 = 4000

    // Verify Medicine Stock decreased: 10 -> 7
    const updatedMedicine = await Medicine.findById(testMedicine._id);
    assert.equal(updatedMedicine.stock, 7);

    // Verify Customer totalSpent updated: 0 -> 4000
    const updatedCustomer = await Customer.findById(testCustomer._id);
    assert.equal(updatedCustomer.totalSpent, 4000);
  });
});
