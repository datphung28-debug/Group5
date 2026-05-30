import { useEffect, useState, useCallback } from 'react';
import { reportAPI } from '../api/api';

// ─── Adapter: chuyển format backend → format Dashboard cần ────────────────
const adaptDashboardData = (apiData, topMedicinesData) => {
  // KPI từ data backend thật
  const kpi = {
    revenueToday:       apiData.today?.revenue || 0,
    profitToday:        apiData.today?.profit || 0,
    profitMarginToday:  apiData.today?.revenue > 0
      ? Number((apiData.today.profit / apiData.today.revenue).toFixed(4))
      : 0,
    invoicesToday:      apiData.today?.orders || 0,
    avgInvoiceValue:    apiData.today?.orders > 0
      ? Math.round((apiData.today.revenue || 0) / apiData.today.orders)
      : 0,
    revenueMonth:       apiData.month?.revenue || 0,
    customerDebt:       apiData.customerDebt || 0,
    supplierDebt:       apiData.supplierDebt || 0,
    inventoryValue:     apiData.inventory?.value || 0,
    profitMarginMonth:  apiData.month?.revenue > 0
      ? Number((apiData.month.profit / apiData.month.revenue).toFixed(4))
      : 0,
  };

  // Top products từ API top-medicines thật
  const topProducts = (topMedicinesData || []).map((m, index) => {
    const revenue = m.revenue || 0;
    const profit = m.profit || 0;
    return {
      id:           m._id || `prod-${index}`,
      name:         m.name || 'Không rõ',
      quantity:     m.totalSold || 0,
      revenue:      revenue,
      profit:       profit,
      profitMargin: revenue > 0 ? Number((profit / revenue).toFixed(4)) : 0,
    };
  });

  // Dữ liệu biểu đồ thật từ backend
  const revenueProfit30Days = apiData.revenueProfit30Days || [];
  const hourlyRevenueToday  = apiData.hourlyRevenueToday || [];
  const yearlyRevenue       = apiData.yearlyRevenue || [];
  const yearlySummary       = apiData.yearlySummary || { revenueThisYear: 0, revenueLastYear: 0, profitThisYear: 0 };

  return { kpi, topProducts, revenueProfit30Days, hourlyRevenueToday, yearlyRevenue, yearlySummary };
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
          reportAPI.getTopMedicines({ limit: 8 }), // Fetch top 8 since dashboard displays 8
        ]);

        const dashData  = dashRes.status  === 'fulfilled' ? dashRes.value.data  : null;
        const topData   = topRes.status   === 'fulfilled' ? topRes.value.data   : [];

        if (dashData) {
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
