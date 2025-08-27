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
  originalRankPointsChange?: number; // 原始积分变化（未应用新手保护）
  isNewbieProtected?: boolean; // 是否应用了新手保护
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
  originalPointsChange?: number; // 原始积分变化（未应用新手保护）
  isNewbieProtected?: boolean; // 是否应用了新手保护
  rankBefore: string;
  rankAfter: string;
  gameDate: string;
  opponents: string[];
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

// 段位信息
export interface RankInfo {
  majorRank: string; // 大段位
  minorRank: number; // 小段位数值
  minorRankType: 'dan' | 'star' | 'none'; // 小段位类型
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
  originalRankPoints?: number; // 原始积分变化（未应用新手保护）
  isNewbieProtected?: boolean; // 是否应用了新手保护
  position: number;
}

// 常量 - 已迁移到配置文件，这些导出用于向后兼容
// 实际值将从配置管理器动态获取
// export const UMA_POINTS = [20, 10, 0, -10]; // 1-4位的马点 - 已迁移到 config/game.conf
// export const BASE_POINTS = 25000; // 配点（精算原点） - 已迁移到 config/game.conf  
// export const TOTAL_POINTS = 100000; // 四人总分 - 已迁移到 config/game.conf

// 兼容性类型定义（为了向后兼容，逐步迁移时使用）
export interface Game extends GameRecord {}
export interface GamePlayer extends GamePlayerDetail {}

// 曲线配置相关类型定义

// 曲线上的数据点
export interface CurvePoint {
  x: number; // 段位序号 (rankOrder)
  y: number; // 积分值 (minPoints)
  rankId: number; // 段位ID
  rankName: string; // 段位名称
}

// 数学函数类型 - 简化为只支持自定义函数
export type FunctionType = 'custom';

// 自定义函数参数
export interface CustomFunctionParam {
  name: string; // 参数名称 (如 a, b, c)
  value: number; // 参数值
  description?: string; // 参数描述
}

// 段位范围配置
export interface RankRangeConfig {
  id: string; // 范围ID
  name: string; // 范围名称
  startRank: number; // 起始段位序号
  endRank: number; // 结束段位序号
  startPoints: number; // 起始积分
  endPoints: number; // 结束积分
  expression: string; // 数学表达式
  params: CustomFunctionParam[]; // 函数参数
  enabled: boolean; // 是否启用
}

// 函数参数配置
export interface FunctionParams {
  type: FunctionType;
  // 全局范围设置（用于向后兼容）
  startPoints: number; // 起始积分
  endPoints: number; // 结束积分
  startRank: number; // 起始段位序号
  endRank: number; // 结束段位序号
  // 自定义函数相关
  customExpression?: string; // 自定义函数表达式
  customParams?: CustomFunctionParam[]; // 自定义函数参数列表
  // 多段式配置
  rangeConfigs: RankRangeConfig[]; // 段位范围配置列表
}

// 曲线配置状态
export interface CurveConfig {
  points: CurvePoint[];
  originalRanks: RankConfig[];
  modifiedRanks: RankConfig[];
  isDirty: boolean; // 是否有未保存的更改
  lastSaved?: string; // 最后保存时间
}

// 配置验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 曲线编辑器的操作模式
export type EditMode = 'click' | 'function' | 'manual';

// 函数生成器的配置
export interface FunctionGeneratorConfig {
  selectedFunction: FunctionType;
  params: FunctionParams;
  previewPoints: CurvePoint[];
  isGenerating: boolean;
}