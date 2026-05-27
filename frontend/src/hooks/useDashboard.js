import { useEffect, useState } from 'react';
import { reportAPI } from '../api/api';

// ─── Adapter: chuyển format backend → format Dashboard cần ────────────────
// Backend: { today, month, inventory, customers, staff }
// Frontend cần: { kpi, revenueProfit30Days, topProducts, yearlyRevenue, ... }
const adaptDashboardData = (apiData, topMedicinesData, revenueReportData, yearlyReportData) => {
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

  const revenueProfit30Days = transformTrendData(revenueReportData?.trendData || []);
  const yearlyRevenue = transformYearlyData(yearlyReportData?.trendData || []);
  const yearlySummary = {
    revenueThisYear: yearlyReportData?.kpis?.totalRevenue || 0,
    revenueLastYear: 0,
    profitThisYear: yearlyReportData?.kpis?.grossProfit || 0,
  };

  return { kpi, topProducts, revenueProfit30Days, hourlyRevenueToday: [], yearlyRevenue, yearlySummary };
};

const transformTrendData = (trendData) => {
  const map = new Map();
  trendData.forEach((item) => {
    if (!map.has(item.date)) {
      map.set(item.date, { date: item.date, revenue: 0, profit: 0 });
    }
    const entry = map.get(item.date);
    if (item.type === 'Doanh thu') entry.revenue = item.value || 0;
    if (item.type === 'Lãi gộp') entry.profit = item.value || 0;
  });
  return Array.from(map.values());
};

const transformYearlyData = (trendData) => {
  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const monthlyMap = new Map(months.map((month) => [month, {
    month,
    revenueThisYear: 0,
    revenueLastYear: 0,
    profitThisYear: 0,
  }]));

  trendData.forEach((item) => {
    const month = item.date?.slice(0, 2);
    if (!monthlyMap.has(month)) return;
    const entry = monthlyMap.get(month);
    if (item.type === 'Doanh thu') entry.revenueThisYear = item.value || 0;
    if (item.type === 'Lãi gộp') entry.profitThisYear = item.value || 0;
  });

  return Array.from(monthlyMap.values());
};

// ─── Hook chính ─────────────────────────────────────────────────────────────
export const useDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Gọi song song dashboard + top medicines
        const now = new Date();
        const last30Days = new Date(now);
        last30Days.setDate(last30Days.getDate() - 29);
        const [dashRes, topRes, revenueRes, yearlyRes] = await Promise.allSettled([
          reportAPI.getDashboard(),
          reportAPI.getTopMedicines({ limit: 10 }),
          reportAPI.getRevenue({ fromDate: last30Days.toISOString(), toDate: now.toISOString() }),
          reportAPI.getRevenue({ type: 'monthly', year: now.getFullYear() }),
        ]);

        const dashData  = dashRes.status  === 'fulfilled' ? dashRes.value.data  : null;
        const topData   = topRes.status   === 'fulfilled' ? topRes.value.data   : [];
        const revenueData = revenueRes.status === 'fulfilled' ? revenueRes.value.data : null;
        const yearlyData = yearlyRes.status === 'fulfilled' ? yearlyRes.value.data : null;

        if (dashData) {
          // Adapter backend format → frontend format
          setData(adaptDashboardData(dashData, topData, revenueData, yearlyData));
        } else {
          throw new Error('Không lấy được dữ liệu dashboard');
        }
      } catch (err) {
        console.warn('Dashboard API lỗi:', err.message);
        setData(null);
        setError(err.message || 'Không thể tải dữ liệu dashboard');
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

  return { data, loading, error, formatCurrency, formatNumber };
};
