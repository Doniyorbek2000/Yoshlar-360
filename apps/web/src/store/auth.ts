import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  regionId: number | null;
  districtId: number | null;
  mahallaId: number | null;
  region?: { nameUz: string } | null;
  district?: { nameUz: string } | null;
  mahalla?: { nameUz: string } | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const result = data.data;
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    set({ user: result.user });
  },
  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null });
  },
  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.data, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
