// 用户认证状态管理
import { create } from 'zustand';
import { User } from '../../shared/types';
import { authApi } from '../lib/api';

interface AuthState {
  user: User | null;
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
      
      if (response.success && response.user && response.token) {
        // 保存token到localStorage
        authApi.setToken(response.token);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.message || '登录失败'
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
      
      if (response.success && response.user && response.token) {
        // 保存token到localStorage
        authApi.setToken(response.token);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.message || '注册失败'
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
    console.log('🔍 AuthStore: initializeAuth开始执行');
    const token = localStorage.getItem('auth_token');
    console.log('🔑 AuthStore: localStorage中的token:', token ? `存在(长度:${token.length})` : '不存在');
    
    if (token) {
      console.log('📤 AuthStore: 设置token到API客户端');
      authApi.setToken(token);
      
      try {
        console.log('🌐 AuthStore: 开始调用verify接口');
        // 验证token并获取用户信息
        const response = await authApi.verify();
        console.log('📥 AuthStore: verify接口响应:', response);
        
        if (response.success && response.user && response.token) {
          console.log('✅ AuthStore: token验证成功，设置用户状态:', response.user.nickname);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            error: null
          });
        } else {
          console.log('❌ AuthStore: token验证失败，清除本地存储');
          // token无效，清除本地存储
          authApi.clearToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null
          });
        }
      } catch (error) {
        console.error('💥 AuthStore: Token验证异常:', error);
        // token验证失败，清除本地存储
        authApi.clearToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      }
    } else {
      console.log('⚠️ AuthStore: 没有找到token，跳过验证');
    }
    console.log('🏁 AuthStore: initializeAuth执行完成');
  }
}));