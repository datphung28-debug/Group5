import assert from 'node:assert/strict';
import test from 'node:test';
import { getDashboardTopProducts } from './dashboardTopProducts.js';

test('getDashboardTopProducts keeps an empty API response empty', () => {
  assert.deepEqual(getDashboardTopProducts([]), []);
});
