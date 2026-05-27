import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSalePayload,
  getCartStockIssue,
  getCashPaymentIssue,
} from './posSaleUtils.js';

test('buildSalePayload maps POS cart to sale API contract', () => {
  const payload = buildSalePayload({
    cart: [
      { medicine: { _id: 'medicine-1' }, quantity: 2, discount: 10 },
      { medicine: { _id: 'medicine-2' }, quantity: 1 },
    ],
    customer: 'customer-1',
    prescription: 'prescription-1',
    discount: 5000,
    paymentMethod: 'cash',
    amountPaid: 50000,
  });

  assert.deepEqual(payload, {
    items: [
      { medicine: 'medicine-1', quantity: 2, discount: 10 },
      { medicine: 'medicine-2', quantity: 1, discount: 0 },
    ],
    customer: 'customer-1',
    prescription: 'prescription-1',
    discount: 5000,
    paymentMethod: 'cash',
    amountPaid: 50000,
  });
});

test('getCartStockIssue detects external, out-of-stock, and over-stock medicines', () => {
  assert.equal(
    getCartStockIssue([{ medicine: { isExternal: true, name: 'Thuốc ngoài' }, quantity: 1 }]),
    'Giỏ hàng chứa thuốc không nằm trong danh mục hệ thống. Vui lòng xóa các thuốc này trước khi thanh toán.'
  );
  assert.equal(
    getCartStockIssue([{ medicine: { name: 'Paracetamol', stock: 0 }, quantity: 1 }]),
    'Thuốc "Paracetamol" đã hết hàng'
  );
  assert.equal(
    getCartStockIssue([{ medicine: { name: 'Vitamin C', stock: 2 }, quantity: 3 }]),
    'Thuốc "Vitamin C" không đủ tồn kho. Còn lại: 2'
  );
  assert.equal(getCartStockIssue([{ medicine: { name: 'Vitamin C', stock: 5 }, quantity: 3 }]), null);
});

test('getCashPaymentIssue requires enough cash for cash payments only', () => {
  assert.equal(getCashPaymentIssue({ paymentMethod: 'transfer', amountPaid: 0, total: 100000 }), null);
  assert.equal(
    getCashPaymentIssue({ paymentMethod: 'cash', amountPaid: 50000, total: 100000 }),
    'Tiền khách đưa không đủ thanh toán'
  );
  assert.equal(getCashPaymentIssue({ paymentMethod: 'cash', amountPaid: 100000, total: 100000 }), null);
});
