// 数据库操作工具函数（模拟数据库操作）
import { User, Game, GamePlayer, PointHistory, RankConfig, MahjongCalculation, RankInfo } from '../../shared/types.js';
import { UMA_POINTS, BASE_POINTS } from '../../shared/types.js';

// 模拟数据存储
let users: User[] = [];
let games: Game[] = [];
let gamePlayers: GamePlayer[] = [];
let pointHistory: PointHistory[] = [];

// 段位配置数据（斗破苍穹风格 - 大段位+小段位结构）
const rankConfigs: RankConfig[] = [
  // 雀之气 1-9段 (0-899分)
  { id: 1, rankName: '雀之气一段', minPoints: 0, maxPoints: 99, promotionBonus: 0, demotionPenalty: 0, rankOrder: 1, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 2, rankName: '雀之气二段', minPoints: 100, maxPoints: 199, promotionBonus: 0, demotionPenalty: 0, rankOrder: 2, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 3, rankName: '雀之气三段', minPoints: 200, maxPoints: 299, promotionBonus: 0, demotionPenalty: 0, rankOrder: 3, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 4, rankName: '雀之气四段', minPoints: 300, maxPoints: 399, promotionBonus: 0, demotionPenalty: 0, rankOrder: 4, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 5, rankName: '雀之气五段', minPoints: 400, maxPoints: 499, promotionBonus: 0, demotionPenalty: 0, rankOrder: 5, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 6, rankName: '雀之气六段', minPoints: 500, maxPoints: 599, promotionBonus: 0, demotionPenalty: 0, rankOrder: 6, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 7, rankName: '雀之气七段', minPoints: 600, maxPoints: 699, promotionBonus: 0, demotionPenalty: 0, rankOrder: 7, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 8, rankName: '雀之气八段', minPoints: 700, maxPoints: 799, promotionBonus: 0, demotionPenalty: 0, rankOrder: 8, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 9, rankName: '雀之气九段', minPoints: 800, maxPoints: 899, promotionBonus: 0, demotionPenalty: 0, rankOrder: 9, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  
  // 雀者 1-9星 (900-1799分)
  { id: 10, rankName: '一星雀者', minPoints: 900, maxPoints: 999, promotionBonus: 0, demotionPenalty: 0, rankOrder: 10, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 11, rankName: '二星雀者', minPoints: 1000, maxPoints: 1099, promotionBonus: 0, demotionPenalty: 0, rankOrder: 11, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 12, rankName: '三星雀者', minPoints: 1100, maxPoints: 1199, promotionBonus: 0, demotionPenalty: 0, rankOrder: 12, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 13, rankName: '四星雀者', minPoints: 1200, maxPoints: 1299, promotionBonus: 0, demotionPenalty: 0, rankOrder: 13, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 14, rankName: '五星雀者', minPoints: 1300, maxPoints: 1399, promotionBonus: 0, demotionPenalty: 0, rankOrder: 14, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 15, rankName: '六星雀者', minPoints: 1400, maxPoints: 1499, promotionBonus: 0, demotionPenalty: 0, rankOrder: 15, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 16, rankName: '七星雀者', minPoints: 1500, maxPoints: 1599, promotionBonus: 0, demotionPenalty: 0, rankOrder: 16, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 17, rankName: '八星雀者', minPoints: 1600, maxPoints: 1699, promotionBonus: 0, demotionPenalty: 0, rankOrder: 17, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 18, rankName: '九星雀者', minPoints: 1700, maxPoints: 1799, promotionBonus: 0, demotionPenalty: 0, rankOrder: 18, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  
  // 雀师 1-9星 (1800-2699分)
  { id: 19, rankName: '一星雀师', minPoints: 1800, maxPoints: 1899, promotionBonus: 0, demotionPenalty: 0, rankOrder: 19, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 20, rankName: '二星雀师', minPoints: 1900, maxPoints: 1999, promotionBonus: 0, demotionPenalty: 0, rankOrder: 20, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 21, rankName: '三星雀师', minPoints: 2000, maxPoints: 2099, promotionBonus: 0, demotionPenalty: 0, rankOrder: 21, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 22, rankName: '四星雀师', minPoints: 2100, maxPoints: 2199, promotionBonus: 0, demotionPenalty: 0, rankOrder: 22, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 23, rankName: '五星雀师', minPoints: 2200, maxPoints: 2299, promotionBonus: 0, demotionPenalty: 0, rankOrder: 23, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 24, rankName: '六星雀师', minPoints: 2300, maxPoints: 2399, promotionBonus: 0, demotionPenalty: 0, rankOrder: 24, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 25, rankName: '七星雀师', minPoints: 2400, maxPoints: 2499, promotionBonus: 0, demotionPenalty: 0, rankOrder: 25, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 26, rankName: '八星雀师', minPoints: 2500, maxPoints: 2599, promotionBonus: 0, demotionPenalty: 0, rankOrder: 26, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 27, rankName: '九星雀师', minPoints: 2600, maxPoints: 2699, promotionBonus: 0, demotionPenalty: 0, rankOrder: 27, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  
  // 大雀师 1-9星 (2700-3599分)
  { id: 28, rankName: '一星大雀师', minPoints: 2700, maxPoints: 2799, promotionBonus: 0, demotionPenalty: 0, rankOrder: 28, majorRank: '大雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 29, rankName: '二星大雀师', minPoints: 2800, maxPoints: 2899, promotionBonus: 0, demotionPenalty: 0, rankOrder: 29, majorRank: '大雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 30, rankName: '三星大雀师', minPoints: 2900, maxPoints: 2999, promotionBonus: 0, demotionPenalty: 0, rankOrder: 30, majorRank: '大雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 31, rankName: '四星大雀师', minPoints: 3000, maxPoints: 3099, promotionBonus: 0, demotionPenalty: 0, rankOrder: 31, majorRank: '大雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 32, rankName: '五星大雀师', minPoints: 3100, maxPoints: 3199, promotionBonus: 0, demotionPenalty: 0, rankOrder: 32, majorRank: '大雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 33, rankName: '六星大雀师', minPoints: 3200, maxPoints: 3299, promotionBonus: 0, demotionPenalty: 0, rankOrder: 33, majorRank: '大雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 34, rankName: '七星大雀师', minPoints: 3300, maxPoints: 3399, promotionBonus: 0, demotionPenalty: 0, rankOrder: 34, majorRank: '大雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 35, rankName: '八星大雀师', minPoints: 3400, maxPoints: 3499, promotionBonus: 0, demotionPenalty: 0, rankOrder: 35, majorRank: '大雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 36, rankName: '九星大雀师', minPoints: 3500, maxPoints: 3599, promotionBonus: 0, demotionPenalty: 0, rankOrder: 36, majorRank: '大雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  
  // 雀灵 1-9星 (3600-4499分)
  { id: 37, rankName: '一星雀灵', minPoints: 3600, maxPoints: 3699, promotionBonus: 110, demotionPenalty: -165, rankOrder: 37, majorRank: '雀灵', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 38, rankName: '二星雀灵', minPoints: 3700, maxPoints: 3799, promotionBonus: 110, demotionPenalty: -165, rankOrder: 38, majorRank: '雀灵', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 39, rankName: '三星雀灵', minPoints: 3800, maxPoints: 3899, promotionBonus: 110, demotionPenalty: -165, rankOrder: 39, majorRank: '雀灵', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 40, rankName: '四星雀灵', minPoints: 3900, maxPoints: 3999, promotionBonus: 110, demotionPenalty: -165, rankOrder: 40, majorRank: '雀灵', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 41, rankName: '五星雀灵', minPoints: 4000, maxPoints: 4099, promotionBonus: 110, demotionPenalty: -165, rankOrder: 41, majorRank: '雀灵', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 42, rankName: '六星雀灵', minPoints: 4100, maxPoints: 4199, promotionBonus: 110, demotionPenalty: -165, rankOrder: 42, majorRank: '雀灵', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 43, rankName: '七星雀灵', minPoints: 4200, maxPoints: 4299, promotionBonus: 110, demotionPenalty: -165, rankOrder: 43, majorRank: '雀灵', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 44, rankName: '八星雀灵', minPoints: 4300, maxPoints: 4399, promotionBonus: 110, demotionPenalty: -165, rankOrder: 44, majorRank: '雀灵', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 45, rankName: '九星雀灵', minPoints: 4400, maxPoints: 4499, promotionBonus: 110, demotionPenalty: -165, rankOrder: 45, majorRank: '雀灵', minorRankType: 'star', minorRankRange: [1, 9] },
  
  // 雀王 1-9星 (4500-5399分)
  { id: 46, rankName: '一星雀王', minPoints: 4500, maxPoints: 4599, promotionBonus: 110, demotionPenalty: -165, rankOrder: 46, majorRank: '雀王', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 47, rankName: '二星雀王', minPoints: 4600, maxPoints: 4699, promotionBonus: 110, demotionPenalty: -165, rankOrder: 47, majorRank: '雀王', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 48, rankName: '三星雀王', minPoints: 4700, maxPoints: 4799, promotionBonus: 110, demotionPenalty: -165, rankOrder: 48, majorRank: '雀王', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 49, rankName: '四星雀王', minPoints: 4800, maxPoints: 4899, promotionBonus: 110, demotionPenalty: -165, rankOrder: 49, majorRank: '雀王', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 50, rankName: '五星雀王', minPoints: 4900, maxPoints: 4999, promotionBonus: 110, demotionPenalty: -165, rankOrder: 50, majorRank: '雀王', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 51, rankName: '六星雀王', minPoints: 5000, maxPoints: 5099, promotionBonus: 110, demotionPenalty: -165, rankOrder: 51, majorRank: '雀王', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 52, rankName: '七星雀王', minPoints: 5100, maxPoints: 5199, promotionBonus: 110, demotionPenalty: -165, rankOrder: 52, majorRank: '雀王', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 53, rankName: '八星雀王', minPoints: 5200, maxPoints: 5299, promotionBonus: 110, demotionPenalty: -165, rankOrder: 53, majorRank: '雀王', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 54, rankName: '九星雀王', minPoints: 5300, maxPoints: 5399, promotionBonus: 110, demotionPenalty: -165, rankOrder: 54, majorRank: '雀王', minorRankType: 'star', minorRankRange: [1, 9] },
  
  // 雀皇 1-9星 (5400-6299分)
  { id: 55, rankName: '一星雀皇', minPoints: 5400, maxPoints: 5499, promotionBonus: 110, demotionPenalty: -165, rankOrder: 55, majorRank: '雀皇', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 56, rankName: '二星雀皇', minPoints: 5500, maxPoints: 5599, promotionBonus: 110, demotionPenalty: -165, rankOrder: 56, majorRank: '雀皇', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 57, rankName: '三星雀皇', minPoints: 5600, maxPoints: 5699, promotionBonus: 110, demotionPenalty: -165, rankOrder: 57, majorRank: '雀皇', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 58, rankName: '四星雀皇', minPoints: 5700, maxPoints: 5799, promotionBonus: 110, demotionPenalty: -165, rankOrder: 58, majorRank: '雀皇', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 59, rankName: '五星雀皇', minPoints: 5800, maxPoints: 5899, promotionBonus: 110, demotionPenalty: -165, rankOrder: 59, majorRank: '雀皇', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 60, rankName: '六星雀皇', minPoints: 5900, maxPoints: 5999, promotionBonus: 110, demotionPenalty: -165, rankOrder: 60, majorRank: '雀皇', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 61, rankName: '七星雀皇', minPoints: 6000, maxPoints: 6099, promotionBonus: 110, demotionPenalty: -165, rankOrder: 61, majorRank: '雀皇', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 62, rankName: '八星雀皇', minPoints: 6100, maxPoints: 6199, promotionBonus: 110, demotionPenalty: -165, rankOrder: 62, majorRank: '雀皇', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 63, rankName: '九星雀皇', minPoints: 6200, maxPoints: 6299, promotionBonus: 110, demotionPenalty: -165, rankOrder: 63, majorRank: '雀皇', minorRankType: 'star', minorRankRange: [1, 9] },
  
  // 雀宗 1-9星 (6300-7199分)
  { id: 64, rankName: '一星雀宗', minPoints: 6300, maxPoints: 6399, promotionBonus: 110, demotionPenalty: -165, rankOrder: 64, majorRank: '雀宗', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 65, rankName: '二星雀宗', minPoints: 6400, maxPoints: 6499, promotionBonus: 110, demotionPenalty: -165, rankOrder: 65, majorRank: '雀宗', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 66, rankName: '三星雀宗', minPoints: 6500, maxPoints: 6599, promotionBonus: 110, demotionPenalty: -165, rankOrder: 66, majorRank: '雀宗', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 67, rankName: '四星雀宗', minPoints: 6600, maxPoints: 6699, promotionBonus: 110, demotionPenalty: -165, rankOrder: 67, majorRank: '雀宗', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 68, rankName: '五星雀宗', minPoints: 6700, maxPoints: 6799, promotionBonus: 110, demotionPenalty: -165, rankOrder: 68, majorRank: '雀宗', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 69, rankName: '六星雀宗', minPoints: 6800, maxPoints: 6899, promotionBonus: 110, demotionPenalty: -165, rankOrder: 69, majorRank: '雀宗', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 70, rankName: '七星雀宗', minPoints: 6900, maxPoints: 6999, promotionBonus: 110, demotionPenalty: -165, rankOrder: 70, majorRank: '雀宗', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 71, rankName: '八星雀宗', minPoints: 7000, maxPoints: 7099, promotionBonus: 110, demotionPenalty: -165, rankOrder: 71, majorRank: '雀宗', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 72, rankName: '九星雀宗', minPoints: 7100, maxPoints: 7199, promotionBonus: 110, demotionPenalty: -165, rankOrder: 72, majorRank: '雀宗', minorRankType: 'star', minorRankRange: [1, 9] },
  
  // 雀尊 1-9星 (7200-8099分)
  { id: 73, rankName: '一星雀尊', minPoints: 7200, maxPoints: 7299, promotionBonus: 110, demotionPenalty: -165, rankOrder: 73, majorRank: '雀尊', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 74, rankName: '二星雀尊', minPoints: 7300, maxPoints: 7399, promotionBonus: 110, demotionPenalty: -165, rankOrder: 74, majorRank: '雀尊', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 75, rankName: '三星雀尊', minPoints: 7400, maxPoints: 7499, promotionBonus: 110, demotionPenalty: -165, rankOrder: 75, majorRank: '雀尊', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 76, rankName: '四星雀尊', minPoints: 7500, maxPoints: 7599, promotionBonus: 110, demotionPenalty: -165, rankOrder: 76, majorRank: '雀尊', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 77, rankName: '五星雀尊', minPoints: 7600, maxPoints: 7699, promotionBonus: 110, demotionPenalty: -165, rankOrder: 77, majorRank: '雀尊', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 78, rankName: '六星雀尊', minPoints: 7700, maxPoints: 7799, promotionBonus: 110, demotionPenalty: -165, rankOrder: 78, majorRank: '雀尊', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 79, rankName: '七星雀尊', minPoints: 7800, maxPoints: 7899, promotionBonus: 110, demotionPenalty: -165, rankOrder: 79, majorRank: '雀尊', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 80, rankName: '八星雀尊', minPoints: 7900, maxPoints: 7999, promotionBonus: 110, demotionPenalty: -165, rankOrder: 80, majorRank: '雀尊', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 81, rankName: '九星雀尊', minPoints: 8000, maxPoints: 8099, promotionBonus: 110, demotionPenalty: -165, rankOrder: 81, majorRank: '雀尊', minorRankType: 'star', minorRankRange: [1, 9] },
  
  // 雀圣 1-9星 (8100-8999分)
  { id: 82, rankName: '一星雀圣', minPoints: 8100, maxPoints: 8199, promotionBonus: 110, demotionPenalty: -165, rankOrder: 82, majorRank: '雀圣', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 83, rankName: '二星雀圣', minPoints: 8200, maxPoints: 8299, promotionBonus: 110, demotionPenalty: -165, rankOrder: 83, majorRank: '雀圣', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 84, rankName: '三星雀圣', minPoints: 8300, maxPoints: 8399, promotionBonus: 110, demotionPenalty: -165, rankOrder: 84, majorRank: '雀圣', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 85, rankName: '四星雀圣', minPoints: 8400, maxPoints: 8499, promotionBonus: 110, demotionPenalty: -165, rankOrder: 85, majorRank: '雀圣', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 86, rankName: '五星雀圣', minPoints: 8500, maxPoints: 8599, promotionBonus: 110, demotionPenalty: -165, rankOrder: 86, majorRank: '雀圣', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 87, rankName: '六星雀圣', minPoints: 8600, maxPoints: 8699, promotionBonus: 110, demotionPenalty: -165, rankOrder: 87, majorRank: '雀圣', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 88, rankName: '七星雀圣', minPoints: 8700, maxPoints: 8799, promotionBonus: 110, demotionPenalty: -165, rankOrder: 88, majorRank: '雀圣', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 89, rankName: '八星雀圣', minPoints: 8800, maxPoints: 8899, promotionBonus: 110, demotionPenalty: -165, rankOrder: 89, majorRank: '雀圣', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 90, rankName: '九星雀圣', minPoints: 8900, maxPoints: 8999, promotionBonus: 110, demotionPenalty: -165, rankOrder: 90, majorRank: '雀圣', minorRankType: 'star', minorRankRange: [1, 9] },
  
  // 雀帝 (9000+分，无小段位)
  { id: 91, rankName: '雀帝', minPoints: 9000, maxPoints: 99999, promotionBonus: 110, demotionPenalty: -165, rankOrder: 91, majorRank: '雀帝', minorRankType: 'none', minorRankRange: [0, 0] }
];

// 生成UUID
function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
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

// 用户数据库操作
export const userDb = {
  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(user);
    return user;
  },

  async findByUsername(username: string): Promise<User | null> {
    return users.find(user => user.username === username) || null;
  },

  async findById(id: string): Promise<User | null> {
    return users.find(user => user.id === id) || null;
  },

  async findAll(): Promise<User[]> {
    return [...users];
  },

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return users[userIndex];
  },

  async delete(id: string): Promise<boolean> {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    users.splice(userIndex, 1);
    return true;
  }
};

// 对局数据库操作
export const gameDb = {
  async create(gameData: Omit<Game, 'id' | 'createdAt'>): Promise<Game> {
    const game: Game = {
      id: generateId(),
      ...gameData,
      createdAt: new Date().toISOString()
    };
    games.push(game);
    return game;
  },

  async findById(id: string): Promise<Game | null> {
    return games.find(game => game.id === id) || null;
  },

  async findAll(): Promise<Game[]> {
    return [...games].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

// 对局玩家数据库操作
export const gamePlayerDb = {
  async create(playerData: Omit<GamePlayer, 'id'>): Promise<GamePlayer> {
    const gamePlayer: GamePlayer = {
      id: generateId(),
      ...playerData
    };
    gamePlayers.push(gamePlayer);
    return gamePlayer;
  },

  async findByGameId(gameId: string): Promise<GamePlayer[]> {
    return gamePlayers.filter(player => player.gameId === gameId);
  },

  async findByUserId(userId: string): Promise<GamePlayer[]> {
    return gamePlayers.filter(player => player.userId === userId);
  }
};

// 积分历史数据库操作
export const pointHistoryDb = {
  async create(historyData: Omit<PointHistory, 'id' | 'createdAt'>): Promise<PointHistory> {
    const history: PointHistory = {
      id: generateId(),
      ...historyData,
      createdAt: new Date().toISOString()
    };
    pointHistory.push(history);
    return history;
  },

  async findByUserId(userId: string): Promise<PointHistory[]> {
    return pointHistory
      .filter(history => history.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findByGameId(gameId: string): Promise<PointHistory[]> {
    return pointHistory.filter(history => history.gameId === gameId);
  }
};

// 段位解析和显示工具函数
export const parseRankInfo = (points: number): RankInfo => {
  const rankConfig = rankConfigs.find(rank => points >= rank.minPoints && points <= rank.maxPoints);
  if (!rankConfig) {
    return {
      majorRank: '雀之气',
      minorRank: 1,
      minorRankType: 'dan',
      displayName: '雀之气一段',
      rankConfig: rankConfigs[0]
    };
  }

  // 直接从rankName中提取小段位信息
  let minorRank = 1;
  if (rankConfig.minorRankType !== 'none') {
    // 从rankName中提取数字（一星、二星等）
    const rankName = rankConfig.rankName;
    const starMatch = rankName.match(/([一二三四五六七八九])星/);
    const danMatch = rankName.match(/([一二三四五六七八九])段/);
    
    if (starMatch) {
      const starNames = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
      minorRank = starNames.indexOf(starMatch[1]);
    } else if (danMatch) {
      const danNames = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
      minorRank = danNames.indexOf(danMatch[1]);
    }
  }

  return {
    majorRank: rankConfig.majorRank!,
    minorRank,
    minorRankType: rankConfig.minorRankType!,
    displayName: rankConfig.rankName, // 直接使用配置中的rankName
    rankConfig
  };
};

// 格式化段位显示名称（保留用于兼容性，但现在直接使用rankName）
export const formatRankDisplay = (majorRank: string, minorRank: number, minorRankType: string): string => {
  if (minorRankType === 'none') {
    return majorRank; // 雀帝
  }
  
  if (majorRank === '雀之气') {
    // 特例：雀之气三段（小段位在后面）
    const danNames = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return `${majorRank}${danNames[minorRank]}段`;
  } else {
    // 其他：三星大雀师（小段位在前面）
    const starNames = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return `${starNames[minorRank]}星${majorRank}`;
  }
};

// 获取大段位列表（用于筛选）
export const getMajorRanks = (): string[] => {
  const majorRanks = new Set<string>();
  rankConfigs.forEach(rank => {
    if (rank.majorRank) {
      majorRanks.add(rank.majorRank);
    }
  });
  return Array.from(majorRanks);
};

// 根据大段位获取该段位的所有配置
export const getRanksByMajorRank = (majorRank: string): RankConfig[] => {
  return rankConfigs.filter(rank => rank.majorRank === majorRank);
};

// 获取所有段位配置
export const getAllRanks = (): RankConfig[] => {
  return rankConfigs;
};

// 初始化一些测试数据
export async function initializeTestData() {
  // 只在开发环境创建测试账号
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    console.log('🚀 生产环境模式：跳过测试账号创建');
    return;
  }
  
  if (users.length === 0) {
    const bcrypt = await import('bcryptjs');
    
    // 创建测试用户（使用新的段位系统）
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminPoints = 3800; // 三星雀灵
    const adminRankInfo = parseRankInfo(adminPoints);
    await userDb.create({
      username: 'admin',
      passwordHash: adminPasswordHash,
      nickname: '系统管理员',
      avatar: '',
      totalPoints: adminPoints,
      rankLevel: adminRankInfo.displayName,
      rankPoints: 0,
      gamesPlayed: 0
    });

    const player1PasswordHash = await bcrypt.hash('player123', 10);
    const player1Points = 3600; // 一星雀灵
    const player1RankInfo = parseRankInfo(player1Points);
    await userDb.create({
      username: 'player1',
      passwordHash: player1PasswordHash,
      nickname: '麻将高手',
      avatar: '',
      totalPoints: player1Points,
      rankLevel: player1RankInfo.displayName,
      rankPoints: 0,
      gamesPlayed: 0
    });

    const player2PasswordHash = await bcrypt.hash('player123', 10);
    const player2Points = 1900; // 二星雀师
    const player2RankInfo = parseRankInfo(player2Points);
    await userDb.create({
      username: 'player2',
      passwordHash: player2PasswordHash,
      nickname: '新手玩家',
      avatar: '',
      totalPoints: player2Points,
      rankLevel: player2RankInfo.displayName,
      rankPoints: 0,
      gamesPlayed: 0
    });

    const player3PasswordHash = await bcrypt.hash('player123', 10);
    const player3Points = 250; // 雀之气三段
    const player3RankInfo = parseRankInfo(player3Points);
    await userDb.create({
      username: 'player3',
      passwordHash: player3PasswordHash,
      nickname: '中级玩家',
      avatar: '',
      totalPoints: player3Points,
      rankLevel: player3RankInfo.displayName,
      rankPoints: 0,
      gamesPlayed: 0
    });

    console.log('测试用户已创建（新段位系统）:');
    console.log(`- admin / admin123 - ${adminRankInfo.displayName}`);
    console.log(`- player1 / player123 - ${player1RankInfo.displayName}`);
    console.log(`- player2 / player123 - ${player2RankInfo.displayName}`);
    console.log(`- player3 / player123 - ${player3RankInfo.displayName}`);
  }
}