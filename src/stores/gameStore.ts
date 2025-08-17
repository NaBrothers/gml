// 对局记分管理
import { create } from 'zustand';
import { GameDetail, GameResult, User } from '../../shared/types';
import { gamesApi } from '../lib/api';

interface GameState {
  games: GameDetail[];
  currentGame: GameDetail | null;
  selectedPlayers: User[];
  scores: (number | string)[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchGames: () => Promise<void>;
  fetchGameById: (id: string) => Promise<GameDetail | null>;
  createGame: (gameData: GameResult) => Promise<boolean>;
  setSelectedPlayers: (players: User[]) => void;
  setScores: (scores: (number | string)[]) => void;
  resetGameForm: () => void;
  clearError: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  currentGame: null,
  selectedPlayers: [],
  scores: ['', '', '', ''],
  isLoading: false,
  error: null,

  fetchGames: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await gamesApi.getAll();
      
      if (response.success && response.data) {
        set({
          games: response.data,
          isLoading: false,
          error: null
        });
      } else {
        set({
          isLoading: false,
          error: response.error || '获取对局记录失败'
        });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: '网络错误，请稍后重试'
      });
    }
  },

  fetchGameById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await gamesApi.getById(id);
      
      if (response.success && response.data) {
        set({
          currentGame: response.data,
          isLoading: false,
          error: null
        });
        return response.data;
      } else {
        set({
          isLoading: false,
          error: response.error || '获取对局详情失败'
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

  createGame: async (gameData: GameResult) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await gamesApi.create(gameData);
      
      if (response.success && response.data) {
        // 重新获取对局列表以更新数据
        await get().fetchGames();
        
        set({
          isLoading: false,
          error: null
        });
        
        // 重置表单
        get().resetGameForm();
        
        return true;
      } else {
        set({
          isLoading: false,
          error: response.error || '创建对局记录失败'
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

  setSelectedPlayers: (players: User[]) => {
    set({ selectedPlayers: players });
  },

  setScores: (scores: (number | string)[]) => {
    set({ scores });
  },

  resetGameForm: () => {
    set({
      selectedPlayers: [],
      scores: ['', '', '', '']
    });
  },

  clearError: () => {
    set({ error: null });
  }
}));

// 验证分数总和的工具函数
export const validateScores = (scores: number[]): boolean => {
  const total = scores.reduce((sum, score) => sum + score, 0);
  return total === 100000;
};

// 计算分数差值的工具函数
export const getScoreDifference = (scores: number[]): number => {
  const total = scores.reduce((sum, score) => sum + score, 0);
  return 100000 - total;
};