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
import { getUmaPoints, getBasePoints, getRanksConfig, getInitialPoints, getTotalPoints, getNewbieProtectionMaxRank } from './configManager.js';
import { 
  userFileStorage, 
  gameFileStorage,
  initializeDataFiles 
} from './fileStorage.js';
import { 
  getCachedUserStats, 
  getCachedUserPointHistory, 
  getCachedAllUserStats,
  invalidateCache
} from './pointsCache.js';
import { setPointsCacheInvalidator } from './configManager.js';
import { detectAllAchievements, calculateAchievementBonusPoints } from './achievementEngine.js';
import { getAchievementsConfig } from './configManager.js';

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
    
    // 设置配置变更时的缓存失效回调
    setPointsCacheInvalidator(invalidateCache);
    
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

// 段位配置数据 - 已迁移到配置文件
// 使用配置管理器动态获取段位配置
function getRankConfigs(): RankConfig[] {
  return getRanksConfig();
}

// 解析段位信息
export function parseRankInfo(points: number): RankInfo {
  const rankConfigs = getRankConfigs();
  
  // 如果配置为空，使用默认配置
  if (!rankConfigs || rankConfigs.length === 0) {
    console.warn('段位配置为空，使用默认配置');
    const defaultConfig: RankConfig = {
      id: 1,
      rankName: '雀之气一段',
      minPoints: 0,
      maxPoints: 99999,
      promotionBonus: 0,
      demotionPenalty: 0,
      rankOrder: 1,
      majorRank: '雀之气',
      minorRankType: 'dan',
      minorRankRange: [1, 9]
    };
    
    return {
      majorRank: defaultConfig.majorRank,
      minorRank: 0,
      minorRankType: defaultConfig.minorRankType,
      displayName: defaultConfig.rankName,
      rankConfig: defaultConfig
    };
  }
  
  const rankConfig = rankConfigs.find(config =>
    points >= config.minPoints && points <= config.maxPoints
  ) || rankConfigs[0];

  return {
    majorRank: rankConfig.majorRank,
    minorRank: 0, // 简化版本暂不使用小段位
    minorRankType: rankConfig.minorRankType,
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
  const expectedTotal = getTotalPoints();
  if (totalScore !== expectedTotal) {
    throw new Error(`四人总分必须为${expectedTotal}点`);
  }

  // 创建玩家数据并排序
  const players = scores.map((score, index) => ({ score, index }));
  players.sort((a, b) => b.score - a.score);

  // 计算每个玩家的积分
  const results: MahjongCalculation[] = new Array(4);
  
  players.forEach((player, position) => {
// 计算原点和马点
    const basePoints = getBasePoints();
    const umaPoints = getUmaPoints();
    
    const rawPoints = (player.score - basePoints) / 1000;
    const umaPointsValue = umaPoints[position];
    const rankPoints = Math.ceil(rawPoints + umaPointsValue);
    
    results[player.index] = {
      finalScore: player.score,
      rawPoints: parseFloat(rawPoints.toFixed(1)),
      umaPoints: umaPointsValue,
      rankPoints,
      position: position + 1
    };
  });

  return results;
}

// 计算麻将积分（带新手保护）- 专门用于单个游戏的成就计算
export function calculateMahjongPointsWithProtectionForGame(scores: number[], playerIds: string[], previousGames: GameRecord[] = []): MahjongCalculation[] {
  // 验证总分
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const expectedTotal = getTotalPoints();
  if (totalScore !== expectedTotal) {
    throw new Error(`四人总分必须为${expectedTotal}点`);
  }

  // 验证玩家ID数量
  if (playerIds.length !== 4) {
    throw new Error('必须提供4个玩家ID');
  }

  // 创建玩家数据并排序
  const players = scores.map((score, index) => ({ score, index, playerId: playerIds[index] }));
  players.sort((a, b) => b.score - a.score);

  // 计算每个玩家的积分
  const results: MahjongCalculation[] = new Array(4);
  
  players.forEach((player, position) => {
    // 计算原点和马点
    const basePoints = getBasePoints();
    const umaPoints = getUmaPoints();
    
    const rawPoints = (player.score - basePoints) / 1000;
    const umaPointsValue = umaPoints[position];
    const originalRankPoints = Math.ceil(rawPoints + umaPointsValue);
    let rankPoints = originalRankPoints;
    let isNewbieProtected = false;
    
    // 新手保护逻辑：检查玩家当前段位
    const user = users.find(u => u.id === player.playerId);
    if (user) {
      // 计算玩家当前积分（不包括本局）
      const currentPoints = calculateUserCurrentPoints(player.playerId);
      const rankInfo = parseRankInfo(currentPoints);
      const newbieProtectionMaxRank = getNewbieProtectionMaxRank();
      
      // 如果玩家在新手保护范围内且积分为负，则设为0
      if (rankInfo.rankConfig.rankOrder <= newbieProtectionMaxRank && originalRankPoints < 0) {
        rankPoints = 0;
        isNewbieProtected = true;
      }
    }
    
    // 成就检测 - 只使用之前的游戏历史
    let achievements: any[] = [];
    let achievementBonusPoints = 0;

    try {
      // 获取成就配置
      const achievementConfig = getAchievementsConfig();
      
      if (achievementConfig.enabled) {
        // 获取玩家历史记录用于连胜/连败检测 - 只使用之前的游戏
        const playerHistory = previousGames
          .filter(game => game.players.some(p => p.userId === player.playerId))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map(game => {
            const playerInGame = game.players.find(p => p.userId === player.playerId);
            return {
              gameId: game.id,
              position: playerInGame?.position || 4,
              finalScore: playerInGame?.finalScore || 0,
              gameDate: game.createdAt
            };
          });

        // 检测成就
        achievements = detectAllAchievements(
          player.score,
          position + 1,
          scores,
          playerHistory
        );

        // 计算成就奖励积分
        achievementBonusPoints = calculateAchievementBonusPoints(achievements);
        
        // 将成就奖励加入到最终积分中
        rankPoints += achievementBonusPoints;
        
        console.log(`[成就检测-单游戏] 玩家 ${player.playerId}, 得分: ${player.score}, 位置: ${position + 1}, 历史游戏数: ${playerHistory.length}, 检测到成就数量: ${achievements.length}`);
        if (achievements.length > 0) {
          console.log(`[成就检测-单游戏] 获得成就:`, achievements.map(a => a.achievementName));
        }
      }
    } catch (error) {
      console.warn(`成就检测失败，玩家 ${player.playerId}:`, error.message);
    }
    
    results[player.index] = {
      finalScore: player.score,
      rawPoints: parseFloat(rawPoints.toFixed(1)),
      umaPoints: umaPointsValue,
      rankPoints,
      originalRankPoints,
      isNewbieProtected,
      position: position + 1,
      // 添加成就信息
      achievements,
      achievementBonusPoints
    };
  });

  return results;
}

// 计算麻将积分（带新手保护）- 保留原有函数用于兼容性
export function calculateMahjongPointsWithProtection(scores: number[], playerIds: string[]): MahjongCalculation[] {
  // 对于新创建的游戏，使用所有现有游戏作为历史
  return calculateMahjongPointsWithProtectionForGame(scores, playerIds, games);
}

// 计算用户当前积分（不包括正在进行的对局）
function calculateUserCurrentPoints(userId: string): number {
  const userGames = games.filter(game => 
    game.players.some(player => player.userId === userId)
  );

  let totalPointsChange = 0;
  userGames.forEach(game => {
    const userPlayer = game.players.find(player => player.userId === userId);
    if (userPlayer) {
      try {
        // 使用原始计算方法（不带保护）来计算历史积分
        const calculation = calculateMahjongPoints(
          game.players.map(p => p.finalScore)
        );
        const userCalc = calculation.find((_, index) => 
          game.players[index].userId === userId
        );
        
        if (userCalc) {
          totalPointsChange += userCalc.rankPoints;
        }
      } catch (error) {
        // 如果历史对局数据不符合当前配置，跳过这局
        console.warn(`跳过不符合当前配置的历史对局 ${game.id}:`, error.message);
      }
    }
  });

  return getInitialPoints() + totalPointsChange;
}

// 计算用户统计信息（使用缓存系统）
export async function calculateUserStats(userId: string): Promise<UserStats> {
  return await getCachedUserStats(userId, users, games);
}

// 计算用户积分历史（使用缓存系统）
export async function calculateUserPointHistory(userId: string): Promise<PointHistory[]> {
  return await getCachedUserPointHistory(userId, users, games);
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
    const allUserStats = await getCachedAllUserStats(users, games);
    
    return users.map(user => {
      const stats = allUserStats.get(user.id) || {
        totalPoints: getInitialPoints(),
        rankLevel: 16,
        rankPoints: 0,
        gamesPlayed: 0,
        wins: 0,
        averagePosition: 0,
        currentRank: '四段'
      };
      
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
    
    const stats = await calculateUserStats(user.id);
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
    
    const stats = await calculateUserStats(user.id);
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
      createdAt: new Date().toISOString(),
      ...gameData
    };
    
    games.push(game);
    await gameFileStorage.save(games);
    
    // 新增对局后，清空积分缓存
    invalidateCache();
    
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
  },

  async delete(id: string): Promise<boolean> {
    await loadAllData();
    const gameIndex = games.findIndex(game => game.id === id);
    
    if (gameIndex === -1) {
      return false;
    }
    
    games.splice(gameIndex, 1);
    await gameFileStorage.save(games);
    
    // 删除对局后，清空积分缓存
    invalidateCache();
    
    return true;
  }
};

// 计算用户在特定时间点之前的积分
function calculateUserPointsBeforeGame(userId: string, gameDate: string): number {
  const userGames = games.filter(game => 
    game.players.some(player => player.userId === userId) &&
    new Date(game.createdAt).getTime() < new Date(gameDate).getTime()
  );

  let totalPointsChange = 0;
  userGames.forEach(game => {
    const userPlayer = game.players.find(player => player.userId === userId);
    if (userPlayer) {
      try {
        // 使用原始计算方法（不带保护）来计算历史积分
        const calculation = calculateMahjongPoints(
          game.players.map(p => p.finalScore)
        );
        const userCalc = calculation.find((_, index) => 
          game.players[index].userId === userId
        );
        
        if (userCalc) {
          totalPointsChange += userCalc.rankPoints;
        }
      } catch (error) {
        // 如果历史对局数据不符合当前配置，跳过这局
        console.warn(`跳过不符合当前配置的历史对局 ${game.id}:`, error.message);
      }
    }
  });

  return getInitialPoints() + totalPointsChange;
}

// 兼容性函数（为了向后兼容）
export const gamePlayerDb = {
  async findByGameId(gameId: string): Promise<GamePlayerDetail[]> {
    const game = games.find(g => g.id === gameId);
    if (!game) return [];

    try {
      // 获取当前游戏在时间序列中的位置
      const sortedGames = [...games].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      const currentGameIndex = sortedGames.findIndex(g => g.id === gameId);
      const previousGames = sortedGames.slice(0, currentGameIndex);

      // 使用带新手保护的计算方法，但只传入之前的游戏用于成就检测
      const calculations = calculateMahjongPointsWithProtectionForGame(
        game.players.map(p => p.finalScore),
        game.players.map(p => p.userId),
        previousGames
      );

      return game.players.map((player, index) => {
        const user = users.find(u => u.id === player.userId);
        const calc = calculations[index];
        
        // 计算该玩家在这场比赛之前的积分和段位
        const pointsBefore = calculateUserPointsBeforeGame(player.userId, game.createdAt);
        const pointsAfter = pointsBefore + calc.rankPoints;
        const rankBefore = parseRankInfo(pointsBefore).displayName;
        const rankAfter = parseRankInfo(pointsAfter).displayName;
        
        return {
          ...player,
          id: `${gameId}_${player.userId}`,
          user,
          rawPoints: calc.rawPoints,
          umaPoints: calc.umaPoints,
          rankPointsChange: calc.rankPoints,
          originalRankPointsChange: calc.originalRankPoints,
          isNewbieProtected: calc.isNewbieProtected,
          pointsBefore,
          pointsAfter,
          rankBefore,
          rankAfter,
          // 添加成就信息
          achievements: calc.achievements || [],
          achievementBonusPoints: calc.achievementBonusPoints || 0
        };
      });
    } catch (error) {
      // 如果历史对局数据不符合当前配置，返回基础信息但不计算积分变化
      console.warn(`跳过不符合当前配置的历史对局 ${gameId}:`, error.message);
      
      return game.players.map((player) => {
        const user = users.find(u => u.id === player.userId);
        
        return {
          ...player,
          id: `${gameId}_${player.userId}`,
          user,
          rawPoints: 0,
          umaPoints: 0,
          rankPointsChange: 0,
          originalRankPointsChange: 0,
          isNewbieProtected: false,
          achievements: [],
          achievementBonusPoints: 0
        };
      });
    }
  },

  async findByUserId(userId: string): Promise<GamePlayerDetail[]> {
    await loadAllData();
    const userGames = games.filter(game => 
      game.players.some(player => player.userId === userId)
    );

    const result: GamePlayerDetail[] = [];
    
    for (const game of userGames) {
      try {
        // 使用带新手保护的计算方法
        const calculations = calculateMahjongPointsWithProtection(
          game.players.map(p => p.finalScore),
          game.players.map(p => p.userId)
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
            rankPointsChange: calc.rankPoints,
            originalRankPointsChange: calc.originalRankPoints,
            isNewbieProtected: calc.isNewbieProtected
          });
        }
      } catch (error) {
        // 如果历史对局数据不符合当前配置，返回基础信息但不计算积分变化
        console.warn(`跳过不符合当前配置的历史对局 ${game.id}:`, error.message);
        
        const playerIndex = game.players.findIndex(p => p.userId === userId);
        if (playerIndex !== -1) {
          const player = game.players[playerIndex];
          const user = users.find(u => u.id === player.userId);
          
          result.push({
            ...player,
            id: `${game.id}_${player.userId}`,
            user,
            rawPoints: 0,
            umaPoints: 0,
            rankPointsChange: 0,
            originalRankPointsChange: 0,
            isNewbieProtected: false
          });
        }
      }
    }

    return result;
  }
};

// 积分历史数据库操作（兼容性）
export const pointHistoryDb = {
  async findByUserId(userId: string): Promise<PointHistory[]> {
    return await calculateUserPointHistory(userId);
  }
};

// 兼容性类型别名
export type Game = GameRecord;
export type GamePlayer = GamePlayerDetail;