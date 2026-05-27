import { create } from 'zustand';
import { medicineAPI } from '../api/api';

const getMedicineId = (medicine) => medicine?._id || medicine?.id;

const getErrorMessage = (err, fallback) => err.response?.data?.message || fallback;

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
    requiresPrescription: '',
    lowStock: '',
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
      return { success: true, data: medicines };
    } catch (err) {
      const message = getErrorMessage(err, 'Lỗi khi tải danh sách thuốc');
      set({
        error: message,
        loading: false,
      });
      return { success: false, message };
    }
  },

  // Tạo thuốc mới
  createMedicine: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await medicineAPI.create(formData);
      await get().fetchMedicines();
      return { success: true, data: res.data };
    } catch (err) {
      const msg = getErrorMessage(err, 'Không thể thêm thuốc');
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  // Cập nhật thuốc
  updateMedicine: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const res = await medicineAPI.update(id, formData);
      set((state) => ({
        medicines: state.medicines.map((m) =>
          String(getMedicineId(m)) === String(id) ? res.data : m
        ),
        loading: false,
      }));
      return { success: true, data: res.data };
    } catch (err) {
      const msg = getErrorMessage(err, 'Không thể cập nhật thuốc');
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  // Xóa thuốc
  deleteMedicine: async (id) => {
    set({ loading: true, error: null });
    try {
      await medicineAPI.delete(id);
      set((state) => ({
        medicines: state.medicines.filter((m) => String(getMedicineId(m)) !== String(id)),
        total: Math.max(0, state.total - 1),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      const msg = getErrorMessage(err, 'Không thể xóa thuốc');
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },
}));

export default useMedicineStore;
