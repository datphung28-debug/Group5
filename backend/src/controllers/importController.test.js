import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMedicineImportUpdate,
  validateCreateImportPayload,
} from "./importController.js";

test("validateCreateImportPayload requires supplier and at least one item", () => {
  assert.equal(validateCreateImportPayload({}).message, "Vui lòng chọn nhà cung cấp");
  assert.equal(
    validateCreateImportPayload({ supplier: "supplier-id", items: [] }).message,
    "Phiếu nhập phải có ít nhất một mặt hàng"
  );
});

test("validateCreateImportPayload validates each import item quantity and price", () => {
  assert.equal(
    validateCreateImportPayload({
      supplier: "supplier-id",
      items: [{ medicine: "medicine-id", importPrice: 1000 }],
    }).message,
    "Vui lòng nhập số lượng"
  );
  assert.equal(
    validateCreateImportPayload({
      supplier: "supplier-id",
      items: [{ medicine: "medicine-id", quantity: 0, importPrice: 1000 }],
    }).message,
    "Số lượng nhập phải lớn hơn 0"
  );
  assert.equal(
    validateCreateImportPayload({
      supplier: "supplier-id",
      items: [{ medicine: "medicine-id", quantity: 1, importPrice: -1 }],
    }).message,
    "Giá nhập không được âm"
  );
});

test("buildMedicineImportUpdate increments stock and stores latest import metadata", () => {
  const update = buildMedicineImportUpdate({
    quantity: 5,
    importPrice: 12000,
    expiryDate: "2027-06-30T00:00:00.000Z",
    manufacturingDate: "2026-01-15T00:00:00.000Z",
  });

  assert.deepEqual(update, {
    $inc: { stock: 5 },
    importPrice: 12000,
    expiryDate: "2027-06-30T00:00:00.000Z",
    manufacturingDate: "2026-01-15T00:00:00.000Z",
  });
});
