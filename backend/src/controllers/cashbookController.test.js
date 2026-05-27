import assert from "node:assert/strict";
import test from "node:test";
import { buildCashbookSummary, normalizeCashbookEntries } from "./cashbookController.js";

test("normalizeCashbookEntries maps sales and imports into ledger rows", () => {
  const entries = normalizeCashbookEntries({
    sales: [
      {
        _id: "sale-1",
        code: "HD001",
        totalAmount: 150000,
        paymentMethod: "cash",
        createdAt: new Date("2026-05-03T09:00:00.000Z"),
        createdBy: { name: "Admin GPP" },
      },
    ],
    imports: [
      {
        _id: "import-1",
        code: "PN001",
        totalAmount: 100000,
        paymentStatus: "paid",
        importDate: new Date("2026-05-03T10:00:00.000Z"),
        createdBy: { name: "Admin GPP" },
        supplier: { name: "NCC A" },
      },
    ],
    manualTransactions: [
      {
        _id: "manual-1",
        type: "chi",
        category: "Chi thủ công",
        paymentMethod: "transfer",
        description: "Chi điện nước",
        amount: 30000,
        transactionDate: new Date("2026-05-03T11:00:00.000Z"),
        createdBy: { name: "Admin GPP" },
      },
    ],
  });

  assert.deepEqual(entries.map((entry) => entry.id), ["manual-manual-1", "import-import-1", "sale-sale-1"]);
  assert.equal(entries[0].amount, 30000);
  assert.equal(entries[0].type, "chi");
  assert.equal(entries[1].type, "chi");
  assert.equal(entries[2].type, "thu");
});

test("buildCashbookSummary calculates revenue, expense, balance, and payment totals", () => {
  const summary = buildCashbookSummary([
    { type: "thu", paymentMethod: "cash", amount: 150000 },
    { type: "chi", paymentMethod: "transfer", amount: 100000 },
    { type: "chi", paymentMethod: "transfer", amount: 30000 },
  ]);

  assert.deepEqual(summary.kpis, {
    totalRevenue: 150000,
    totalExpense: 130000,
    netBalance: 20000,
    currentBalance: 20000,
  });
  assert.deepEqual(summary.paymentSummaries, {
    cash: { count: 1, total: 150000 },
    transfer: { count: 2, total: -130000 },
    card: { count: 0, total: 0 },
  });
});
