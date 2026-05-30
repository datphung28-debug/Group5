import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Customer from "../models/Customer.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/gpp_task_61";

test.describe("Customer Database Integration Tests", () => {
  test.before(async () => {
    await mongoose.connect(MONGO_URI);
    // Cleanup prior test run data
    await Customer.deleteMany({ phone: { $in: ["0999888777", "0999888776"] } });
  });

  test.after(async () => {
    // Final cleanup
    await Customer.deleteMany({ phone: { $in: ["0999888777", "0999888776"] } });
    await mongoose.disconnect();
  });

  test("End-to-End CRUD cycle: create, read, update, soft-delete", async () => {
    // 1. CREATE
    const newCustomer = await Customer.create({
      name: "Nguyễn Khách Test",
      phone: "0999888777",
      email: "test.customer@gpp.com",
      address: "456 Đường CMT8, Quận 3",
      gender: "female",
      dateOfBirth: new Date("1990-01-01"),
      notes: "Khách hàng thử nghiệm tích hợp",
      allergies: "Tetracycline",
      chronicDiseases: "Tiểu đường",
    });

    assert.ok(newCustomer._id);
    assert.equal(newCustomer.name, "Nguyễn Khách Test");
    assert.equal(newCustomer.phone, "0999888777");
    assert.equal(newCustomer.allergies, "Tetracycline");
    assert.equal(newCustomer.chronicDiseases, "Tiểu đường");
    assert.equal(newCustomer.isActive, true);

    // 2. READ (BY ID)
    const foundCustomer = await Customer.findById(newCustomer._id);
    assert.ok(foundCustomer);
    assert.equal(foundCustomer.phone, "0999888777");

    // 3. UPDATE (PHONE AND DETAILS)
    foundCustomer.phone = "0999888776";
    foundCustomer.notes = "Đã cập nhật số điện thoại";
    await foundCustomer.save();

    const updatedCustomer = await Customer.findById(newCustomer._id);
    assert.equal(updatedCustomer.phone, "0999888776");
    assert.equal(updatedCustomer.notes, "Đã cập nhật số điện thoại");

    // 4. SOFT DELETE
    updatedCustomer.isActive = false;
    await updatedCustomer.save();

    const deletedCustomer = await Customer.findById(newCustomer._id);
    assert.equal(deletedCustomer.isActive, false);

    // 5. LIST FILTER (Should exclude soft-deleted by default)
    const activeCustomers = await Customer.find({ isActive: true });
    const hasDeletedCustomer = activeCustomers.some(c => c._id.equals(newCustomer._id));
    assert.equal(hasDeletedCustomer, false, "Active customer list should not contain soft-deleted customer");
  });
});
