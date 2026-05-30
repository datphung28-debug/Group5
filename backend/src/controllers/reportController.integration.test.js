import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import Medicine from "../models/Medicine.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";
import User from "../models/User.js";
import Sale from "../models/Sale.js";
import { getRevenueReport } from "./reportController.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gpp_task_82";

test.describe("Report Controller Integration Tests", () => {
  let testCustomer;
  let testMedicine;
  let testUser;
  let testCategory;
  let testUnit;

  test.before(async () => {
    await mongoose.connect(MONGO_URI);
    // Clean up collections
    await Customer.deleteMany({});
    await Medicine.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await User.deleteMany({});
    await Sale.deleteMany({});

    // Create supporting test entities
    testUser = await User.create({
      name: "Dược Sĩ Báo Cáo",
      email: "pharmacist.report@gpp.com",
      password: "hashedpassword123",
      role: "pharmacist",
    });

    testCustomer = await Customer.create({
      name: "Khách Hàng Báo Cáo",
      phone: "0999000222",
    });

    testCategory = await Category.create({ name: "Nhóm Báo Cáo", code: "CAT-REP" });
    testUnit = await Unit.create({ name: "Hộp" });

    testMedicine = await Medicine.create({
      name: "Thuốc Báo Cáo",
      code: "MED-REP-TEST",
      sellPrice: 2000,
      importPrice: 1200,
      unit: testUnit._id,
      category: testCategory._id,
      stock: 100,
      minStock: 5,
    });

    // Create 2 test sales on different dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    await Sale.create([
      {
        code: "HD-REP-1",
        customer: testCustomer._id,
        items: [{ medicine: testMedicine._id, quantity: 2, unitPrice: 2000, total: 4000 }],
        subTotal: 4000,
        discount: 0,
        totalAmount: 4000,
        paymentMethod: "cash",
        amountPaid: 4000,
        status: "completed",
        createdBy: testUser._id,
        createdAt: yesterday,
      },
      {
        code: "HD-REP-2",
        customer: testCustomer._id,
        items: [{ medicine: testMedicine._id, quantity: 3, unitPrice: 2000, total: 6000 }],
        subTotal: 6000,
        discount: 1000,
        totalAmount: 5000,
        paymentMethod: "transfer",
        amountPaid: 5000,
        status: "completed",
        createdBy: testUser._id,
        createdAt: today,
      },
    ]);
  });

  test.after(async () => {
    // Final clean up
    await Customer.deleteMany({});
    await Medicine.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await User.deleteMany({});
    await Sale.deleteMany({});
    await mongoose.disconnect();
  });

  test("Revenue report with matching dates returns correct KPIs and trend data", async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Format ISO string range for query parameters
    const req = {
      query: {
        fromDate: yesterday.toISOString(),
        toDate: today.toISOString(),
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

    await getRevenueReport(req, res);

    assert.equal(responseStatus, 200);
    assert.ok(responseData.kpis);

    // totalRevenue: 4000 (sale 1) + 5000 (sale 2) = 9000
    assert.equal(responseData.kpis.totalRevenue, 9000);
    assert.equal(responseData.kpis.invoiceCount, 2);
    // grossProfit: sale 1 profit = 4000 - 1200*2 = 1600. sale 2 profit = 6000 - 1200*3 = 2400. grossProfit = 4000.
    assert.equal(responseData.kpis.grossProfit, 4000);
    assert.equal(responseData.kpis.margin, 44.44); // 4000 / 9000 * 100

    // Check trend, payment and category distributions
    assert.ok(responseData.trendData.length > 0);
    assert.equal(responseData.paymentData.length, 2); // cash, transfer
    assert.equal(responseData.categoryData.length, 1);
    assert.equal(responseData.categoryData[0].category, "Nhóm Báo Cáo");
  });

  test("Revenue report with non-matching dates returns empty KPIs and distributions", async () => {
    // Next year date range with no sales
    const req = {
      query: {
        fromDate: "2027-01-01T00:00:00.000Z",
        toDate: "2027-12-31T23:59:59.999Z",
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

    await getRevenueReport(req, res);

    assert.equal(responseStatus, 200);
    assert.equal(responseData.kpis.totalRevenue, 0);
    assert.equal(responseData.kpis.invoiceCount, 0);
    assert.equal(responseData.trendData.length, 0);
    assert.equal(responseData.paymentData.length, 0);
    assert.equal(responseData.categoryData.length, 0);
  });
});
