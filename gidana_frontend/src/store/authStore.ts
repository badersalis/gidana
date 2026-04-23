import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { authApi } from '../api/auth';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: {
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  loadStoredAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const { data } = await authApi.getMe();
        set({ user: data.data, token, isAuthenticated: true });
      }
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (identifier, password) => {
    const { data } = await authApi.login(identifier, password);
    await SecureStore.setItemAsync('auth_token', data.data.token);
    set({ user: data.data.user, token: data.data.token, isAuthenticated: true });
  },

  register: async (userData) => {
    const { data } = await authApi.register(userData);
    await SecureStore.setItemAsync('auth_token', data.data.token);
    set({ user: data.data.user, token: data.data.token, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => set({ user }),
}));
