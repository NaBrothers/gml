// 数据库操作工具函数（文件持久化存储）- 简化版本
import { 
  User, 
  UserStats, 
  UserWithStats, 
  GameRecord, 
  GamePlayerRecord, 
  GamePlayerDetail, 
  PointHistory, 
  RankConfig, 
  MahjongCalculation, 
  RankInfo, 
  UserRole 
} from '../../shared/types.js';
import { UMA_POINTS, BASE_POINTS } from '../../shared/types.js';
import { 
  userFileStorage, 
  gameFileStorage,
  initializeDataFiles 
} from './fileStorage.js';

// 内存缓存（提高性能）
let users: User[] = [];
let games: GameRecord[] = [];

// 数据是否已加载
let dataLoaded = false;

// 防止重复初始化的标志
let isInitialized = false;

// 初始化数据文件
export async function initializeDatabase(): Promise<void> {
  if (isInitialized) return;
  
  try {
    await initializeDataFiles();
    await loadAllData();
    isInitialized = true;
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 加载所有数据到内存
export async function loadAllData(): Promise<void> {
  if (dataLoaded) return;
  
  try {
    users = await userFileStorage.load();
    games = await gameFileStorage.load();
    dataLoaded = true;
    console.log('数据已从文件加载到内存');
  } catch (error) {
    console.error('加载数据失败:', error);
    throw error;
  }
}

// 生成唯一ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 段位配置数据（简化版本）
const RANK_CONFIGS: RankConfig[] = [
  { "id": 1,  "rankName": "雀之气一段", "minPoints": 0, "maxPoints": 9,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 1,  "majorRank": "雀之气", "allowDropPoints": false },
  { "id": 2,  "rankName": "雀之气二段", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 2,  "majorRank": "雀之气", "allowDropPoints": false },
  { "id": 3,  "rankName": "雀之气三段", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 3,  "majorRank": "雀之气", "allowDropPoints": false },
  { "id": 4,  "rankName": "雀之气四段", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 4,  "majorRank": "雀之气", "allowDropPoints": true },
  { "id": 5,  "rankName": "雀之气五段", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 5,  "majorRank": "雀之气", "allowDropPoints": true },
  { "id": 6,  "rankName": "雀之气六段", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 6,  "majorRank": "雀之气", "allowDropPoints": true },
  { "id": 7,  "rankName": "雀之气七段", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 7,  "majorRank": "雀之气", "allowDropPoints": true },
  { "id": 8,  "rankName": "雀之气八段", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 8,  "majorRank": "雀之气", "allowDropPoints": true },
  { "id": 9,  "rankName": "雀之气九段", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 9,  "majorRank": "雀之气", "allowDropPoints": true },

  { "id": 10, "rankName": "一星雀者", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 10, "majorRank": "雀者",   "allowDropPoints": true },
  { "id": 11, "rankName": "二星雀者", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 11, "majorRank": "雀者",   "allowDropPoints": true },
  { "id": 12, "rankName": "三星雀者", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 12, "majorRank": "雀者",   "allowDropPoints": true },
  { "id": 13, "rankName": "四星雀者", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 13, "majorRank": "雀者",   "allowDropPoints": true },
  { "id": 14, "rankName": "五星雀者", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 14, "majorRank": "雀者",   "allowDropPoints": true },
  { "id": 15, "rankName": "六星雀者", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 15, "majorRank": "雀者",   "allowDropPoints": true },
  { "id": 16, "rankName": "七星雀者", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 16, "majorRank": "雀者",   "allowDropPoints": true },
  { "id": 17, "rankName": "八星雀者", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 17, "majorRank": "雀者",   "allowDropPoints": true },
  { "id": 18, "rankName": "九星雀者", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 18, "majorRank": "雀者",   "allowDropPoints": true },

  { "id": 19, "rankName": "一星雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 19, "majorRank": "雀师",   "allowDropPoints": true },
  { "id": 20, "rankName": "二星雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 20, "majorRank": "雀师",   "allowDropPoints": true },
  { "id": 21, "rankName": "三星雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 21, "majorRank": "雀师",   "allowDropPoints": true },
  { "id": 22, "rankName": "四星雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 22, "majorRank": "雀师",   "allowDropPoints": true },
  { "id": 23, "rankName": "五星雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 23, "majorRank": "雀师",   "allowDropPoints": true },
  { "id": 24, "rankName": "六星雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 24, "majorRank": "雀师",   "allowDropPoints": true },
  { "id": 25, "rankName": "七星雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 25, "majorRank": "雀师",   "allowDropPoints": true },
  { "id": 26, "rankName": "八星雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 26, "majorRank": "雀师",   "allowDropPoints": true },
  { "id": 27, "rankName": "九星雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 27, "majorRank": "雀师",   "allowDropPoints": true },

  { "id": 28, "rankName": "一星大雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 28, "majorRank": "大雀师", "allowDropPoints": true },
  { "id": 29, "rankName": "二星大雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 29, "majorRank": "大雀师", "allowDropPoints": true },
  { "id": 30, "rankName": "三星大雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 30, "majorRank": "大雀师", "allowDropPoints": true },
  { "id": 31, "rankName": "四星大雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 31, "majorRank": "大雀师", "allowDropPoints": true },
  { "id": 32, "rankName": "五星大雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 32, "majorRank": "大雀师", "allowDropPoints": true },
  { "id": 33, "rankName": "六星大雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 33, "majorRank": "大雀师", "allowDropPoints": true },
  { "id": 34, "rankName": "七星大雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 34, "majorRank": "大雀师", "allowDropPoints": true },
  { "id": 35, "rankName": "八星大雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 35, "majorRank": "大雀师", "allowDropPoints": true },
  { "id": 36, "rankName": "九星大雀师", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 36, "majorRank": "大雀师", "allowDropPoints": true },

  { "id": 37, "rankName": "一星雀灵", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 37, "majorRank": "雀灵",   "allowDropPoints": true },
  { "id": 38, "rankName": "二星雀灵", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 38, "majorRank": "雀灵",   "allowDropPoints": true },
  { "id": 39, "rankName": "三星雀灵", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 39, "majorRank": "雀灵",   "allowDropPoints": true },
  { "id": 40, "rankName": "四星雀灵", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 40, "majorRank": "雀灵",   "allowDropPoints": true },
  { "id": 41, "rankName": "五星雀灵", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 41, "majorRank": "雀灵",   "allowDropPoints": true },
  { "id": 42, "rankName": "六星雀灵", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 42, "majorRank": "雀灵",   "allowDropPoints": true },
  { "id": 43, "rankName": "七星雀灵", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 43, "majorRank": "雀灵",   "allowDropPoints": true },
  { "id": 44, "rankName": "八星雀灵", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 44, "majorRank": "雀灵",   "allowDropPoints": true },
  { "id": 45, "rankName": "九星雀灵", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 45, "majorRank": "雀灵",   "allowDropPoints": true },

  { "id": 46, "rankName": "一星雀王", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 46, "majorRank": "雀王",   "allowDropPoints": true },
  { "id": 47, "rankName": "二星雀王", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 47, "majorRank": "雀王",   "allowDropPoints": true },
  { "id": 48, "rankName": "三星雀王", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 48, "majorRank": "雀王",   "allowDropPoints": true },
  { "id": 49, "rankName": "四星雀王", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 49, "majorRank": "雀王",   "allowDropPoints": true },
  { "id": 50, "rankName": "五星雀王", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 50, "majorRank": "雀王",   "allowDropPoints": true },
  { "id": 51, "rankName": "六星雀王", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 51, "majorRank": "雀王",   "allowDropPoints": true },
  { "id": 52, "rankName": "七星雀王", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 52, "majorRank": "雀王",   "allowDropPoints": true },
  { "id": 53, "rankName": "八星雀王", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 53, "majorRank": "雀王",   "allowDropPoints": true },
  { "id": 54, "rankName": "九星雀王", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 54, "majorRank": "雀王",   "allowDropPoints": true },

  { "id": 55, "rankName": "一星雀皇", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 55, "majorRank": "雀皇",   "allowDropPoints": true },
  { "id": 56, "rankName": "二星雀皇", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 56, "majorRank": "雀皇",   "allowDropPoints": true },
  { "id": 57, "rankName": "三星雀皇", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 57, "majorRank": "雀皇",   "allowDropPoints": true },
  { "id": 58, "rankName": "四星雀皇", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 58, "majorRank": "雀皇",   "allowDropPoints": true },
  { "id": 59, "rankName": "五星雀皇", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 59, "majorRank": "雀皇",   "allowDropPoints": true },
  { "id": 60, "rankName": "六星雀皇", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 60, "majorRank": "雀皇",   "allowDropPoints": true },
  { "id": 61, "rankName": "七星雀皇", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 61, "majorRank": "雀皇",   "allowDropPoints": true },
  { "id": 62, "rankName": "八星雀皇", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 62, "majorRank": "雀皇",   "allowDropPoints": true },
  { "id": 63, "rankName": "九星雀皇", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 63, "majorRank": "雀皇",   "allowDropPoints": true },

  { "id": 64, "rankName": "一星雀宗", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 64, "majorRank": "雀宗",   "allowDropPoints": true },
  { "id": 65, "rankName": "二星雀宗", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 65, "majorRank": "雀宗",   "allowDropPoints": true },
  { "id": 66, "rankName": "三星雀宗", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 66, "majorRank": "雀宗",   "allowDropPoints": true },
  { "id": 67, "rankName": "四星雀宗", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 67, "majorRank": "雀宗",   "allowDropPoints": true },
  { "id": 68, "rankName": "五星雀宗", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 68, "majorRank": "雀宗",   "allowDropPoints": true },
  { "id": 69, "rankName": "六星雀宗", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 69, "majorRank": "雀宗",   "allowDropPoints": true },
  { "id": 70, "rankName": "七星雀宗", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 70, "majorRank": "雀宗",   "allowDropPoints": true },
  { "id": 71, "rankName": "八星雀宗", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 71, "majorRank": "雀宗",   "allowDropPoints": true },
  { "id": 72, "rankName": "九星雀宗", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 72, "majorRank": "雀宗",   "allowDropPoints": true },

  { "id": 73, "rankName": "一星雀尊", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 73, "majorRank": "雀尊",   "allowDropPoints": true },
  { "id": 74, "rankName": "二星雀尊", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 74, "majorRank": "雀尊",   "allowDropPoints": true },
  { "id": 75, "rankName": "三星雀尊", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 75, "majorRank": "雀尊",   "allowDropPoints": true },
  { "id": 76, "rankName": "四星雀尊", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 76, "majorRank": "雀尊",   "allowDropPoints": true },
  { "id": 77, "rankName": "五星雀尊", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 77, "majorRank": "雀尊",   "allowDropPoints": true },
  { "id": 78, "rankName": "六星雀尊", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 78, "majorRank": "雀尊",   "allowDropPoints": true },
  { "id": 79, "rankName": "七星雀尊", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 79, "majorRank": "雀尊",   "allowDropPoints": true },
  { "id": 80, "rankName": "八星雀尊", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 80, "majorRank": "雀尊",   "allowDropPoints": true },
  { "id": 81, "rankName": "九星雀尊", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 81, "majorRank": "雀尊",   "allowDropPoints": true },

  { "id": 82, "rankName": "一星雀圣", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 82, "majorRank": "雀圣",   "allowDropPoints": true },
  { "id": 83, "rankName": "二星雀圣", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 83, "majorRank": "雀圣",   "allowDropPoints": true },
  { "id": 84, "rankName": "三星雀圣", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 84, "majorRank": "雀圣",   "allowDropPoints": true },
  { "id": 85, "rankName": "四星雀圣", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 85, "majorRank": "雀圣",   "allowDropPoints": true },
  { "id": 86, "rankName": "五星雀圣", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 86, "majorRank": "雀圣",   "allowDropPoints": true },
  { "id": 87, "rankName": "六星雀圣", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 87, "majorRank": "雀圣",   "allowDropPoints": true },
  { "id": 88, "rankName": "七星雀圣", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 88, "majorRank": "雀圣",   "allowDropPoints": true },
  { "id": 89, "rankName": "八星雀圣", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 89, "majorRank": "雀圣",   "allowDropPoints": true },
  { "id": 90, "rankName": "九星雀圣", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 90, "majorRank": "雀圣",   "allowDropPoints": true },

  { "id": 91, "rankName": "雀帝", "minPoints": 0, "maxPoints": 0,  "promotionBonus": 0, "demotionPenalty": 0, "rankOrder": 91, "majorRank": "雀帝",   "allowDropPoints": true }
];

// 解析段位信息
export function parseRankInfo(points: number): RankInfo {
  const rankConfig = RANK_CONFIGS.find(config => 
    points >= config.minPoints && points <= config.maxPoints
  ) || RANK_CONFIGS[0];

  return {
    majorRank: rankConfig.majorRank,
    minorRank: 0, // 简化版本暂不使用小段位
    displayName: rankConfig.rankName,
    rankConfig
  };
}

// 根据积分获取段位
export function getRankByPoints(points: number): string {
  const rankInfo = parseRankInfo(points);
  return rankInfo.displayName;
}

// 计算麻将积分
export function calculateMahjongPoints(scores: number[]): MahjongCalculation[] {
  // 验证总分
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  if (totalScore !== 100000) {
    throw new Error('四人总分必须为100000点');
  }

  // 创建玩家数据并排序
  const players = scores.map((score, index) => ({ score, index }));
  players.sort((a, b) => b.score - a.score);

  // 计算每个玩家的积分
  const results: MahjongCalculation[] = new Array(4);
  
  players.forEach((player, position) => {
    const rawPoints = (player.score - BASE_POINTS) / 1000;
    const umaPoints = UMA_POINTS[position];
    const rankPoints = Math.ceil(rawPoints + umaPoints);
    
    results[player.index] = {
      finalScore: player.score,
      rawPoints: parseFloat(rawPoints.toFixed(1)),
      umaPoints,
      rankPoints,
      position: position + 1
    };
  });

  return results;
}

// 计算用户统计信息（实时计算）
export function calculateUserStats(userId: string): UserStats {
  // 获取用户参与的所有对局
  const userGames = games.filter(game => 
    game.players.some(player => player.userId === userId)
  );

  if (userGames.length === 0) {
    return {
      totalPoints: 1800, // 初始积分
      rankLevel: 19,
      rankPoints: 0,
      gamesPlayed: 0,
      wins: 0,
      averagePosition: 0,
      currentRank: '四段'
    };
  }

  // 计算总积分变化
  let totalPointsChange = 0;
  let wins = 0;
  let totalPosition = 0;

  userGames.forEach(game => {
    const userPlayer = game.players.find(player => player.userId === userId);
    if (userPlayer) {
      // 计算这局的积分变化
      const calculation = calculateMahjongPoints(
        game.players.map(p => p.finalScore)
      );
      const userCalc = calculation.find((_, index) => 
        game.players[index].userId === userId
      );
      
      if (userCalc) {
        totalPointsChange += userCalc.rankPoints;
        totalPosition += userCalc.position;
        if (userCalc.position === 1) wins++;
      }
    }
  });

  const totalPoints = 1800 + totalPointsChange; // 初始积分1800 + 积分变化
  const rankInfo = parseRankInfo(totalPoints);
  const averagePosition = userGames.length > 0 ? totalPosition / userGames.length : 0;

  return {
    totalPoints,
    rankLevel: rankInfo.rankConfig.rankOrder,
    rankPoints: totalPoints - rankInfo.rankConfig.minPoints,
    gamesPlayed: userGames.length,
    wins,
    averagePosition: parseFloat(averagePosition.toFixed(2)),
    currentRank: rankInfo.displayName
  };
}

// 计算用户积分历史（实时计算）
export function calculateUserPointHistory(userId: string): PointHistory[] {
  const userGames = games
    .filter(game => game.players.some(player => player.userId === userId))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const history: PointHistory[] = [];
  let currentPoints = 1800; // 初始积分

  userGames.forEach(game => {
    const userPlayer = game.players.find(player => player.userId === userId);
    if (userPlayer) {
      const calculation = calculateMahjongPoints(
        game.players.map(p => p.finalScore)
      );
      const userCalc = calculation.find((_, index) => 
        game.players[index].userId === userId
      );
      
      if (userCalc) {
        const pointsBefore = currentPoints;
        const pointsAfter = currentPoints + userCalc.rankPoints;
        const rankBefore = getRankByPoints(pointsBefore);
        const rankAfter = getRankByPoints(pointsAfter);
        
        // 获取对手信息
        const opponents = game.players
          .filter(p => p.userId !== userId)
          .map(p => {
            const user = users.find(u => u.id === p.userId);
            return user?.nickname || user?.username || '未知玩家';
          });

        history.push({
          gameId: game.id,
          pointsBefore,
          pointsAfter,
          pointsChange: userCalc.rankPoints,
          rankBefore,
          rankAfter,
          gameDate: game.createdAt,
          opponents
        });

        currentPoints = pointsAfter;
      }
    }
  });

  return history;
}

// 用户数据库操作
export const userDb = {
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await loadAllData();
    const user: User = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(user);
    await userFileStorage.save(users);
    return user;
  },

  async findAll(): Promise<UserWithStats[]> {
    await loadAllData();
    return users.map(user => {
      const stats = calculateUserStats(user.id);
      return {
        ...user,
        stats,
        totalPoints: stats.totalPoints,
        rankLevel: stats.rankLevel,
        rankPoints: stats.rankPoints,
        gamesPlayed: stats.gamesPlayed,
        wins: stats.wins,
        averagePosition: stats.averagePosition,
        currentRank: stats.currentRank
      };
    });
  },

  async findById(id: string): Promise<UserWithStats | null> {
    await loadAllData();
    const user = users.find(user => user.id === id);
    if (!user) return null;
    
    const stats = calculateUserStats(user.id);
    return {
      ...user,
      stats,
      totalPoints: stats.totalPoints,
      rankLevel: stats.rankLevel,
      rankPoints: stats.rankPoints,
      gamesPlayed: stats.gamesPlayed,
      wins: stats.wins,
      averagePosition: stats.averagePosition,
      currentRank: stats.currentRank
    };
  },

  async findByUsername(username: string): Promise<UserWithStats | null> {
    await loadAllData();
    const user = users.find(user => user.username === username);
    if (!user) return null;
    
    const stats = calculateUserStats(user.id);
    return {
      ...user,
      stats,
      totalPoints: stats.totalPoints,
      rankLevel: stats.rankLevel,
      rankPoints: stats.rankPoints,
      gamesPlayed: stats.gamesPlayed,
      wins: stats.wins,
      averagePosition: stats.averagePosition,
      currentRank: stats.currentRank
    };
  },

  async update(id: string, updateData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    await loadAllData();
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    await userFileStorage.save(users);
    return users[userIndex];
  },

  async delete(id: string): Promise<boolean> {
    await loadAllData();
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    users.splice(userIndex, 1);
    await userFileStorage.save(users);
    return true;
  }
};

// 对局数据库操作
export const gameDb = {
  async create(gameData: Omit<GameRecord, 'id' | 'createdAt'>): Promise<GameRecord> {
    await loadAllData();
    const game: GameRecord = {
      id: generateId(),
      ...gameData,
      createdAt: new Date().toISOString()
    };
    games.push(game);
    await gameFileStorage.save(games);
    return game;
  },

  async findAll(): Promise<GameRecord[]> {
    await loadAllData();
    return [...games].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async findById(id: string): Promise<GameRecord | null> {
    await loadAllData();
    return games.find(game => game.id === id) || null;
  }
};

// 兼容性函数（为了向后兼容）
export const gamePlayerDb = {
  async findByGameId(gameId: string): Promise<GamePlayerDetail[]> {
    await loadAllData();
    const game = games.find(g => g.id === gameId);
    if (!game) return [];

    const calculations = calculateMahjongPoints(
      game.players.map(p => p.finalScore)
    );

    return game.players.map((player, index) => {
      const user = users.find(u => u.id === player.userId);
      const calc = calculations[index];
      
      return {
        ...player,
        id: `${gameId}_${player.userId}`,
        user,
        rawPoints: calc.rawPoints,
        umaPoints: calc.umaPoints,
        rankPointsChange: calc.rankPoints
      };
    });
  },

  async findByUserId(userId: string): Promise<GamePlayerDetail[]> {
    await loadAllData();
    const userGames = games.filter(game => 
      game.players.some(player => player.userId === userId)
    );

    const result: GamePlayerDetail[] = [];
    
    for (const game of userGames) {
      const calculations = calculateMahjongPoints(
        game.players.map(p => p.finalScore)
      );
      
      const playerIndex = game.players.findIndex(p => p.userId === userId);
      if (playerIndex !== -1) {
        const player = game.players[playerIndex];
        const calc = calculations[playerIndex];
        const user = users.find(u => u.id === player.userId);
        
        result.push({
          ...player,
          id: `${game.id}_${player.userId}`,
          user,
          rawPoints: calc.rawPoints,
          umaPoints: calc.umaPoints,
          rankPointsChange: calc.rankPoints
        });
      }
    }

    return result;
  }
};

// 积分历史数据库操作（兼容性）
export const pointHistoryDb = {
  async findByUserId(userId: string): Promise<PointHistory[]> {
    return calculateUserPointHistory(userId);
  }
};

// 兼容性类型别名
export type Game = GameRecord;
export type GamePlayer = GamePlayerDetail;