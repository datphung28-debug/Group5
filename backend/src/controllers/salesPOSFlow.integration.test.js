import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";
import Medicine from "../models/Medicine.js";
import Sale from "../models/Sale.js";
import { createSale } from "./saleController.js";
import { getDashboard, getRevenueReport } from "./reportController.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gpp_task_103";

test.describe("Sales & POS Flow Integration Tests (Task 10.3)", () => {
  let testUser;
  let testCustomer;
  let testCategory;
  let testUnit;
  let testMedicineA;
  let testMedicineB;

  test.before(async () => {
    await mongoose.connect(MONGO_URI);
    await Customer.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await Medicine.deleteMany({});
    await Sale.deleteMany({});

    testUser = await User.create({
      name: "Admin Bán Hàng",
      email: "pharmacist.pos@gpp.com",
      password: "hashedpassword123",
      role: "admin",
    });

    testCustomer = await Customer.create({
      name: "Khách Hàng Thân Thiết",
      phone: "0966777888",
      totalSpent: 0,
    });

    testCategory = await Category.create({ name: "Nhóm Thuốc Bán POS", code: "CAT-POS" });
    testUnit = await Unit.create({ name: "Hộp" });

    // Initial stock setup
    testMedicineA = await Medicine.create({
      name: "Thuốc Test POS A",
      code: "MED-POS-A",
      sellPrice: 2000,
      importPrice: 1200,
      unit: testUnit._id,
      category: testCategory._id,
      stock: 15,
      minStock: 2,
    });

    testMedicineB = await Medicine.create({
      name: "Thuốc Test POS B",
      code: "MED-POS-B",
      sellPrice: 4000,
      importPrice: 2500,
      unit: testUnit._id,
      category: testCategory._id,
      stock: 25,
      minStock: 5,
    });
  });

  test.after(async () => {
    await Customer.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await Medicine.deleteMany({});
    await Sale.deleteMany({});
    await mongoose.disconnect();
  });

  test("Executing POS sale with 2 medicines correctly deducts stock, increments customer spending, and updates dashboard and revenue KPIs", async () => {
    // 1. EXECUTE SALE
    const reqSale = {
      user: { _id: testUser._id },
      body: {
        customer: testCustomer._id.toString(),
        items: [
          {
            medicine: testMedicineA._id.toString(),
            quantity: 3,
          },
          {
            medicine: testMedicineB._id.toString(),
            quantity: 2,
          },
        ],
        discount: 0,
        paymentMethod: "cash",
        amountPaid: 14000, // 3 * 2000 + 2 * 4000 = 14000
      },
    };

    let saleStatus;
    let saleJson;

    const resSale = {
      status(code) {
        saleStatus = code;
        return this;
      },
      json(data) {
        saleJson = data;
        return this;
      },
    };

    await createSale(reqSale, resSale);

    assert.equal(saleStatus, 201);
    assert.ok(saleJson._id);

    // 2. VERIFY STOCK DEDUCTIONS
    const updatedMedA = await Medicine.findById(testMedicineA._id);
    const updatedMedB = await Medicine.findById(testMedicineB._id);

    assert.equal(updatedMedA.stock, 12, "Medicine A stock should be decremented to 12 (15 - 3)");
    assert.equal(updatedMedB.stock, 23, "Medicine B stock should be decremented to 23 (25 - 2)");

    // 3. VERIFY CUSTOMER TOTALSPENT INCREMENT
    const updatedCustomer = await Customer.findById(testCustomer._id);
    assert.equal(updatedCustomer.totalSpent, 14000, "Customer spending should increase to 14,000");

    // 4. VERIFY DASHBOARD UPDATES
    let dashJson;
    const resDash = {
      json(data) {
        dashJson = data;
        return this;
      },
    };

    await getDashboard({}, resDash);

    assert.ok(dashJson.today);
    assert.equal(dashJson.today.revenue, 14000, "Dashboard today's revenue should show 14,000");
    assert.equal(dashJson.today.orders, 1, "Dashboard today's orders should be 1");

    // 5. VERIFY REVENUE REPORT KPIs
    let repJson;
    const resRep = {
      json(data) {
        repJson = data;
        return this;
      },
    };

    await getRevenueReport({ query: {} }, resRep);

    assert.ok(repJson.kpis);
    assert.equal(repJson.kpis.totalRevenue, 14000);
    assert.equal(repJson.kpis.invoiceCount, 1);
    
    // Profit math check:
    // Med A: 3 * (2000 - 1200) = 2400
    // Med B: 2 * (4000 - 2500) = 3000
    // Total profit: 5400
    assert.equal(repJson.kpis.grossProfit, 5400, "Revenue gross profit should match mathematical expectations");
  });
});
