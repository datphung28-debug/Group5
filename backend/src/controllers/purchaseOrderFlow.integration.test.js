import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Supplier from "../models/Supplier.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";
import Medicine from "../models/Medicine.js";
import Import from "../models/Import.js";
import { createImport, getImports } from "./importController.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gpp_task_102";

test.describe("Purchase Order Flow Integration Tests (Task 10.2)", () => {
  let testUser;
  let testSupplier;
  let testCategory;
  let testUnit;
  let testMedicineA;
  let testMedicineB;

  test.before(async () => {
    await mongoose.connect(MONGO_URI);
    await Supplier.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await Medicine.deleteMany({});
    await Import.deleteMany({});

    testUser = await User.create({
      name: "Quản Kho GPP",
      email: "pharmacist.inv2@gpp.com",
      password: "hashedpassword123",
      role: "admin",
    });

    testSupplier = await Supplier.create({
      name: "Supplier Flow Test Ltd",
      code: "NCC-FLOW-TEST",
      phone: "0911000222",
    });

    testCategory = await Category.create({ name: "Nhóm Thuốc Nhập Flow", code: "CAT-FLOW" });
    testUnit = await Unit.create({ name: "Hộp" });

    // Initial stocks set to 0
    testMedicineA = await Medicine.create({
      name: "Thuốc Test Flow A",
      code: "MED-FLOW-A",
      sellPrice: 4000,
      importPrice: 2500,
      unit: testUnit._id,
      category: testCategory._id,
      stock: 0,
      minStock: 5,
    });

    testMedicineB = await Medicine.create({
      name: "Thuốc Test Flow B",
      code: "MED-FLOW-B",
      sellPrice: 8000,
      importPrice: 5000,
      unit: testUnit._id,
      category: testCategory._id,
      stock: 0,
      minStock: 5,
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

  test("Importing 2 medicines successfully updates stock, lists correctly and reflects in inventory flow", async () => {
    const importDate = new Date();

    // 1. CREATE IMPORT: Medicine A (qty 20) and Medicine B (qty 10)
    const reqCreate = {
      user: { _id: testUser._id },
      body: {
        supplier: testSupplier._id.toString(),
        paymentStatus: "paid",
        importDate,
        notes: "E2E purchase order flow test",
        items: [
          {
            medicine: testMedicineA._id.toString(),
            quantity: 20,
            importPrice: 2500,
            expiryDate: new Date("2028-12-31"),
            manufacturingDate: new Date("2026-01-01"),
            batchNumber: "LOT-FLOW-A",
          },
          {
            medicine: testMedicineB._id.toString(),
            quantity: 10,
            importPrice: 5000,
            expiryDate: new Date("2028-12-31"),
            manufacturingDate: new Date("2026-01-01"),
            batchNumber: "LOT-FLOW-B",
          },
        ],
      },
    };

    let statusResult;
    let jsonResult;

    const resCreate = {
      status(code) {
        statusResult = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await createImport(reqCreate, resCreate);

    assert.equal(statusResult, 201);
    assert.ok(jsonResult.code);

    // 2. CHECK STOCK INCREMENTS IN DATABASE
    const updatedMedA = await Medicine.findById(testMedicineA._id);
    const updatedMedB = await Medicine.findById(testMedicineB._id);

    assert.equal(updatedMedA.stock, 20, "Medicine A stock should be incremented to 20");
    assert.equal(updatedMedB.stock, 10, "Medicine B stock should be incremented to 10");

    // 3. CHECK THE NEW IMPORT APPEARS IN THE LIST
    const reqList = {
      query: {
        page: 1,
        limit: 10,
      },
    };

    let listJsonResult;
    const resList = {
      json(data) {
        listJsonResult = data;
        return this;
      },
    };

    await getImports(reqList, resList);

    assert.ok(listJsonResult.imports);
    assert.equal(listJsonResult.imports.length, 1);
    assert.equal(listJsonResult.imports[0].code, jsonResult.code);
    assert.equal(listJsonResult.imports[0].totalAmount, 20 * 2500 + 10 * 5000); // 100,000

    // 4. CHECK THAT INVENTORY FLOW (NXT) REFLECTS THE IMPORTED QUANTITY
    // Map imported quantities as calculated in the NXT frontend page
    const importedMap = new Map();
    listJsonResult.imports.forEach((imp) => {
      imp.items.forEach((item) => {
        const medId = item.medicine.toString();
        importedMap.set(medId, (importedMap.get(medId) || 0) + item.quantity);
      });
    });

    assert.equal(importedMap.get(testMedicineA._id.toString()), 20, "NXT should show 20 imported for Medicine A");
    assert.equal(importedMap.get(testMedicineB._id.toString()), 10, "NXT should show 10 imported for Medicine B");
  });
});
