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
  // 新人
  { id: 1, rankName: '新人1', minPoints: 0, maxPoints: 19, promotionBonus: 0, demotionPenalty: 0, rankOrder: 1, majorRank: '新人', minorRankType: 'dan', minorRankRange: [1, 3] },
  { id: 2, rankName: '新人2', minPoints: 20, maxPoints: 39, promotionBonus: 0, demotionPenalty: 0, rankOrder: 2, majorRank: '新人', minorRankType: 'dan', minorRankRange: [1, 3] },
  { id: 3, rankName: '新人3', minPoints: 40, maxPoints: 59, promotionBonus: 0, demotionPenalty: 0, rankOrder: 3, majorRank: '新人', minorRankType: 'dan', minorRankRange: [1, 3] },
  
  // 9级到1级
  { id: 4, rankName: '9级', minPoints: 60, maxPoints: 79, promotionBonus: 0, demotionPenalty: 0, rankOrder: 4, majorRank: '9级', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 5, rankName: '8级', minPoints: 80, maxPoints: 99, promotionBonus: 0, demotionPenalty: 0, rankOrder: 5, majorRank: '8级', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 6, rankName: '7级', minPoints: 100, maxPoints: 119, promotionBonus: 0, demotionPenalty: 0, rankOrder: 6, majorRank: '7级', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 7, rankName: '6级', minPoints: 120, maxPoints: 139, promotionBonus: 0, demotionPenalty: 0, rankOrder: 7, majorRank: '6级', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 8, rankName: '5级', minPoints: 140, maxPoints: 159, promotionBonus: 0, demotionPenalty: 0, rankOrder: 8, majorRank: '5级', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 9, rankName: '4级', minPoints: 160, maxPoints: 179, promotionBonus: 0, demotionPenalty: 0, rankOrder: 9, majorRank: '4级', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 10, rankName: '3级', minPoints: 180, maxPoints: 199, promotionBonus: 0, demotionPenalty: 0, rankOrder: 10, majorRank: '3级', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 11, rankName: '2级', minPoints: 200, maxPoints: 219, promotionBonus: 0, demotionPenalty: 0, rankOrder: 11, majorRank: '2级', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 12, rankName: '1级', minPoints: 220, maxPoints: 239, promotionBonus: 0, demotionPenalty: 0, rankOrder: 12, majorRank: '1级', minorRankType: 'none', minorRankRange: [0, 0] },
  
  // 初段到十段
  { id: 13, rankName: '初段', minPoints: 240, maxPoints: 399, promotionBonus: 0, demotionPenalty: 0, rankOrder: 13, majorRank: '初段', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 14, rankName: '二段', minPoints: 400, maxPoints: 799, promotionBonus: 0, demotionPenalty: 0, rankOrder: 14, majorRank: '二段', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 15, rankName: '三段', minPoints: 800, maxPoints: 1199, promotionBonus: 0, demotionPenalty: 0, rankOrder: 15, majorRank: '三段', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 16, rankName: '四段', minPoints: 1200, maxPoints: 1599, promotionBonus: 0, demotionPenalty: 0, rankOrder: 16, majorRank: '四段', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 17, rankName: '五段', minPoints: 1600, maxPoints: 1999, promotionBonus: 0, demotionPenalty: 0, rankOrder: 17, majorRank: '五段', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 18, rankName: '六段', minPoints: 2000, maxPoints: 2399, promotionBonus: 0, demotionPenalty: 0, rankOrder: 18, majorRank: '六段', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 19, rankName: '七段', minPoints: 2400, maxPoints: 2799, promotionBonus: 0, demotionPenalty: 0, rankOrder: 19, majorRank: '七段', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 20, rankName: '八段', minPoints: 2800, maxPoints: 3199, promotionBonus: 0, demotionPenalty: 0, rankOrder: 20, majorRank: '八段', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 21, rankName: '九段', minPoints: 3200, maxPoints: 3599, promotionBonus: 0, demotionPenalty: 0, rankOrder: 21, majorRank: '九段', minorRankType: 'none', minorRankRange: [0, 0] },
  { id: 22, rankName: '十段', minPoints: 3600, maxPoints: 9999999, promotionBonus: 0, demotionPenalty: 0, rankOrder: 22, majorRank: '十段', minorRankType: 'none', minorRankRange: [0, 0] }
];

// 解析段位信息
export function parseRankInfo(points: number): RankInfo {
  const rankConfig = RANK_CONFIGS.find(config => 
    points >= config.minPoints && points <= config.maxPoints
  ) || RANK_CONFIGS[0];

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
      rankLevel: 16,
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
    return users.map(user => ({
      ...user,
      stats: calculateUserStats(user.id)
    }));
  },

  async findById(id: string): Promise<UserWithStats | null> {
    await loadAllData();
    const user = users.find(user => user.id === id);
    if (!user) return null;
    
    return {
      ...user,
      stats: calculateUserStats(user.id)
    };
  },

  async findByUsername(username: string): Promise<UserWithStats | null> {
    await loadAllData();
    const user = users.find(user => user.username === username);
    if (!user) return null;
    
    return {
      ...user,
      stats: calculateUserStats(user.id)
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