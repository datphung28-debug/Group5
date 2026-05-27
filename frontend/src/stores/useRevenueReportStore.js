import { create } from 'zustand';
import dayjs from 'dayjs';
import { reportAPI } from '../api/api';

const useRevenueReportStore = create((set) => ({
  filters: {
    fromDate: dayjs().startOf('month'),
    toDate: dayjs(),
    comparePeriod: 'none',
  },
  loading: false,
  error: null,
  kpis: {
    totalRevenue: 0,
    grossProfit: 0,
    margin: 0,
    invoiceCount: 0,
    avgOrderValue: 0,
  },
  trendData: [],
  paymentData: [],
  categoryData: [],

  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),

  fetchReport: async () => {
    const { filters } = useRevenueReportStore.getState();
    set({ loading: true, error: null });
    try {
      const response = await reportAPI.getRevenue({
        fromDate: filters.fromDate?.toISOString(),
        toDate: filters.toDate?.toISOString(),
      });
      const data = response.data || {};
      set({
        kpis: {
          totalRevenue: data.kpis?.totalRevenue || 0,
          grossProfit: data.kpis?.grossProfit || 0,
          margin: data.kpis?.margin || 0,
          invoiceCount: data.kpis?.invoiceCount || 0,
          avgOrderValue: data.kpis?.avgOrderValue || 0,
        },
        trendData: Array.isArray(data.trendData) ? data.trendData : [],
        paymentData: Array.isArray(data.paymentData) ? data.paymentData : [],
        categoryData: Array.isArray(data.categoryData) ? data.categoryData : [],
        loading: false,
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải báo cáo doanh thu';
      set({
        error: message,
        loading: false,
        kpis: { totalRevenue: 0, grossProfit: 0, margin: 0, invoiceCount: 0, avgOrderValue: 0 },
        trendData: [],
        paymentData: [],
        categoryData: [],
      });
    }
  }
}));

export default useRevenueReportStore;
