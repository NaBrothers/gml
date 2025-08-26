import express, { Request, Response } from 'express';
import { userDb, pointHistoryDb, parseRankInfo } from '../utils/database.js';
import { ApiResponse, RankingUser, PointHistory } from '../../shared/types.js';

const router = express.Router();

// 所有大段位列表
const majorRanks = ['雀之气', '雀者', '雀师', '大雀师', '雀灵', '雀王', '雀皇', '雀宗', '雀尊', '雀圣', '雀帝'];

// 获取积分排行榜
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, majorRank } = req.query;
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    let users = await userDb.findAll();
    
    // 按大段位筛选
    if (majorRank && typeof majorRank === 'string') {
      users = users.filter(user => {
        const rankInfo = parseRankInfo(user.stats.totalPoints);
        return rankInfo.majorRank === majorRank;
      });
    }
    
    // 按积分排序并更新段位显示
    const sortedUsers = users
      .sort((a, b) => b.stats.totalPoints - a.stats.totalPoints)
      .map((user, index) => {
        const rankInfo = parseRankInfo(user.stats.totalPoints);
        return {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          totalPoints: user.stats.totalPoints,
          rankLevel: rankInfo.rankConfig.rankOrder,
          gamesPlayed: user.stats.gamesPlayed,
          rank: index + 1
        };
      });

    // 分页
    const paginatedUsers = sortedUsers.slice(offsetNum, offsetNum + limitNum);

    const response: ApiResponse<{
      rankings: RankingUser[];
      total: number;
      majorRanks: string[];
    }> = {
      success: true,
      data: {
        rankings: paginatedUsers,
        total: users.length,
        majorRanks
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('获取排行榜失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取排行榜失败'
    };
    res.status(500).json(response);
  }
});

// 获取用户积分历史
router.get('/history/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit as string);

    const user = await userDb.findById(userId);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return res.status(404).json(response);
    }

    const history = await pointHistoryDb.findByUserId(userId);
    const limitedHistory = history.slice(0, limitNum);

    const response: ApiResponse<{
      user: typeof user;
      history: PointHistory[];
    }> = {
      success: true,
      data: {
        user,
        history: limitedHistory
      }
    };
    res.json(response);
  } catch (error) {
    console.error('获取用户积分历史失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户积分历史失败'
    };
    res.status(500).json(response);
  }
});

// 获取统计数据
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const users = await userDb.findAll();
    
    // 统计各段位人数
    const majorRankStats: { [key: string]: number } = {};
    const detailedRankStats: { [key: string]: number } = {};
    
    users.forEach(user => {
      const rankInfo = parseRankInfo(user.stats.totalPoints);
      majorRankStats[rankInfo.majorRank] = (majorRankStats[rankInfo.majorRank] || 0) + 1;
      detailedRankStats[rankInfo.displayName] = (detailedRankStats[rankInfo.displayName] || 0) + 1;
    });

    const totalUsers = users.length;
    const totalGames = users.reduce((sum, user) => sum + user.stats.gamesPlayed, 0);
    const averagePoints = totalUsers > 0 
      ? users.reduce((sum, user) => sum + user.stats.totalPoints, 0) / totalUsers 
      : 0;

    const response: ApiResponse<{
      majorRankStats: { [key: string]: number };
      detailedRankStats: { [key: string]: number };
      totalUsers: number;
      totalGames: number;
      averagePoints: number;
      majorRanks: string[];
    }> = {
      success: true,
      data: {
        majorRankStats,
        detailedRankStats,
        totalUsers,
        totalGames,
        averagePoints: Math.round(averagePoints),
        majorRanks
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('获取统计数据失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取统计数据失败'
    };
    res.status(500).json(response);
  }
});

export default router;