import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../api/api';

const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      // Gọi API đăng nhập thật
      loginWithAPI: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const res = await authAPI.login(email, password);
          // Backend trả về flat object: { _id, name, email, role, phone, token }
          const { token, ...userFields } = res.data;
          const user = userFields; // toàn bộ phần còn lại là user info
          set({ isAuthenticated: true, user, token, loading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Đăng nhập thất bại';
          set({ loading: false, error: msg });
          return { success: false, message: msg };
        }
      },

      // Dùng khi đã có token/user sẵn (ví dụ từ test)
      login: (user, token) =>
        set({ isAuthenticated: true, user, token }),

      logout: () =>
        set({ isAuthenticated: false, user: null, token: null, error: null }),
    }),
    {
      name: 'gpp-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;
