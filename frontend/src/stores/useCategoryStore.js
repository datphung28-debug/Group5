import { create } from 'zustand';
import { categoryAPI } from '../api/api';

const useCategoryStore = create((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  // Fetch từ API backend
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await categoryAPI.getAll();
      set({ categories: res.data || [], loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Lỗi khi tải nhóm thuốc',
        loading: false,
      });
    }
  },

  getSummary: () => {
    const cats = get().categories;
    return {
      total: cats.length,
      totalMedicines: cats.reduce((sum, c) => sum + (c.medicineCount || 0), 0),
      emptyCount: cats.filter((c) => (c.medicineCount || 0) === 0).length,
    };
  },

  addCategory: async (category) => {
    try {
      const res = await categoryAPI.create(category);
      await get().fetchCategories();
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Lỗi tạo nhóm thuốc' };
    }
  },

  updateCategory: async (id, updates) => {
    try {
      const res = await categoryAPI.update(id, updates);
      await get().fetchCategories();
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Lỗi cập nhật nhóm thuốc' };
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoryAPI.delete(id);
      set((state) => ({
        categories: state.categories.filter((c) => c._id !== id && c.id !== id),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Lỗi xóa nhóm thuốc' };
    }
  },
}));

export default useCategoryStore;
