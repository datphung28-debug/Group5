import { useEffect, useState } from 'react';
import { reportAPI } from '../api/api';

// ─── Adapter: chuyển format backend → format Dashboard cần ────────────────
// Backend: { today, month, inventory, customers, staff }
// Frontend cần: { kpi, revenueProfit30Days, topProducts, yearlyRevenue, ... }
const adaptDashboardData = (apiData, topMedicinesData) => {
  // KPI từ data backend thật
  const kpi = {
    revenueToday:       apiData.today?.revenue     || 0,
    profitToday:        0,   // Backend chưa tính profit riêng cho today
    profitMarginToday:  0,
    invoicesToday:      apiData.today?.orders      || 0,
    avgInvoiceValue:    apiData.today?.orders > 0
      ? Math.round((apiData.today.revenue || 0) / apiData.today.orders)
      : 0,
    revenueMonth:       apiData.month?.revenue     || 0,
    customerDebt:       0,   // Chưa có API riêng
    supplierDebt:       0,   // Chưa có API riêng
    inventoryValue:     0,   // Lấy từ inventory report nếu có
    profitMarginMonth:  0,
  };

  // Top products từ API top-medicines
  const topProducts = (topMedicinesData || []).map((m, index) => ({
    id:           m._id || `prod-${index}`,
    name:         m.name || 'Không rõ',
    quantity:     m.totalSold || 0,
    revenue:      m.revenue   || 0,
    profit:       0,
    profitMargin: 0,
  }));

  // Mock data cho charts (vẫn cần generate vì backend chưa có endpoint này)
  const revenueProfit30Days = generateRevenueChart();
  const hourlyRevenueToday  = generateHourlyChart();
  const { yearlyRevenue, yearlySummary } = generateYearlyData();

  return { kpi, topProducts, revenueProfit30Days, hourlyRevenueToday, yearlyRevenue, yearlySummary };
};

// ─── Mock generators cho chart data (chỉ dùng khi chưa có API) ─────────────
const generateRevenueChart = () => {
  const result = [];
  const today  = new Date();
  for (let i = 29; i >= 0; i--) {
    const date    = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const revenue = Math.floor(Math.random() * 15000000) + 5000000;
    const profit  = Math.floor(revenue * (Math.random() * 0.15 + 0.2));
    result.push({ date: dateStr, revenue, profit });
  }
  return result;
};

const generateHourlyChart = () => {
  const result = [];
  for (let h = 7; h <= 21; h++) {
    const base    = (h >= 9 && h <= 11) || (h >= 17 && h <= 19) ? 3000000 : 1000000;
    const revenue = Math.floor(Math.random() * base) + 300000;
    result.push({ hour: `${h}h`, revenue });
  }
  return result;
};

const generateYearlyData = () => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let totalRevThisYear = 0, totalRevLastYear = 0, totalProfitThisYear = 0;
  const yearlyRevenue = months.map((month) => {
    const revenueLastYear  = Math.floor(Math.random() * 200000000) + 300000000;
    const revenueThisYear  = Math.floor(revenueLastYear * (1 + Math.random() * 0.4 - 0.1));
    const profitThisYear   = Math.floor(revenueThisYear * (Math.random() * 0.1 + 0.25));
    totalRevThisYear      += revenueThisYear;
    totalRevLastYear      += revenueLastYear;
    totalProfitThisYear   += profitThisYear;
    return { month, revenueThisYear, revenueLastYear, profitThisYear };
  });
  return { yearlyRevenue, yearlySummary: { revenueThisYear: totalRevThisYear, revenueLastYear: totalRevLastYear, profitThisYear: totalProfitThisYear } };
};

// ─── Hook chính ─────────────────────────────────────────────────────────────
export const useDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi song song dashboard + top medicines
        const [dashRes, topRes] = await Promise.allSettled([
          reportAPI.getDashboard(),
          reportAPI.getTopMedicines({ limit: 10 }),
        ]);

        const dashData  = dashRes.status  === 'fulfilled' ? dashRes.value.data  : null;
        const topData   = topRes.status   === 'fulfilled' ? topRes.value.data   : [];

        if (dashData) {
          // Adapter backend format → frontend format
          setData(adaptDashboardData(dashData, topData));
        } else {
          throw new Error('Không lấy được dữ liệu dashboard');
        }
      } catch (err) {
        console.warn('Dashboard API lỗi, dùng dữ liệu mẫu:', err.message);
        // Fallback mock nếu backend chưa chạy
        const { yearlyRevenue, yearlySummary } = generateYearlyData();
        setData({
          kpi: {
            revenueToday: 15600000, profitToday: 4200000, profitMarginToday: 26.9,
            invoicesToday: 124, avgInvoiceValue: 125806, revenueMonth: 425000000,
            customerDebt: 0, supplierDebt: 0, inventoryValue: 0, profitMarginMonth: 0,
          },
          topProducts: [],
          revenueProfit30Days: generateRevenueChart(),
          hourlyRevenueToday:  generateHourlyChart(),
          yearlyRevenue,
          yearlySummary,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value = 0) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}tr đ`;
    if (value >= 1000)    return `${(value / 1000).toFixed(0)}k`;
    return `${value}đ`;
  };

  const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value);

  return { data, loading, formatCurrency, formatNumber };
};
