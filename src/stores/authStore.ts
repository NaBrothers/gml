// 用户认证状态管理
import { create } from 'zustand';
import { UserWithStats } from '../../shared/types';
import { authApi } from '../lib/api';

interface AuthState {
  user: UserWithStats | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, nickname?: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
  updateUserInfo: (user: UserWithStats) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.login({ username, password });
      console.log('AuthStore received response:', response);
      
      if (response.success && response.data?.user && response.data?.token) {
        // 保存token到localStorage
        authApi.setToken(response.data.token);
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error || '登录失败'
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      set({
        isLoading: false,
        error: '网络错误，请稍后重试'
      });
      return false;
    }
  },

  register: async (username: string, password: string, nickname?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.register({ username, password, nickname });
      
      if (response.success && response.data?.user && response.data?.token) {
        // 保存token到localStorage
        authApi.setToken(response.data.token);
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error || '注册失败'
        });
        return false;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: '网络错误，请稍后重试'
      });
      return false;
    }
  },

  logout: () => {
    authApi.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    });
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    set({ isLoading: true });
    
    try {
      authApi.setToken(token);
      const response = await authApi.verify();
      console.log('🔍 AuthStore: verify响应:', response);
      
      if (response.success && response.data?.user) {
        set({
          user: response.data.user,
          token: response.data.token || token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        console.log('✅ AuthStore: 认证成功，用户信息已设置');
      } else {
        console.log('❌ AuthStore: 认证失败，清除本地token');
        authApi.clearToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('💥 AuthStore: 初始化认证失败:', error);
      authApi.clearToken();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    }
  },

  updateUserInfo: (user: UserWithStats) => {
    set({ user });
  }
}));