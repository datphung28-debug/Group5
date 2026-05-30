import { useEffect, useState, useCallback } from 'react';
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

// ─── Realistic Mock generators ──────────────────────────────────────────────
const generateRevenueChart = () => {
  const result = [];
  const today  = new Date();
  // Create a realistic pattern with weekends dipping
  const baseRevenues = [
    12800000, 14200000, 15600000, 13400000, 16100000, 8900000, 7200000,
    13100000, 14800000, 15200000, 14600000, 16800000, 9200000, 7800000,
    13600000, 15100000, 16400000, 14200000, 17200000, 9500000, 8100000,
    14200000, 15800000, 16900000, 15100000, 17800000, 10200000, 8600000,
    14800000, 15600000,
  ];

  for (let i = 29; i >= 0; i--) {
    const date    = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const baseRev = baseRevenues[29 - i];
    // Add some randomness (±10%)
    const revenue = Math.floor(baseRev * (0.9 + Math.random() * 0.2));
    const margin  = 0.22 + Math.random() * 0.08; // 22-30% margin
    const profit  = Math.floor(revenue * margin);
    result.push({ date: dateStr, revenue, profit });
  }
  return result;
};

const generateHourlyChart = () => {
  // Realistic pharmacy pattern: morning rush, lunch dip, afternoon rush
  const hourlyPattern = [
    { hour: '7h',  base: 800000 },
    { hour: '8h',  base: 2200000 },
    { hour: '9h',  base: 3400000 },
    { hour: '10h', base: 3100000 },
    { hour: '11h', base: 2800000 },
    { hour: '12h', base: 1200000 },
    { hour: '13h', base: 1500000 },
    { hour: '14h', base: 2100000 },
    { hour: '15h', base: 2400000 },
    { hour: '16h', base: 2800000 },
    { hour: '17h', base: 3200000 },
    { hour: '18h', base: 3500000 },
    { hour: '19h', base: 2600000 },
    { hour: '20h', base: 1400000 },
    { hour: '21h', base: 600000 },
  ];

  return hourlyPattern.map(h => ({
    hour: h.hour,
    revenue: Math.floor(h.base * (0.85 + Math.random() * 0.3)),
  }));
};

const generateYearlyData = () => {
  const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  // Realistic monthly revenues with seasonal trends
  const monthlyBase = [
    380000000, 340000000, 420000000, 400000000, 450000000, 430000000,
    460000000, 470000000, 440000000, 420000000, 480000000, 510000000,
  ];

  let totalRevThisYear = 0, totalRevLastYear = 0, totalProfitThisYear = 0;

  const yearlyRevenue = months.map((month, i) => {
    const revenueLastYear  = Math.floor(monthlyBase[i] * (0.85 + Math.random() * 0.1));
    const growthRate       = 1 + (0.08 + Math.random() * 0.12); // 8-20% growth YoY
    const revenueThisYear  = Math.floor(revenueLastYear * growthRate);
    const profitThisYear   = Math.floor(revenueThisYear * (0.24 + Math.random() * 0.06));

    totalRevThisYear      += revenueThisYear;
    totalRevLastYear      += revenueLastYear;
    totalProfitThisYear   += profitThisYear;

    return { month, revenueThisYear, revenueLastYear, profitThisYear };
  });

  return {
    yearlyRevenue,
    yearlySummary: {
      revenueThisYear: totalRevThisYear,
      revenueLastYear: totalRevLastYear,
      profitThisYear: totalProfitThisYear,
    },
  };
};

// ─── Hook chính ─────────────────────────────────────────────────────────────
export const useDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
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
          throw new Error(dashRes.reason?.response?.data?.message || 'Không lấy được dữ liệu dashboard từ server.');
        }
      } catch (err) {
        console.error('Dashboard API error:', err);
        setError(err.message || 'Không thể tải dữ liệu báo cáo từ hệ thống.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = useCallback((value = 0) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}tỷ`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}tr đ`;
    if (value >= 1000)    return `${(value / 1000).toFixed(0)}k`;
    return `${value.toLocaleString('vi-VN')}đ`;
  }, []);

  const formatNumber = useCallback(
    (value) => new Intl.NumberFormat('vi-VN').format(value),
    []
  );

  return { data, loading, error, formatCurrency, formatNumber };
};
