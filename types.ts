// 共享类型定义

// 用户角色枚举
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// 简化的用户接口 - 只存储基本信息，不存储积分相关数据
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  nickname: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// 用户统计信息 - 实时计算得出，不存储
export interface UserStats {
  totalPoints: number;
  rankLevel: number;
  rankPoints: number;
  gamesPlayed: number;
  wins: number;
  averagePosition: number;
  currentRank: string;
}

// 完整的用户信息（基本信息 + 统计信息）
export interface UserWithStats extends User {
  stats: UserStats;
  // 添加直接访问的属性以保持向后兼容
  totalPoints: number;
  rankLevel: number;
  rankPoints: number;
  gamesPlayed: number;
  wins: number;
  averagePosition: number;
  currentRank: string;
}

export interface UserRegistration {
  username: string;
  password: string;
  nickname?: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: UserWithStats;
  };
  token?: string;
  user?: UserWithStats;
  message?: string;
  error?: string;
}

// 简化的对局记录 - 只存储核心信息
export interface GameRecord {
  id: string;
  gameType: string;
  createdAt: string;
  players: GamePlayerRecord[];
}

// 对局中玩家记录 - 只存储基本得分信息
export interface GamePlayerRecord {
  userId: string;
  finalScore: number;
  position: number;
}

// 对局结果输入接口
export interface GameResult {
  players: string[];
  scores: number[];
  gameType: string;
}

// 详细的对局信息 - 包含计算后的数据，用于展示
export interface GameDetail {
  game: GameRecord;
  players: GamePlayerDetail[];
}

// 详细的玩家对局信息 - 包含计算后的积分变化
export interface GamePlayerDetail extends GamePlayerRecord {
  id: string; // 复合ID: gameId_userId
  user?: User;
  rawPoints: number;
  umaPoints: number;
  rankPointsChange: number;
  pointsBefore?: number;
  pointsAfter?: number;
  rankBefore?: string;
  rankAfter?: string;
}

// 积分历史记录 - 实时计算，不存储
export interface PointHistory {
  gameId: string;
  pointsBefore: number;
  pointsAfter: number;
  pointsChange: number;
  rankBefore: string;
  rankAfter: string;
  gameDate: string;
  opponents: string[];
}

// 段位配置类型
export interface RankConfig {
  id: number;
  rankName: string; // 段位名称
  minPoints: number; // 段位起始分
  maxPoints: number; // 段位最高分
  promotionBonus: number; // 段位奖励分
  demotionPenalty: number; // 段位惩罚分
  rankOrder: number; // 段位等级
  majorRank: string; // 大段位名称
  allowDropPoints: boolean; // 是否允许掉分
}

// 段位信息
export interface RankInfo {
  majorRank: string; // 大段位
  minorRank: number; // 小段位数值
  displayName: string; // 完整显示名称
  rankConfig: RankConfig; // 段位配置
}

// 排行榜用户信息 - 实时计算
export interface RankingUser {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  totalPoints: number;
  rankLevel: number;
  gamesPlayed: number;
  rank: number;
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 麻将积分计算结果
export interface MahjongCalculation {
  finalScore: number;
  rawPoints: number;
  umaPoints: number;
  rankPoints: number;
  position: number;
}

// 常量
export const UMA_POINTS = [20, 10, 0, -10]; // 1-4位的马点
export const BASE_POINTS = 25000; // 配点（精算原点）
export const TOTAL_POINTS = 100000; // 四人总分

// 兼容性类型定义（为了向后兼容，逐步迁移时使用）
export interface Game extends GameRecord {}
export interface GamePlayer extends GamePlayerDetail {}