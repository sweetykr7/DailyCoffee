'use client';

import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isLoggedIn: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
        '/auth/login',
        { email, password }
      );

      if (res.success && res.data) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        set({ user: res.data.user, isLoggedIn: true });
      } else {
        throw new Error(res.error || '로그인에 실패했습니다.');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password, name, phone) => {
    set({ isLoading: true });
    try {
      const res = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
        '/auth/register',
        { email, password, name, phone }
      );

      if (res.success && res.data) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
        set({ user: res.data.user, isLoggedIn: true });
      } else {
        throw new Error(res.error || '회원가입에 실패했습니다.');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    api.clearTokens();
    set({ user: null, isLoggedIn: false });
  },

  fetchMe: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    set({ isLoading: true });
    try {
      const res = await api.get<User>('/auth/me');
      if (res.success && res.data) {
        set({ user: res.data, isLoggedIn: true });
      }
    } catch {
      // Token invalid
      api.clearTokens();
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user, isLoggedIn: !!user }),
}));
