import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getSalesFromResponse,
  normalizeInvoice,
} from './salesInvoiceUtils.js';

test('getSalesFromResponse supports backend paginated sales response', () => {
  const sales = [{ _id: 'sale-1' }];

  assert.deepEqual(getSalesFromResponse({ sales, total: 1 }), sales);
  assert.deepEqual(getSalesFromResponse(sales), sales);
  assert.deepEqual(getSalesFromResponse(null), []);
});

test('normalizeInvoice maps sale API data to invoice table/detail shape', () => {
  const invoice = normalizeInvoice({
    _id: 'sale-1',
    code: 'HD001',
    customer: { name: 'Nguyen Van A', phone: '0900000000' },
    createdBy: { name: 'Thu ngan' },
    totalAmount: 100000,
    amountPaid: 120000,
    items: [
      {
        _id: 'item-1',
        medicine: { name: 'Paracetamol' },
        quantity: 2,
        unitPrice: 50000,
        discount: 0,
        total: 100000,
      },
    ],
  });

  assert.equal(invoice.id, 'sale-1');
  assert.equal(invoice.customerName, 'Nguyen Van A');
  assert.equal(invoice.customerPhone, '0900000000');
  assert.equal(invoice.staff, 'Thu ngan');
  assert.equal(invoice.total, 100000);
  assert.equal(invoice.paid, 120000);
  assert.deepEqual(invoice.items, [
    {
      id: 'item-1',
      name: 'Paracetamol',
      quantity: 2,
      unitPrice: 50000,
      discount: 0,
      total: 100000,
    },
  ]);
});

test('normalizeInvoice defaults missing customer and payment fields', () => {
  const invoice = normalizeInvoice({ _id: 'sale-1', totalAmount: 50000 });

  assert.equal(invoice.customerName, 'Khách lẻ');
  assert.equal(invoice.customerPhone, '—');
  assert.equal(invoice.staff, '—');
  assert.equal(invoice.paid, 50000);
  assert.deepEqual(invoice.items, []);
});
