// 积分缓存管理模块
import crypto from 'crypto';
import { 
  User, 
  UserStats, 
  GameRecord, 
  PointHistory, 
  MahjongCalculation 
} from '../../shared/types.js';
import { 
  getInitialPoints, 
  getNewbieProtectionMaxRank,
  getUmaPoints,
  getBasePoints,
  getTotalPoints,
  getRanksConfig
} from './configManager.js';

// 缓存接口定义
interface PointsCache {
  userStats: Map<string, UserStats>;
  pointHistories: Map<string, PointHistory[]>;
  lastCalculated: number;
  configHash: string;
  isValid: boolean;
}

// 全局缓存实例
let globalCache: PointsCache = {
  userStats: new Map(),
  pointHistories: new Map(),
  lastCalculated: 0,
  configHash: '',
  isValid: false
};

// 计算锁，防止并发计算
let isCalculating = false;
let calculationPromise: Promise<any> | null = null;

// 计算配置哈希值，用于检测配置变更
function calculateConfigHash(): string {
  const config = {
    initialPoints: getInitialPoints(),
    newbieProtectionMaxRank: getNewbieProtectionMaxRank(),
    umaPoints: getUmaPoints(),
    basePoints: getBasePoints(),
    totalPoints: getTotalPoints(),
    ranks: getRanksConfig()
  };
  
  return crypto.createHash('md5')
    .update(JSON.stringify(config))
    .digest('hex');
}

// 检查缓存是否有效
function isCacheValid(): boolean {
  if (!globalCache.isValid) return false;
  
  const currentConfigHash = calculateConfigHash();
  return globalCache.configHash === currentConfigHash;
}

// 清空缓存
export function invalidateCache(): void {
  globalCache.userStats.clear();
  globalCache.pointHistories.clear();
  globalCache.isValid = false;
  globalCache.lastCalculated = 0;
  
  // 重置计算状态
  isCalculating = false;
  calculationPromise = null;
  
  console.log('积分缓存已失效');
}

// 解析段位信息（内部函数）
function parseRankInfo(points: number) {
  const rankConfigs = getRanksConfig();
  
  if (!rankConfigs || rankConfigs.length === 0) {
    console.warn('段位配置为空，使用默认配置');
    const defaultConfig = {
      id: 1,
      rankName: '雀之气一段',
      minPoints: 0,
      maxPoints: 99999,
      promotionBonus: 0,
      demotionPenalty: 0,
      rankOrder: 1,
      majorRank: '雀之气',
      minorRankType: 'dan' as const,
      minorRankRange: [1, 9] as [number, number]
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
    minorRank: 0,
    minorRankType: rankConfig.minorRankType,
    displayName: rankConfig.rankName,
    rankConfig
  };
}

// 计算单局积分（带新手保护）
function calculateGamePointsWithProtection(
  scores: number[], 
  playerIds: string[], 
  playerCurrentPoints: Map<string, number>
): MahjongCalculation[] {
  // 验证总分
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const expectedTotal = getTotalPoints();
  if (totalScore !== expectedTotal) {
    throw new Error(`四人总分必须为${expectedTotal}点`);
  }

  // 创建玩家数据并排序
  const players = scores.map((score, index) => ({ 
    score, 
    index, 
    playerId: playerIds[index] 
  }));
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
    
    // 新手保护逻辑：检查玩家比赛前的段位
    const currentPoints = playerCurrentPoints.get(player.playerId) || getInitialPoints();
    const rankInfo = parseRankInfo(currentPoints);
    const newbieProtectionMaxRank = getNewbieProtectionMaxRank();
    
    // 如果玩家在新手保护范围内且积分为负，则设为0
    if (rankInfo.rankConfig.rankOrder <= newbieProtectionMaxRank && originalRankPoints < 0) {
      rankPoints = 0;
      isNewbieProtected = true;
    }
    
    results[player.index] = {
      finalScore: player.score,
      rawPoints: parseFloat(rawPoints.toFixed(1)),
      umaPoints: umaPointsValue,
      rankPoints,
      originalRankPoints,
      isNewbieProtected,
      position: position + 1
    };
  });

  return results;
}

// 全局积分计算函数（按时间顺序应用新手保护）
export async function calculateAllUsersPointsWithProtection(
  users: User[], 
  games: GameRecord[]
): Promise<{ userStats: Map<string, UserStats>, pointHistories: Map<string, PointHistory[]> }> {
  
  // 检查缓存是否有效
  if (isCacheValid()) {
    console.log('使用缓存的积分数据');
    return {
      userStats: globalCache.userStats,
      pointHistories: globalCache.pointHistories
    };
  }

  // 并发控制：如果正在计算，等待计算完成
  if (isCalculating && calculationPromise) {
    console.log('等待正在进行的积分计算完成');
    return await calculationPromise;
  }

  // 开始计算
  isCalculating = true;
  calculationPromise = performCalculation(users, games);
  
  try {
    const result = await calculationPromise;
    return result;
  } finally {
    isCalculating = false;
    calculationPromise = null;
  }
}

