// 用户数据管理
import { create } from 'zustand';
import { UserWithStats, RankingUser } from '../../shared/types';
import { usersApi, rankingApi } from '../lib/api';
import { useAuthStore } from './authStore';

interface UserState {
  users: UserWithStats[];
  rankings: RankingUser[];
  currentUser: UserWithStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchUsers: () => Promise<void>;
  fetchRankings: (limit?: number, majorRank?: string) => Promise<void>;
  fetchUserById: (id: string) => Promise<UserWithStats | null>;
  updateUser: (id: string, data: { nickname?: string, avatar?: string }) => Promise<boolean>;
  updateProfile: (nickname?: string, avatar?: File) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  rankings: [],
  currentUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await usersApi.getAll();
      
      if (response.success && response.data) {
        set({
          users: response.data.users,
          isLoading: false,
          error: null
        });
      } else {
        set({
          isLoading: false,
          error: response.error || '获取用户列表失败'
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: '网络错误，请稍后重试'
      });
    }
  },

  fetchRankings: async (limit = 50, majorRank?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const params: { limit: number; majorRank?: string } = { limit };
      if (majorRank) {
        params.majorRank = majorRank;
      }
      
      const response = await rankingApi.getRanking(params);
      
      if (response.success && response.data) {
        set({
          rankings: response.data.rankings,
          isLoading: false,
          error: null
        });
      } else {
        set({
          isLoading: false,
          error: response.error || '获取排行榜失败'
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: '网络错误，请稍后重试'
      });
    }
  },

  fetchUserById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await usersApi.getById(id);
      
      if (response.success && response.data) {
        set({
          currentUser: response.data,
          isLoading: false,
          error: null
        });
        return response.data;
      } else {
        set({
          isLoading: false,
          error: response.error || '获取用户信息失败'
        });
        return null;
      }
    } catch (error) {
      set({
        isLoading: false,
        error: '网络错误，请稍后重试'
      });
      return null;
    }
  },

  updateUser: async (id: string, data: { nickname?: string, avatar?: string }) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await usersApi.update(id, data);
      
      if (response.success && response.data) {
        // 更新用户列表中的用户信息
        const users = get().users;
        const updatedUsers = users.map(user => 
          user.id === id ? response.data! : user
        );
        
        set({
          users: updatedUsers,
          currentUser: get().currentUser?.id === id ? response.data : get().currentUser,
          isLoading: false,
          error: null
        });
        
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error || '更新用户信息失败'
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

  deleteUser: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await usersApi.delete(id);
      
      if (response.success) {
        // 从用户列表中移除已删除的用户
        const users = get().users;
        const updatedUsers = users.filter(user => user.id !== id);
        
        set({
          users: updatedUsers,
          currentUser: get().currentUser?.id === id ? null : get().currentUser,
          isLoading: false,
          error: null
        });
        
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error || '删除用户失败'
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

  updateProfile: async (nickname?: string, avatar?: File) => {
    set({ isLoading: true, error: null });
    
    try {
      const formData = new FormData();
      if (nickname) {
        formData.append('nickname', nickname);
      }
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      const response = await usersApi.updateProfile(formData);
      
      if (response.success && response.data) {
        // 更新认证状态中的用户信息
        useAuthStore.getState().updateUserInfo(response.data);
        
        set({
          isLoading: false,
          error: null
        });
        
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error || '更新个人资料失败'
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

  clearError: () => {
    set({ error: null });
  }
}));