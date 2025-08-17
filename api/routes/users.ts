import express, { Request, Response } from 'express';
import { userDb, gamePlayerDb, pointHistoryDb, gameDb, initializeTestData } from '../utils/database.js';
import { ApiResponse, User, PointHistory, GamePlayer, Game } from '../../shared/types.js';

const router = express.Router();

// 初始化测试数据
initializeTestData();

// 获取所有用户
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await userDb.findAll();
    const response: ApiResponse<{ users: User[], total: number }> = {
      success: true,
      data: {
        users,
        total: users.length
      }
    };
    res.json(response);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户列表失败'
    };
    res.status(500).json(response);
  }
});

// 根据ID获取用户
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userDb.findById(id);
    
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<User> = {
      success: true,
      data: user
    };
    res.json(response);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户信息失败'
    };
    res.status(500).json(response);
  }
});

// 更新用户信息
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nickname, avatar } = req.body;

    const user = await userDb.findById(id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return res.status(404).json(response);
    }

    const updatedUser = await userDb.update(id, {
      nickname: nickname || user.nickname,
      avatar: avatar || user.avatar
    });

    const response: ApiResponse<User> = {
      success: true,
      data: updatedUser!,
      message: '用户信息更新成功'
    };
    res.json(response);
  } catch (error) {
    console.error('更新用户信息失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '更新用户信息失败'
    };
    res.status(500).json(response);
  }
});

// 删除用户
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await userDb.findById(id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return res.status(404).json(response);
    }

    const deleted = await userDb.delete(id);
    if (deleted) {
      const response: ApiResponse = {
        success: true,
        message: '用户删除成功'
      };
      res.json(response);
    } else {
      const response: ApiResponse = {
        success: false,
        error: '删除用户失败'
      };
      res.status(500).json(response);
    }
  } catch (error) {
    console.error('删除用户失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '删除用户失败'
    };
    res.status(500).json(response);
  }
});

// 获取用户历史记录
router.get('/:id/history', async (req: Request, res: Response) => {
  console.log(`[DEBUG] 收到历史记录请求: userId=${req.params.id}`);
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // 验证用户是否存在
    const user = await userDb.findById(id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return res.status(404).json(response);
    }

    // 获取用户的积分历史记录
    const pointHistories = await pointHistoryDb.findByUserId(id);
    
    // 获取用户的对局记录
    const userGamePlayers = await gamePlayerDb.findByUserId(id);
    
    // 为每个对局获取详细信息和其他玩家信息
    const gameHistories = await Promise.all(
      userGamePlayers.map(async (gamePlayer) => {
        const game = await gameDb.findById(gamePlayer.gameId);
        const allPlayers = await gamePlayerDb.findByGameId(gamePlayer.gameId);
        
        // 获取其他玩家的用户信息
        const playersWithUsers = await Promise.all(
          allPlayers.map(async (player) => {
            const playerUser = await userDb.findById(player.userId);
            return {
              ...player,
              user: playerUser
            };
          })
        );
        
        // 获取对应的积分历史记录
        const pointHistory = pointHistories.find(ph => ph.gameId === gamePlayer.gameId);
        
        return {
          game,
          gamePlayer,
          allPlayers: playersWithUsers,
          pointHistory,
          opponents: playersWithUsers.filter(p => p.userId !== id).map(p => p.user?.nickname || p.user?.username || '未知玩家')
        };
      })
    );
    
    // 按时间排序（最新的在前）
    gameHistories.sort((a, b) => new Date(b.game?.createdAt || 0).getTime() - new Date(a.game?.createdAt || 0).getTime());
    
    // 分页处理
    const paginatedHistories = gameHistories.slice(Number(offset), Number(offset) + Number(limit));
    
    // 计算统计数据
    const stats = {
      totalGames: gameHistories.length,
      wins: gameHistories.filter(h => h.gamePlayer.position === 1).length,
      averagePosition: gameHistories.length > 0 
        ? (gameHistories.reduce((sum, h) => sum + h.gamePlayer.position, 0) / gameHistories.length).toFixed(2)
        : '0.00',
      totalPointsChange: pointHistories.reduce((sum, ph) => sum + ph.pointsChange, 0),
      currentPoints: user.totalPoints,
      currentRank: user.rankLevel
    };
    
    // 准备图表数据（积分和段位变化）
    const chartData = {
      pointsHistory: pointHistories.map(ph => ({
        date: ph.createdAt,
        pointsBefore: ph.pointsBefore,
        pointsAfter: ph.pointsAfter,
        pointsChange: ph.pointsChange,
        rankBefore: ph.rankBefore,
        rankAfter: ph.rankAfter
      })).reverse(), // 按时间正序排列用于图表
      gameResults: gameHistories.map(gh => ({
        date: gh.game?.createdAt,
        position: gh.gamePlayer.position,
        pointsChange: gh.pointHistory?.pointsChange || 0,
        finalScore: gh.gamePlayer.finalScore
      })).reverse()
    };

    const response: ApiResponse<{
      user: User;
      histories: typeof paginatedHistories;
      stats: typeof stats;
      chartData: typeof chartData;
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }> = {
      success: true,
      data: {
        user,
        histories: paginatedHistories,
        stats,
        chartData,
        pagination: {
          total: gameHistories.length,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < gameHistories.length
        }
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('获取用户历史记录失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户历史记录失败'
    };
    res.status(500).json(response);
  }
});

export default router;