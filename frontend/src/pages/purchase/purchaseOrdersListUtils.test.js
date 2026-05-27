import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getImportId,
  getImportsFromResponse,
  getPaymentStatusMeta,
  getSupplierName,
} from './purchaseOrdersListUtils.js';

test('getImportsFromResponse supports backend paginated import response', () => {
  const imports = [{ _id: 'import-1' }];

  assert.deepEqual(getImportsFromResponse({ imports, total: 1 }), imports);
  assert.deepEqual(getImportsFromResponse(imports), imports);
  assert.deepEqual(getImportsFromResponse(null), []);
});

test('getImportId supports Mongo and local identifiers', () => {
  assert.equal(getImportId({ _id: 'mongo-id' }), 'mongo-id');
  assert.equal(getImportId({ id: 'local-id' }), 'local-id');
});

test('getSupplierName handles populated and raw supplier values', () => {
  assert.equal(getSupplierName({ supplier: { name: 'NCC A' } }), 'NCC A');
  assert.equal(getSupplierName({ supplier: 'supplier-id' }), 'supplier-id');
  assert.equal(getSupplierName({}), 'Chưa có NCC');
});

test('getPaymentStatusMeta maps import payment statuses to labels and colors', () => {
  assert.deepEqual(getPaymentStatusMeta('paid'), { label: 'Đã thanh toán', color: 'success' });
  assert.deepEqual(getPaymentStatusMeta('partial'), { label: 'Thanh toán một phần', color: 'warning' });
  assert.deepEqual(getPaymentStatusMeta('unpaid'), { label: 'Chưa thanh toán', color: 'error' });
  assert.deepEqual(getPaymentStatusMeta('unknown'), { label: 'Không rõ', color: 'default' });
});
