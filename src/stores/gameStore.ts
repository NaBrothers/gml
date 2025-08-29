// 对局记分管理
import { create } from 'zustand';
import { GameDetail, GameResult, User } from '../../shared/types';
import { gamesApi, configApi } from '../lib/api';

// 缓存的游戏配置
let cachedGameConfig: any = null;
let lastConfigFetchTime = 0;
const CONFIG_CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 获取游戏配置（带缓存）
const getGameConfig = async () => {
  const now = Date.now();
  
  // 如果缓存有效，直接返回缓存
  if (cachedGameConfig && (now - lastConfigFetchTime) < CONFIG_CACHE_DURATION) {
    return cachedGameConfig;
  }
  
  try {
    const response = await configApi.getGameConfig();
    if (response.success && response.data) {
      cachedGameConfig = response.data;
      lastConfigFetchTime = now;
      return response.data;
    }
  } catch (error) {
    console.error('获取游戏配置失败:', error);
  }
  
  // 如果获取失败，返回默认配置
  return {
    BASE_POINTS: 25000,
    TOTAL_POINTS: 100000,
    INITIAL_POINTS: 1800,
    UMA_POINTS: [15, 5, -5, -15],
    DEFAULT_GAME_TYPE: '半庄',
    MIN_PLAYERS: 4,
    MAX_PLAYERS: 4
  };
};

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
export const validateScores = async (scores: number[]): Promise<boolean> => {
  const config = await getGameConfig();
  const total = scores.reduce((sum, score) => sum + score, 0);
  return total === config.TOTAL_POINTS;
};

// 计算分数差值的工具函数
export const getScoreDifference = async (scores: number[]): Promise<number> => {
  const config = await getGameConfig();
  const total = scores.reduce((sum, score) => sum + score, 0);
  return config.TOTAL_POINTS - total;
};