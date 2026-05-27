import assert from "node:assert/strict";
import test from "node:test";
import Supplier from "./Supplier.js";

test("Supplier schema keeps fields used by supplier UI", () => {
  const supplier = new Supplier({
    name: "Công ty kiểm thử",
    code: "NCC-TEST",
    taxCode: "0312345678",
    phone: "0909000000",
    email: "test@example.com",
    address: "TP. Hồ Chí Minh",
    contactName: "Nguyễn Văn A",
    contactPhone: "0909111222",
    currentDebt: 1200000,
    debtLimit: 5000000,
    paymentTerms: "30 ngày",
    status: "Đang nợ",
    notes: "Ghi chú kiểm thử",
    purchaseHistory: [{ id: "PN-TEST", date: "27/05/2026", value: 1200000, status: "Đã nhập" }],
    debtHistory: [{ id: "CN-TEST", date: "27/05/2026", note: "Phát sinh", amount: 1200000 }],
  });

  const data = supplier.toObject();

  assert.equal(data.code, "NCC-TEST");
  assert.equal(data.contactName, "Nguyễn Văn A");
  assert.equal(data.contactPhone, "0909111222");
  assert.equal(data.currentDebt, 1200000);
  assert.equal(data.debtLimit, 5000000);
  assert.equal(data.paymentTerms, "30 ngày");
  assert.equal(data.status, "Đang nợ");
  assert.equal(data.notes, "Ghi chú kiểm thử");
  assert.equal(data.purchaseHistory.length, 1);
  assert.equal(data.debtHistory.length, 1);
});
