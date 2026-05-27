import { create } from 'zustand';
import { supplierAPI } from '../api/api';

const getSupplierId = (supplier) => supplier?._id || supplier?.id;

const getErrorMessage = (error, fallback) => error?.response?.data?.message || fallback;

const toSupplierPayload = (supplier = {}) => {
  const payload = { ...supplier };
  delete payload.id;
  delete payload._id;
  delete payload.__v;
  delete payload.createdAt;
  delete payload.updatedAt;
  delete payload.isActive;

  return {
    ...payload,
    contactPerson: payload.contactPerson || payload.contactName,
  };
};

export const normalizeSupplier = (supplier = {}) => ({
  ...supplier,
  id: getSupplierId(supplier),
  code: supplier.code || '',
  taxCode: supplier.taxCode || '',
  phone: supplier.phone || '',
  email: supplier.email || '',
  address: supplier.address || '',
  contactName: supplier.contactName || supplier.contactPerson || '',
  contactPhone: supplier.contactPhone || '',
  currentDebt: Number(supplier.currentDebt || 0),
  debtLimit: Number(supplier.debtLimit || 0),
  paymentTerms: supplier.paymentTerms || '',
  status: supplier.status || 'Bình thường',
  notes: supplier.notes || '',
  purchaseHistory: Array.isArray(supplier.purchaseHistory) ? supplier.purchaseHistory : [],
  debtHistory: Array.isArray(supplier.debtHistory) ? supplier.debtHistory : [],
});

const useSupplierStore = create((set, get) => ({
  suppliers: [],
  selectedSupplier: null,
  loading: false,
  error: null,

  fetchSuppliers: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await supplierAPI.getAll(params);
      const suppliers = (response.data || []).map(normalizeSupplier);
      set({ suppliers, loading: false });
      return { success: true, data: suppliers };
    } catch (error) {
      const message = getErrorMessage(error, 'Không thể tải danh sách nhà cung cấp');
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  fetchSupplierById: async (supplierId) => {
    set({ loading: true, error: null });
    try {
      const response = await supplierAPI.getById(supplierId);
      const supplier = normalizeSupplier(response.data);
      set((state) => ({
        selectedSupplier: supplier,
        suppliers: state.suppliers.some((item) => String(getSupplierId(item)) === String(supplier.id))
          ? state.suppliers.map((item) => (String(getSupplierId(item)) === String(supplier.id) ? supplier : item))
          : [...state.suppliers, supplier],
        loading: false,
      }));
      return { success: true, data: supplier };
    } catch (error) {
      const message = getErrorMessage(error, 'Không thể tải thông tin nhà cung cấp');
      set({ error: message, loading: false, selectedSupplier: null });
      return { success: false, message };
    }
  },

  getSupplierById: (supplierId) => {
    const { suppliers, selectedSupplier } = get();
    if (String(getSupplierId(selectedSupplier)) === String(supplierId)) {
      return selectedSupplier;
    }

    return suppliers.find((supplier) => String(getSupplierId(supplier)) === String(supplierId));
  },

  createSupplier: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await supplierAPI.create(toSupplierPayload(payload));
      const supplier = normalizeSupplier(response.data);
      set((state) => ({ suppliers: [supplier, ...state.suppliers], loading: false }));
      return { success: true, data: supplier };
    } catch (error) {
      const message = getErrorMessage(error, 'Không thể thêm nhà cung cấp');
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  updateSupplier: async (supplierId, payload) => {
    set({ loading: true, error: null });
    try {
      const response = await supplierAPI.update(supplierId, toSupplierPayload(payload));
      const supplier = normalizeSupplier(response.data);
      set((state) => ({
        suppliers: state.suppliers.map((item) => (
          String(getSupplierId(item)) === String(supplier.id) ? supplier : item
        )),
        selectedSupplier: String(getSupplierId(state.selectedSupplier)) === String(supplier.id)
          ? supplier
          : state.selectedSupplier,
        loading: false,
      }));
      return { success: true, data: supplier };
    } catch (error) {
      const message = getErrorMessage(error, 'Không thể cập nhật nhà cung cấp');
      set({ error: message, loading: false });
      return { success: false, message };
    }
  },

  recordPayment: async (supplierId, payment) => {
    const supplier = get().getSupplierById(supplierId);
    if (!supplier) {
      return { success: false, message: 'Không tìm thấy nhà cung cấp' };
    }

    const paymentAmount = Number(payment.amount || 0);
    const remainingDebt = Math.max(0, supplier.currentDebt - paymentAmount);
    const paymentEntry = {
      id: `TT-${Date.now()}`,
      date: payment.date,
      note: `${payment.method}${payment.note ? ` · ${payment.note}` : ''}`,
      amount: -paymentAmount,
    };

    return get().updateSupplier(supplierId, {
      ...supplier,
      currentDebt: remainingDebt,
      status: remainingDebt === 0 ? 'Bình thường' : supplier.status,
      debtHistory: [paymentEntry, ...supplier.debtHistory],
    });
  },
}));

export default useSupplierStore;
