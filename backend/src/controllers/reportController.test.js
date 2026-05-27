import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRevenueReportPayload,
  normalizeRevenueRange,
} from "./reportController.js";

test("normalizeRevenueRange builds a month range from date filters", () => {
  const range = normalizeRevenueRange({
    fromDate: "2026-05-03T00:00:00.000Z",
    toDate: "2026-05-09T00:00:00.000Z",
  });

  assert.equal(range.start.getFullYear(), 2026);
  assert.equal(range.start.getMonth(), 4);
  assert.equal(range.start.getDate(), 3);
  assert.equal(range.start.getHours(), 0);
  assert.equal(range.end.getFullYear(), 2026);
  assert.equal(range.end.getMonth(), 4);
  assert.equal(range.end.getDate(), 9);
  assert.equal(range.end.getHours(), 23);
  assert.equal(range.end.getMinutes(), 59);
  assert.equal(range.end.getSeconds(), 59);
  assert.equal(range.end.getMilliseconds(), 999);
  assert.equal(range.groupType, "daily");
});

test("buildRevenueReportPayload computes KPIs and chart data from sales", () => {
  const payload = buildRevenueReportPayload({
    sales: [
      {
        createdAt: new Date("2026-05-03T09:00:00.000Z"),
        totalAmount: 100000,
        paymentMethod: "cash",
        items: [
          {
            quantity: 2,
            total: 100000,
            medicine: {
              importPrice: 30000,
              category: { name: "Giảm đau" },
            },
          },
        ],
      },
      {
        createdAt: new Date("2026-05-04T09:00:00.000Z"),
        totalAmount: 50000,
        paymentMethod: "transfer",
        items: [
          {
            quantity: 1,
            total: 50000,
            medicine: {
              importPrice: 20000,
              category: { name: "Vitamin" },
            },
          },
        ],
      },
    ],
    groupType: "daily",
  });

  assert.deepEqual(payload.kpis, {
    totalRevenue: 150000,
    grossProfit: 70000,
    margin: 46.67,
    invoiceCount: 2,
    avgOrderValue: 75000,
  });
  assert.deepEqual(payload.paymentData, [
    { type: "Tiền mặt", value: 100000, count: 1 },
    { type: "Chuyển khoản", value: 50000, count: 1 },
  ]);
  assert.deepEqual(payload.categoryData, [
    { category: "Giảm đau", revenue: 100000 },
    { category: "Vitamin", revenue: 50000 },
  ]);
  assert.equal(payload.trendData.length, 4);
  assert.deepEqual(payload.trendData[0], { date: "03/05", type: "Doanh thu", value: 100000 });
});
