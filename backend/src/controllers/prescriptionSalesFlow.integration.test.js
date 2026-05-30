import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Customer from "../models/Customer.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";
import Medicine from "../models/Medicine.js";
import Prescription from "../models/Prescription.js";
import Sale from "../models/Sale.js";
import { createSale, getSaleById } from "./saleController.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gpp_task_104";

test.describe("Prescription-only Medicine Sales Flow Integration Tests (Task 10.4)", () => {
  let testUser;
  let testCustomer;
  let testCategory;
  let testUnit;
  let rxMedicine;
  let testPrescription;

  test.before(async () => {
    await mongoose.connect(MONGO_URI);
    await Customer.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await Medicine.deleteMany({});
    await Prescription.deleteMany({});
    await Sale.deleteMany({});

    testUser = await User.create({
      name: "Bác Sĩ GPP",
      email: "pharmacist.rx@gpp.com",
      password: "hashedpassword123",
      role: "admin",
    });

    testCustomer = await Customer.create({
      name: "Bệnh Nhân A",
      phone: "0955555444",
      totalSpent: 0,
    });

    testCategory = await Category.create({ name: "Kháng Sinh Kê Đơn", code: "CAT-RX" });
    testUnit = await Unit.create({ name: "Hộp" });

    // Create prescription-only medicine (requiresPrescription = true)
    rxMedicine = await Medicine.create({
      name: "Kháng Sinh Amoxicillin 500mg",
      code: "RX-AMX-500",
      sellPrice: 3500,
      importPrice: 2000,
      unit: testUnit._id,
      category: testCategory._id,
      stock: 40,
      minStock: 5,
      requiresPrescription: true,
    });

    // Create a prescription in the system
    testPrescription = await Prescription.create({
      code: "DT202605300001",
      patientName: "Bệnh Nhân A",
      patientAge: 35,
      patientGender: "male",
      doctorName: "Bác Sĩ Nguyễn Văn A",
      diagnosis: "Viêm đường hô hấp trên",
      items: [
        {
          medicine: rxMedicine._id,
          quantity: 10,
          dosage: "1 viên",
          frequency: "2 lần/ngày",
        },
      ],
      createdBy: testUser._id,
    });
  });

  test.after(async () => {
    await Customer.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await Medicine.deleteMany({});
    await Prescription.deleteMany({});
    await Sale.deleteMany({});
    await mongoose.disconnect();
  });

  test("Selling prescription-only drug with prescription ID successfully links it and retrieves populated details", async () => {
    // 1. CREATE POS SALE LINKED WITH PRESCRIPTION
    const reqSale = {
      user: { _id: testUser._id },
      body: {
        customer: testCustomer._id.toString(),
        prescription: testPrescription._id.toString(), // Link prescription ID
        items: [
          {
            medicine: rxMedicine._id.toString(),
            quantity: 10,
          },
        ],
        discount: 0,
        paymentMethod: "cash",
        amountPaid: 35000, // 10 * 3500 = 35000
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
    assert.equal(saleJson.prescription.toString(), testPrescription._id.toString(), "Sale record must store the prescription ID");

    // 2. CHECK STOCK DEDUCTION (40 -> 30)
    const updatedRxMedicine = await Medicine.findById(rxMedicine._id);
    assert.equal(updatedRxMedicine.stock, 30, "Stock of prescription drug must decrease correctly");

    // 3. RETRIEVE SALE DETAILS AND VERIFY POPULATION
    const reqGet = {
      params: { id: saleJson._id.toString() },
    };

    let getStatus;
    let getJson;

    const resGet = {
      status(code) {
        getStatus = code;
        return this;
      },
      json(data) {
        getJson = data;
        return this;
      },
    };

    await getSaleById(reqGet, resGet);

    assert.ok(getJson, "Sale details must be retrieved");
    assert.ok(getJson.prescription, "Prescription must be populated");
    assert.equal(getJson.prescription.code, "DT202605300001", "Prescription code should match");
    assert.equal(getJson.prescription.patientName, "Bệnh Nhân A", "Patient name should match");
  });
});
