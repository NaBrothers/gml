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
import { getUmaPoints, getBasePoints, getRanksConfig, getInitialPoints, getTotalPoints } from './configManager.js';
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

// 计算用户统计信息（实时计算）
export function calculateUserStats(userId: string): UserStats {
  // 获取用户参与的所有对局
  const userGames = games.filter(game => 
    game.players.some(player => player.userId === userId)
  );

  if (userGames.length === 0) {
    const initialPoints = getInitialPoints();
    return {
      totalPoints: initialPoints, // 初始积分
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
      try {
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
      } catch (error) {
        // 如果历史对局数据不符合当前配置，跳过这局但记录警告
        console.warn(`跳过不符合当前配置的历史对局 ${game.id}:`, error.message);
        // 仍然计算位置统计，但不计算积分变化
        totalPosition += userPlayer.position;
        if (userPlayer.position === 1) wins++;
      }
    }
  });

  const totalPoints = getInitialPoints() + totalPointsChange; // 初始积分 + 积分变化
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
  let currentPoints = getInitialPoints(); // 初始积分

  userGames.forEach(game => {
    const userPlayer = game.players.find(player => player.userId === userId);
    if (userPlayer) {
      try {
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
      } catch (error) {
        // 如果历史对局数据不符合当前配置，跳过这局但记录警告
        console.warn(`跳过不符合当前配置的历史对局 ${game.id}:`, error.message);
        // 不添加到历史记录中，但保持积分不变
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
    const game = games.find(g => g.id === gameId);
    if (!game) return [];

    try {
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
          rankPointsChange: 0
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