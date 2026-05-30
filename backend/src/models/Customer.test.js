import assert from "node:assert/strict";
import test from "node:test";
import Customer from "./Customer.js";

test("Customer schema has all required and optional GPP MVP fields", () => {
  const dateOfBirth = new Date("1995-05-15");
  const customer = new Customer({
    name: "Nguyễn Văn A",
    phone: "0909111222",
    email: "customer@example.com",
    address: "123 Đường Ba Tháng Hai, Quận 10",
    gender: "male",
    dateOfBirth,
    notes: "Khách quen",
    allergies: "Dị ứng với Penicillin",
    chronicDiseases: "Cao huyết áp",
    totalSpent: 1500000,
    isActive: true,
  });

  const data = customer.toObject();

  assert.equal(data.name, "Nguyễn Văn A");
  assert.equal(data.phone, "0909111222");
  assert.equal(data.email, "customer@example.com");
  assert.equal(data.address, "123 Đường Ba Tháng Hai, Quận 10");
  assert.equal(data.gender, "male");
  assert.equal(data.dateOfBirth.getTime(), dateOfBirth.getTime());
  assert.equal(data.notes, "Khách quen");
  assert.equal(data.allergies, "Dị ứng với Penicillin");
  assert.equal(data.chronicDiseases, "Cao huyết áp");
  assert.equal(data.totalSpent, 1500000);
  assert.equal(data.isActive, true);
});
