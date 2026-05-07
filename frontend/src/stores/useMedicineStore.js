import { create } from 'zustand';
import { medicineAPI } from '../api/api';

const useMedicineStore = create((set, get) => ({
  medicines: [],
  total: 0,
  loading: false,
  error: null,

  // Params phân trang và filter
  params: {
    page: 1,
    limit: 10,
    search: '',
    category: '',
    status: '',
  },

  setParams: (newParams) => {
    set((state) => ({
      params: { ...state.params, ...newParams, page: newParams.page ?? 1 },
    }));
  },

  // Fetch danh sách thuốc từ API
  fetchMedicines: async (extraParams = {}) => {
    set({ loading: true, error: null });
    try {
      const params = { ...get().params, ...extraParams };
      const res = await medicineAPI.getAll(params);
      // Backend trả về: { medicines: [...], total, page, pages }
      const medicines = res.data?.medicines || res.data?.data || res.data || [];
      const total = res.data?.total ?? (Array.isArray(medicines) ? medicines.length : 0);
      set({
        medicines: Array.isArray(medicines) ? medicines : [],
        total,
        loading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Lỗi khi tải danh sách thuốc',
        loading: false,
      });
    }
  },

  // Tạo thuốc mới
  createMedicine: async (formData) => {
    try {
      const res = await medicineAPI.create(formData);
      // Làm mới danh sách
      get().fetchMedicines();
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể thêm thuốc';
      return { success: false, message: msg };
    }
  },

  // Cập nhật thuốc
  updateMedicine: async (id, formData) => {
    try {
      const res = await medicineAPI.update(id, formData);
      set((state) => ({
        medicines: state.medicines.map((m) =>
          m._id === id ? res.data : m
        ),
      }));
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể cập nhật thuốc';
      return { success: false, message: msg };
    }
  },

  // Xóa thuốc
  deleteMedicine: async (id) => {
    try {
      await medicineAPI.delete(id);
      set((state) => ({
        medicines: state.medicines.filter((m) => m._id !== id),
        total: state.total - 1,
      }));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể xóa thuốc';
      return { success: false, message: msg };
    }
  },
}));

export default useMedicineStore;
