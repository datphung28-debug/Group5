import assert from 'node:assert/strict';
import test from 'node:test';
import { getInventoryStatus, mapMedicineToInventoryRow } from './inventoryUtils.js';

test('mapMedicineToInventoryRow preserves stock, minStock, expiryDate, and location', () => {
  const row = mapMedicineToInventoryRow({
    _id: 'medicine-id',
    code: 'MED-LOW',
    name: 'Thuốc tồn thấp',
    ingredients: 'Hoạt chất test',
    manufacturer: 'GPP',
    category: { name: 'Giảm đau' },
    unit: { name: 'Viên' },
    stock: 5,
    minStock: 10,
    importPrice: 1000,
    expiryDate: '2026-12-31T00:00:00.000Z',
    location: { zone: 'B', shelf: 2, row: 3, column: 4, label: 'B-02-3-4' },
  });

  assert.equal(row.id, 'medicine-id');
  assert.equal(row.totalStock, 5);
  assert.equal(row.minStock, 10);
  assert.equal(row.nearestExpiry, '2026-12-31T00:00:00.000Z');
  assert.equal(row.location.label, 'B-02-3-4');
  assert.equal(row.inventoryValue, 5000);
});

test('getInventoryStatus warns when stock is below or equal to minStock', () => {
  assert.equal(getInventoryStatus({ totalStock: 10, minStock: 10 }).label, 'Sắp hết');
  assert.equal(getInventoryStatus({ totalStock: 11, minStock: 10 }).label, 'Bình thường');
});
