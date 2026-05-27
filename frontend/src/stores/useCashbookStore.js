import { create } from 'zustand';
import { cashbookAPI } from '../api/api';

const useCashbookStore = create((set) => ({
  transactions: [],
  loading: false,
  error: null,
  filters: {},
  kpis: {
    totalRevenue: 0,
    totalExpense: 0,
    netBalance: 0,
    currentBalance: 0,
  },
  paymentSummaries: {
    cash: { count: 0, total: 0 },
    transfer: { count: 0, total: 0 },
    card: { count: 0, total: 0 },
  },

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  addTransaction: async (transaction) => {
    set({ loading: true, error: null });
    try {
      await cashbookAPI.create(transaction);
      const response = await cashbookAPI.getAll();
      const data = response.data || {};
      set({
        transactions: data.transactions || [],
        kpis: data.kpis || { totalRevenue: 0, totalExpense: 0, netBalance: 0, currentBalance: 0 },
        paymentSummaries: data.paymentSummaries || { cash: { count: 0, total: 0 }, transfer: { count: 0, total: 0 }, card: { count: 0, total: 0 } },
        loading: false,
      });
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu giao dịch';
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchTransactions: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await cashbookAPI.getAll(params);
      const data = response.data || {};
      set({
        transactions: data.transactions || [],
        kpis: data.kpis || { totalRevenue: 0, totalExpense: 0, netBalance: 0, currentBalance: 0 },
        paymentSummaries: data.paymentSummaries || { cash: { count: 0, total: 0 }, transfer: { count: 0, total: 0 }, card: { count: 0, total: 0 } },
        loading: false,
      });
      return { success: true, data };
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải sổ quỹ';
      set({
        error: message,
        loading: false,
        transactions: [],
        kpis: { totalRevenue: 0, totalExpense: 0, netBalance: 0, currentBalance: 0 },
        paymentSummaries: { cash: { count: 0, total: 0 }, transfer: { count: 0, total: 0 }, card: { count: 0, total: 0 } },
      });
      return { success: false, message };
    }
  }
}));

export default useCashbookStore;