// 执行实际的积分计算
async function performCalculation(
  users: User[], 
  games: GameRecord[]
): Promise<{ userStats: Map<string, UserStats>, pointHistories: Map<string, PointHistory[]> }> {
  
  console.log('重新计算所有用户积分（应用新手保护）');
  
  // 初始化所有用户积分
  const userCurrentPoints = new Map<string, number>();
  const userStats = new Map<string, UserStats>();
  const pointHistories = new Map<string, PointHistory[]>();
  
  const initialPoints = getInitialPoints();
  
  // 为所有用户初始化积分和统计
  users.forEach(user => {
    userCurrentPoints.set(user.id, initialPoints);
    pointHistories.set(user.id, []);
  });

  // 按时间排序所有对局
  const sortedGames = [...games].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // 分批处理对局，避免内存占用过大
  const batchSize = 100;
  for (let i = 0; i < sortedGames.length; i += batchSize) {
    const batch = sortedGames.slice(i, i + batchSize);
    
    // 处理这批对局
    batch.forEach(game => {
      try {
        // 获取参与这场对局的玩家ID
        const playerIds = game.players.map(p => p.userId);
        const scores = game.players.map(p => p.finalScore);
        
        // 计算这局的积分变化（应用新手保护）
        const calculations = calculateGamePointsWithProtection(
          scores, 
          playerIds, 
          userCurrentPoints
        );
        
        // 应用积分变化到每个玩家
        game.players.forEach((player, index) => {
          const calc = calculations[index];
          const pointsBefore = userCurrentPoints.get(player.userId) || initialPoints;
          const pointsAfter = pointsBefore + calc.rankPoints;
          
          // 更新玩家当前积分
          userCurrentPoints.set(player.userId, pointsAfter);
          
          // 添加到积分历史
          const history = pointHistories.get(player.userId) || [];
          
          // 获取对手信息
          const opponents = game.players
            .filter(p => p.userId !== player.userId)
            .map(p => {
              const user = users.find(u => u.id === p.userId);
              return user?.nickname || user?.username || '未知玩家';
            });

          history.push({
            gameId: game.id,
            pointsBefore,
            pointsAfter,
            pointsChange: calc.rankPoints,
            originalPointsChange: calc.originalRankPoints,
            isNewbieProtected: calc.isNewbieProtected,
            rankBefore: parseRankInfo(pointsBefore).displayName,
            rankAfter: parseRankInfo(pointsAfter).displayName,
            gameDate: game.createdAt,
            opponents
          });
          
          pointHistories.set(player.userId, history);
        });
        
      } catch (error) {
        console.warn(`跳过不符合当前配置的历史对局 ${game.id}:`, error.message);
      }
    });
    
    // 每处理一批后，让出控制权，避免阻塞事件循环
    if (i + batchSize < sortedGames.length) {
      await new Promise(resolve => setImmediate(resolve));
    }
  }

  // 计算最终用户统计
  users.forEach(user => {
    const finalPoints = userCurrentPoints.get(user.id) || initialPoints;
    const userGames = games.filter(game => 
      game.players.some(player => player.userId === user.id)
    );
    
    // 计算统计数据
    let wins = 0;
    let totalPosition = 0;
    
    userGames.forEach(game => {
      const userPlayer = game.players.find(player => player.userId === user.id);
      if (userPlayer) {
        totalPosition += userPlayer.position;
        if (userPlayer.position === 1) wins++;
      }
    });
    
    const rankInfo = parseRankInfo(finalPoints);
    const averagePosition = userGames.length > 0 ? totalPosition / userGames.length : 0;
    
    const stats: UserStats = {
      totalPoints: finalPoints,
      rankLevel: rankInfo.rankConfig.rankOrder,
      rankPoints: finalPoints - rankInfo.rankConfig.minPoints,
      gamesPlayed: userGames.length,
      wins,
      averagePosition: parseFloat(averagePosition.toFixed(2)),
      currentRank: rankInfo.displayName
    };
    
    userStats.set(user.id, stats);
  });

  // 更新缓存
  globalCache.userStats = userStats;
  globalCache.pointHistories = pointHistories;
  globalCache.lastCalculated = Date.now();
  globalCache.configHash = calculateConfigHash();
  globalCache.isValid = true;
  
  console.log(`积分计算完成，处理了 ${users.length} 个用户，${sortedGames.length} 场对局`);
  
  return { userStats, pointHistories };
}

// 获取用户统计（使用缓存）
export async function getCachedUserStats(
  userId: string, 
  users: User[], 
  games: GameRecord[]
): Promise<UserStats> {
  const { userStats } = await calculateAllUsersPointsWithProtection(users, games);
  
  const stats = userStats.get(userId);
  if (stats) {
    return stats;
  }
  
  // 如果用户不存在，返回默认统计
  const initialPoints = getInitialPoints();
  return {
    totalPoints: initialPoints,
    rankLevel: 16,
    rankPoints: 0,
    gamesPlayed: 0,
    wins: 0,
    averagePosition: 0,
    currentRank: '四段'
  };
}

// 获取用户积分历史（使用缓存）
export async function getCachedUserPointHistory(
  userId: string, 
  users: User[], 
  games: GameRecord[]
): Promise<PointHistory[]> {
  const { pointHistories } = await calculateAllUsersPointsWithProtection(users, games);
  return pointHistories.get(userId) || [];
}

// 获取所有用户统计（使用缓存）
export async function getCachedAllUserStats(
  users: User[], 
  games: GameRecord[]
): Promise<Map<string, UserStats>> {
  const { userStats } = await calculateAllUsersPointsWithProtection(users, games);
  return userStats;
}