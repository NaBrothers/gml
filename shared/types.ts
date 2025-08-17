// 共享类型定义

// 用户相关类型
export interface User {
  id: string;
  username: string;
  passwordHash?: string;
  nickname: string;
  avatar: string;
  totalPoints: number;
  rankLevel: string;
  rankPoints: number;
  gamesPlayed: number;
  createdAt: string;
  updatedAt: string;
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
  token?: string;
  user?: User;
  message?: string;
}

// 对局相关类型
export interface Game {
  id: string;
  gameType: string;
  createdAt: string;
  status: string;
}

export interface GamePlayer {
  id: string;
  gameId: string;
  userId: string;
  finalScore: number;
  rawPoints: number;
  umaPoints: number;
  rankPointsChange: number;
  position: number;
  user?: User;
}

export interface GameResult {
  players: string[];
  scores: number[];
  gameType: string;
}

export interface GameDetail {
  game: Game;
  players: GamePlayer[];
}

// 积分历史类型
export interface PointHistory {
  id: string;
  userId: string;
  gameId: string;
  pointsBefore: number;
  pointsAfter: number;
  pointsChange: number;
  rankBefore: string;
  rankAfter: string;
  createdAt: string;
}

// 段位配置类型
export interface RankConfig {
  id: number;
  rankName: string;
  minPoints: number;
  maxPoints: number;
  promotionBonus: number;
  demotionPenalty: number;
  rankOrder: number;
  // 新增字段支持大段位+小段位
  majorRank: string; // 大段位名称
  minorRankType: 'dan' | 'star' | 'none'; // 小段位类型：段/星/无
  minorRankRange: [number, number]; // 小段位范围 [最小值, 最大值]
}

// 段位解析结果类型
export interface RankInfo {
  majorRank: string; // 大段位
  minorRank: number; // 小段位数值
  minorRankType: 'dan' | 'star' | 'none'; // 小段位类型
  displayName: string; // 完整显示名称
  rankConfig: RankConfig; // 段位配置
}

// 排行榜类型
export interface RankingUser {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  totalPoints: number;
  rankLevel: string;
  gamesPlayed: number;
  rank: number;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 麻将计算相关类型
export interface MahjongCalculation {
  finalScore: number;
  rawPoints: number;
  umaPoints: number;
  rankPoints: number;
  position: number;
}

// 马点配置
export const UMA_POINTS = [15, 5, -5, -15]; // 1-4位的马点
export const BASE_POINTS = 25000; // 配点（精算原点）
export const TOTAL_POINTS = 100000; // 四人总分