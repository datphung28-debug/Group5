import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMedicineStockDecreaseUpdate,
  buildProcessedSaleItem,
  calculateSalePayment,
  validateCreateSalePayload,
} from "./saleController.js";

test("validateCreateSalePayload requires at least one item", () => {
  assert.equal(validateCreateSalePayload({}).message, "Hóa đơn phải có ít nhất một sản phẩm");
  assert.equal(
    validateCreateSalePayload({ items: [] }).message,
    "Hóa đơn phải có ít nhất một sản phẩm"
  );
});

test("validateCreateSalePayload validates medicine, quantity, and discounts", () => {
  assert.equal(
    validateCreateSalePayload({ items: [{ quantity: 1 }] }).message,
    "Vui lòng chọn thuốc bán"
  );
  assert.equal(
    validateCreateSalePayload({ items: [{ medicine: "medicine-id", quantity: 0 }] }).message,
    "Số lượng bán phải lớn hơn 0"
  );
  assert.equal(
    validateCreateSalePayload({ items: [{ medicine: "medicine-id", quantity: 1, discount: 101 }] }).message,
    "Chiết khấu sản phẩm phải từ 0 đến 100"
  );
  assert.equal(
    validateCreateSalePayload({ items: [{ medicine: "medicine-id", quantity: 1 }], discount: -1 }).message,
    "Chiết khấu hóa đơn không được âm"
  );
});

test("buildProcessedSaleItem calculates snapshot price and line total", () => {
  const medicine = { _id: "medicine-id", sellPrice: 10000 };
  const item = buildProcessedSaleItem({ medicine: "medicine-id", quantity: 2, discount: 10 }, medicine);

  assert.deepEqual(item, {
    medicine: "medicine-id",
    quantity: 2,
    unitPrice: 10000,
    discount: 10,
    total: 18000,
  });
});

test("calculateSalePayment validates invoice discount and amount paid", () => {
  assert.deepEqual(calculateSalePayment({ subTotal: 50000, discount: 5000, amountPaid: 60000 }), {
    totalAmount: 45000,
    amountPaid: 60000,
    changeAmount: 15000,
  });
  assert.equal(
    calculateSalePayment({ subTotal: 50000, discount: 60000 }).message,
    "Chiết khấu hóa đơn không được lớn hơn tổng tiền hàng"
  );
  assert.equal(
    calculateSalePayment({ subTotal: 50000, discount: 0, amountPaid: 40000 }).message,
    "Tiền khách đưa không đủ thanh toán"
  );
});

test("buildMedicineStockDecreaseUpdate decrements stock by sold quantity", () => {
  assert.deepEqual(buildMedicineStockDecreaseUpdate({ quantity: 3 }), {
    $inc: { stock: -3 },
  });
});
