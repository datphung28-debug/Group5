import { create } from 'zustand';
import { initialSuppliers } from '../pages/suppliers/supplierData';

const useSupplierStore = create((set, get) => ({
  suppliers: initialSuppliers,
  getSupplierById: (supplierId) => get().suppliers.find((supplier) => String(supplier.id) === String(supplierId)),
  updateSupplier: (updatedSupplier) => set((state) => ({
    suppliers: state.suppliers.map((supplier) => (
      supplier.id === updatedSupplier.id ? updatedSupplier : supplier
    )),
  })),
  recordPayment: (supplierId, payment) => set((state) => ({
    suppliers: state.suppliers.map((supplier) => {
      if (String(supplier.id) !== String(supplierId)) {
        return supplier;
      }

      const paymentAmount = Number(payment.amount || 0);
      const remainingDebt = Math.max(0, supplier.currentDebt - paymentAmount);
      const paymentEntry = {
        id: `TT-${Date.now()}`,
        date: payment.date,
        note: `${payment.method}${payment.note ? ` · ${payment.note}` : ''}`,
        amount: -paymentAmount,
      };

      return {
        ...supplier,
        currentDebt: remainingDebt,
        status: remainingDebt === 0 ? 'Bình thường' : supplier.status,
        debtHistory: [paymentEntry, ...supplier.debtHistory],
      };
    }),
  })),
}));

export default useSupplierStore;
