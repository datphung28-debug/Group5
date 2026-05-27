import assert from 'node:assert/strict';
import test from 'node:test';
import { getExpirySeverity, getExpirySummary, mapMedicineToExpiryRow } from './expiryUtils.js';

const today = new Date('2026-05-27T00:00:00.000Z');

test('mapMedicineToExpiryRow derives days remaining and severity from expiryDate', () => {
  const row = mapMedicineToExpiryRow({
    _id: 'medicine-id',
    name: 'Thuốc sắp hết hạn',
    code: 'EXP-TEST',
    category: { name: 'Kháng sinh' },
    supplier: { name: 'Dược test' },
    unit: { name: 'Viên' },
    stock: 8,
    importPrice: 1000,
    expiryDate: '2026-06-03T00:00:00.000Z',
  }, today);

  assert.equal(row.id, 'medicine-id');
  assert.equal(row.batch, 'EXP-TEST');
  assert.equal(row.daysRemaining, 7);
  assert.equal(row.severity, 'emergency');
  assert.equal(row.value, 8000);
});

test('getExpirySeverity separates emergency, warning, and tracking ranges', () => {
  assert.equal(getExpirySeverity(7), 'emergency');
  assert.equal(getExpirySeverity(30), 'warning');
  assert.equal(getExpirySeverity(90), 'tracking');
});

test('getExpirySummary counts rows by severity', () => {
  const summary = getExpirySummary([
    { severity: 'emergency' },
    { severity: 'warning' },
    { severity: 'tracking' },
    { severity: 'tracking' },
  ]);

  assert.deepEqual(summary, {
    emergencyCount: 1,
    warningCount: 1,
    trackingCount: 2,
  });
});
