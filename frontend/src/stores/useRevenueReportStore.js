import { create } from 'zustand';
import dayjs from 'dayjs';

const useRevenueReportStore = create((set) => ({
  filters: {
    fromDate: dayjs().startOf('month'),
    toDate: dayjs(),
    comparePeriod: 'none',
  },
  loading: false,
  kpis: {
    totalRevenue: 425800000,
    grossProfit: 125400000,
    margin: 29.4,
    invoiceCount: 1248,
    avgOrderValue: 341185,
  },
  trendData: [
    { date: '01/03', type: 'Doanh thu', value: 12500000 },
    { date: '01/03', type: 'Lãi gộp', value: 3500000 },
    { date: '02/03', type: 'Doanh thu', value: 15200000 },
    { date: '02/03', type: 'Lãi gộp', value: 4200000 },
    { date: '03/03', type: 'Doanh thu', value: 11800000 },
    { date: '03/03', type: 'Lãi gộp', value: 3100000 },
    { date: '04/03', type: 'Doanh thu', value: 18500000 },
    { date: '04/03', type: 'Lãi gộp', value: 5100000 },
    { date: '05/03', type: 'Doanh thu', value: 14700000 },
    { date: '05/03', type: 'Lãi gộp', value: 4000000 },
    { date: '06/03', type: 'Doanh thu', value: 16900000 },
    { date: '06/03', type: 'Lãi gộp', value: 4700000 },
    { date: '07/03', type: 'Doanh thu', value: 13200000 },
    { date: '07/03', type: 'Lãi gộp', value: 3600000 },
  ],
  paymentData: [
    { type: 'Tiền mặt', value: 295600000, count: 928 },
    { type: 'Chuyển khoản', value: 130200000, count: 320 },
  ],
  categoryData: [
    { category: 'Thuốc kháng sinh', revenue: 145000000 },
    { category: 'Thuốc giảm đau', revenue: 95000000 },
    { category: 'Thực phẩm chức năng', revenue: 82000000 },
    { category: 'Thiết bị y tế', revenue: 45000000 },
    { category: 'Dược mỹ phẩm', revenue: 35000000 },
    { category: 'Khác', revenue: 23800000 },
  ],

  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),

  fetchReport: async () => {
    set({ loading: true });
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    set({ loading: false });
  }
}));

export default useRevenueReportStore;
