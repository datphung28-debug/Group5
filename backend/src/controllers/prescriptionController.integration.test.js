import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Prescription from "../models/Prescription.js";
import Medicine from "../models/Medicine.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";
import User from "../models/User.js";
import { createPrescription, getPrescriptionById } from "./prescriptionController.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gpp_task_71";

test.describe("Prescription Controller Integration Tests", () => {
  let testMedicine;
  let testUser;
  let testCategory;
  let testUnit;

  test.before(async () => {
    await mongoose.connect(MONGO_URI);
    // Cleanup prior test run data
    await Prescription.deleteMany({});
    await Medicine.deleteMany({ code: "MED-PRES-TEST" });
    await Category.deleteMany({ name: "Nhóm Đơn Thuốc" });
    await Unit.deleteMany({ name: "Hộp" });
    await User.deleteMany({ email: "doctor.test@gpp.com" });

    // Setup mock User
    testUser = await User.create({
      name: "Bác Sĩ A",
      email: "doctor.test@gpp.com",
      password: "hashedpassword123",
      role: "admin",
    });

    // Setup Category & Unit for Medicine
    testCategory = await Category.create({ name: "Nhóm Đơn Thuốc", code: "CAT-PRES" });
    testUnit = await Unit.create({ name: "Hộp" });

    // Setup mock Medicine
    testMedicine = await Medicine.create({
      name: "Thuốc Test Đơn",
      code: "MED-PRES-TEST",
      sellPrice: 3000,
      importPrice: 2000,
      unit: testUnit._id,
      category: testCategory._id,
      stock: 50,
      minStock: 5,
    });
  });

  test.after(async () => {
    // Final cleanup
    await Prescription.deleteMany({});
    await Medicine.deleteMany({ code: "MED-PRES-TEST" });
    await Category.deleteMany({ name: "Nhóm Đơn Thuốc" });
    await Unit.deleteMany({ name: "Hộp" });
    await User.deleteMany({ email: "doctor.test@gpp.com" });
    await mongoose.disconnect();
  });

  test("Should fail if patientName is missing", async () => {
    const req = {
      body: {
        patientName: "",
        items: [{ medicine: testMedicine._id.toString(), quantity: 1, dosage: "1 viên", frequency: "1 lần" }],
      },
      user: { _id: testUser._id },
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

    await createPrescription(req, res);

    assert.equal(responseStatus, 400);
    assert.equal(responseData.message, "Vui lòng nhập tên bệnh nhân");
  });

  test("Should fail if items are empty", async () => {
    const req = {
      body: {
        patientName: "Nguyễn Văn A",
        items: [],
      },
      user: { _id: testUser._id },
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

    await createPrescription(req, res);

    assert.equal(responseStatus, 400);
    assert.equal(responseData.message, "Đơn thuốc phải có ít nhất một mặt hàng");
  });

  test("Should fail if medicine does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const req = {
      body: {
        patientName: "Nguyễn Văn A",
        items: [{ medicine: fakeId, quantity: 1, dosage: "1 viên", frequency: "1 lần" }],
      },
      user: { _id: testUser._id },
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

    await createPrescription(req, res);

    assert.equal(responseStatus, 400);
    assert.match(responseData.message, /Thuốc không tồn tại hoặc đã bị xóa/);
  });

  test("E2E CRUD: creates a prescription and retrieves its details successfully", async () => {
    const reqCreate = {
      body: {
        patientName: "Bệnh Nhân Hồ Sơ",
        patientAge: 30,
        patientGender: "female",
        doctorName: "Bác Sĩ Nguyễn Văn A",
        hospitalName: "Bệnh viện TW",
        diagnosis: "Viêm họng hạt",
        items: [
          {
            medicine: testMedicine._id.toString(),
            quantity: 5,
            dosage: "1 viên",
            frequency: "2 lần/ngày",
            duration: "5 ngày",
            notes: "Uống sau ăn no",
          },
        ],
        status: "pending",
        notes: "Uống nhiều nước ấm",
      },
      user: { _id: testUser._id },
    };

    let createStatus = 200;
    let createData = null;
    const resCreate = {
      status(code) {
        createStatus = code;
        return this;
      },
      json(data) {
        createData = data;
        return this;
      },
    };

    await createPrescription(reqCreate, resCreate);

    assert.equal(createStatus, 201);
    assert.ok(createData._id);
    assert.ok(createData.code);
    assert.equal(createData.patientName, "Bệnh Nhân Hồ Sơ");
    assert.equal(createData.doctorName, "Bác Sĩ Nguyễn Văn A");

    // Retrieve details
    const reqGet = {
      params: { id: createData._id.toString() },
    };

    let getStatus = 200;
    let getData = null;
    const resGet = {
      status(code) {
        getStatus = code;
        return this;
      },
      json(data) {
        getData = data;
        return this;
      },
    };

    await getPrescriptionById(reqGet, resGet);

    assert.equal(getStatus, 200);
    assert.equal(getData.patientName, "Bệnh Nhân Hồ Sơ");
    assert.equal(getData.items.length, 1);
    assert.equal(getData.items[0].medicine.name, "Thuốc Test Đơn");
  });
});
