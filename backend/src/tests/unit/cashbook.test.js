import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCashbookEntries, buildCashbookSummary } from '../../controllers/cashbookController.js';

describe('Cashbook Controller Logic', () => {
  const mockSales = [
    { _id: 's1', code: 'SALE01', paymentMethod: 'cash', totalAmount: 100000, createdAt: new Date('2023-01-01T10:00:00Z'), createdBy: { name: 'Admin' } },
    { _id: 's2', code: 'SALE02', paymentMethod: 'transfer', totalAmount: 50000, createdAt: new Date('2023-01-02T10:00:00Z'), createdBy: { name: 'Admin' } }
  ];

  const mockImports = [
    { _id: 'i1', code: 'IMP01', paymentStatus: 'paid', totalAmount: 80000, importDate: new Date('2023-01-01T12:00:00Z'), supplier: { name: 'NCC A' }, createdBy: { name: 'Admin' } }
  ];

  const mockReturns = [
    { _id: 'r1', code: 'RET01', status: 'approved', refundMethod: 'cash', refundAmount: 20000, updatedAt: new Date('2023-01-01T14:00:00Z'), createdBy: { name: 'Admin' } }
  ];

  const mockManuals = [
    { _id: 'm1', type: 'chi', category: 'Tiền điện', paymentMethod: 'cash', amount: 10000, transactionDate: new Date('2023-01-01T15:00:00Z'), createdBy: { name: 'Admin' }, description: 'Đóng tiền điện' }
  ];

  it('✅ normalizeCashbookEntries: should format and merge all arrays properly', () => {
    const entries = normalizeCashbookEntries({ 
      sales: mockSales, 
      imports: mockImports, 
      returns: mockReturns, 
      manualTransactions: mockManuals 
    });

    assert.equal(entries.length, 5); // 2 sales + 1 import + 1 return + 1 manual
    
    // Check sale parsing
    const saleEntry = entries.find(e => e.id === 'sale-s1');
    assert.equal(saleEntry.type, 'thu');
    assert.equal(saleEntry.amount, 100000);
    assert.equal(saleEntry.paymentMethod, 'cash');

    // Check import parsing
    const importEntry = entries.find(e => e.id === 'import-i1');
    assert.equal(importEntry.type, 'chi');
    assert.equal(importEntry.amount, 80000);
    assert.equal(importEntry.paymentMethod, 'transfer');
  });

  it('✅ buildCashbookSummary: should correctly calculate revenue, expense and net balance', () => {
    const entries = normalizeCashbookEntries({ 
      sales: mockSales, 
      imports: mockImports, 
      returns: mockReturns, 
      manualTransactions: mockManuals 
    });

    const summary = buildCashbookSummary(entries);

    // Total Revenue = 100,000 + 50,000 = 150,000
    assert.equal(summary.kpis.totalRevenue, 150000);
    
    // Total Expense = 80,000 (import) + 20,000 (return) + 10,000 (manual) = 110,000
    assert.equal(summary.kpis.totalExpense, 110000);

    // Net Balance = 150,000 - 110,000 = 40,000
    assert.equal(summary.kpis.netBalance, 40000);

    // Check payment summaries
    // Cash: thu 100k - chi 20k - chi 10k = 70k
    assert.equal(summary.paymentSummaries.cash.total, 70000);
    
    // Transfer: thu 50k - chi 80k = -30k
    assert.equal(summary.paymentSummaries.transfer.total, -30000);
  });
});
