import { create } from 'zustand';

const useCashbookStore = create((set) => ({
  transactions: [
    {
      id: 'TX-001',
      type: 'thu',
      category: 'Bán hàng',
      paymentMethod: 'Tiền mặt',
      description: 'Thu tiền hóa đơn INV-20260315-0001',
      amount: 150000,
      staff: 'Nguyễn Văn A',
      timestamp: '2026-03-15T08:30:00Z',
      reference: 'INV-20260315-0001',
    },
    {
      id: 'TX-002',
      type: 'chi',
      category: 'Trả NCC',
      paymentMethod: 'Chuyển khoản',
      description: 'Thanh toán tiền thuốc - NCC Dược Hậu Giang',
      amount: 5000000,
      staff: 'Trần Thị B',
      timestamp: '2026-03-15T09:15:00Z',
      reference: 'PO-DHG-001',
    },
    {
      id: 'TX-003',
      type: 'thu',
      category: 'Bán hàng',
      paymentMethod: 'Chuyển khoản',
      description: 'Thu tiền hóa đơn INV-20260315-0002',
      amount: 450000,
      staff: 'Nguyễn Văn A',
      timestamp: '2026-03-15T10:00:00Z',
      reference: 'INV-20260315-0002',
    },
    {
      id: 'TX-004',
      type: 'chi',
      category: 'Chi thủ công',
      paymentMethod: 'Tiền mặt',
      description: 'Chi tiền điện tháng 2',
      amount: 1200000,
      staff: 'Lê Văn C',
      timestamp: '2026-03-15T14:20:00Z',
      note: 'Hóa đơn EVN',
    },
    {
      id: 'TX-005',
      type: 'thu',
      category: 'Thu thủ công',
      paymentMethod: 'Tiền mặt',
      description: 'Thu tiền hoàn trả vỏ chai',
      amount: 50000,
      staff: 'Nguyễn Văn A',
      timestamp: '2026-03-15T16:45:00Z',
    },
  ],
  loading: false,
  kpis: {
    totalRevenue: 650000,
    totalExpense: 6200000,
    netBalance: -5550000,
    currentBalance: 12500000,
  },
  paymentSummaries: {
    cash: { count: 3, total: -1000000 },
    transfer: { count: 2, total: -4550000 },
  },

  addTransaction: (transaction) => set((state) => ({
    transactions: [
      {
        ...transaction,
        id: `TX-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        timestamp: new Date().toISOString(),
      },
      ...state.transactions
    ]
  })),

  fetchTransactions: async () => {
    set({ loading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ loading: false });
  }
}));

export default useCashbookStore;
