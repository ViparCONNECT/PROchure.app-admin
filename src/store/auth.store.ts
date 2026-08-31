import { create } from 'zustand';
import type { AdminUser } from '@/api/types';

interface AuthState {
  accessToken: string | null;
  user: AdminUser | null;
  isInitializing: boolean;
  setSession: (accessToken: string, user: AdminUser) => void;
  clearSession: () => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isInitializing: true,

  setSession: (accessToken, user) => {
    set({ accessToken, user, isInitializing: false });
  },

  clearSession: () => {
    set({ accessToken: null, user: null, isInitializing: false });
  },

  setInitializing: (value) => set({ isInitializing: value }),
}));
