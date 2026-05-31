import assert from 'node:assert/strict';
import test from 'node:test';
import { checkPrescriptionSafety } from './drugSafety.js';

test('checkPrescriptionSafety does not return simulated medical warnings', () => {
  const result = checkPrescriptionSafety([
    { medicine: { name: 'Paracetamol 500mg' }, quantity: 9, days: 1 },
    { medicine: { name: 'Ibuprofen 400mg' }, quantity: 1, days: 1 },
  ]);

  assert.deepEqual(result, {
    interactions: [],
    dosageWarnings: [],
  });
});
