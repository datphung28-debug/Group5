import assert from "node:assert/strict";
import test from "node:test";
import Prescription from "./Prescription.js";
import mongoose from "mongoose";

test("Prescription schema has all GPP MVP required fields", () => {
  const medicineId = new mongoose.Types.ObjectId();
  const customerId = new mongoose.Types.ObjectId();
  const userId = new mongoose.Types.ObjectId();

  const prescription = new Prescription({
    code: "DT202605300001",
    customer: customerId,
    patientName: "Nguyễn Văn Bệnh",
    patientAge: 45,
    patientGender: "male",
    doctorName: "Bác Sĩ Nguyễn Văn A",
    hospitalName: "Bệnh Viện Bạch Mai",
    diagnosis: "Viêm phế quản cấp",
    items: [
      {
        medicine: medicineId,
        dosage: "1 viên",
        frequency: "2 lần/ngày",
        duration: "5 ngày",
        quantity: 10,
        notes: "Uống sau ăn",
      },
    ],
    status: "pending",
    notes: "Đơn thuốc mẫu",
    createdBy: userId,
  });

  const data = prescription.toObject();

  assert.equal(data.code, "DT202605300001");
  assert.equal(data.patientName, "Nguyễn Văn Bệnh");
  assert.equal(data.patientAge, 45);
  assert.equal(data.patientGender, "male");
  assert.equal(data.doctorName, "Bác Sĩ Nguyễn Văn A");
  assert.equal(data.hospitalName, "Bệnh Viện Bạch Mai");
  assert.equal(data.diagnosis, "Viêm phế quản cấp");
  assert.equal(data.status, "pending");
  assert.equal(data.notes, "Đơn thuốc mẫu");

  assert.equal(data.items.length, 1);
  assert.equal(data.items[0].medicine.toString(), medicineId.toString());
  assert.equal(data.items[0].dosage, "1 viên");
  assert.equal(data.items[0].frequency, "2 lần/ngày");
  assert.equal(data.items[0].duration, "5 ngày");
  assert.equal(data.items[0].quantity, 10);
  assert.equal(data.items[0].notes, "Uống sau ăn");
});
