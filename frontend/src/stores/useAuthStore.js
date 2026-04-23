import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,

      login: (user, token) =>
        set({ isAuthenticated: true, user, token }),

      logout: () =>
        set({ isAuthenticated: false, user: null, token: null }),
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
