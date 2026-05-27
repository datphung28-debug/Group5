import assert from 'node:assert/strict';
import test from 'node:test';
import { buildImportPayload, summarizePurchaseItems } from './purchaseOrderUtils.js';

const isoDate = (value) => ({ toISOString: () => value });

test('buildImportPayload maps purchase form values to import API contract', () => {
  const payload = buildImportPayload({
    values: {
      supplierId: 'supplier-1',
      paymentMethod: 'debt',
      orderDate: isoDate('2026-05-27T00:00:00.000Z'),
      note: 'Giao buoi sang',
    },
    items: [
      {
        medicineId: 'medicine-1',
        quantity: 3,
        importPrice: 10000,
        discount: 10,
        batchNumber: 'BATCH-A',
        expiryDate: isoDate('2027-06-30T00:00:00.000Z'),
      },
      { medicineId: null, quantity: 1, importPrice: 5000 },
    ],
    discountPercent: 5,
  });

  assert.deepEqual(payload, {
    supplier: 'supplier-1',
    paymentStatus: 'unpaid',
    importDate: '2026-05-27T00:00:00.000Z',
    notes: 'Giao buoi sang',
    items: [
      {
        medicine: 'medicine-1',
        quantity: 3,
        importPrice: 8550,
        batchNumber: 'BATCH-A',
        expiryDate: '2027-06-30T00:00:00.000Z',
      },
    ],
  });
});

test('buildImportPayload throws when no medicine rows are selected', () => {
  assert.throws(
    () => buildImportPayload({ values: { supplierId: 'supplier-1' }, items: [], discountPercent: 0 }),
    /Vui lòng thêm ít nhất một loại thuốc/
  );
});

test('summarizePurchaseItems calculates item count, quantity, subtotal, and total', () => {
  const summary = summarizePurchaseItems({
    items: [
      { medicineId: 'medicine-1', quantity: 2, importPrice: 10000, discount: 10 },
      { medicineId: 'medicine-2', quantity: 3, importPrice: 5000, discount: 0 },
    ],
    discountPercent: 5,
  });

  assert.deepEqual(summary, {
    totalItems: 2,
    totalQuantity: 5,
    subtotal: 33000,
    total: 31350,
  });
});
