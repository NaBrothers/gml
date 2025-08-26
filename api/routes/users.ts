import express, { Request, Response } from 'express';
import { userDb, gamePlayerDb, pointHistoryDb, gameDb, calculateUserStats, calculateUserPointHistory } from '../utils/database.js';
import { ApiResponse, UserWithStats, PointHistory, GamePlayerDetail, GameRecord, UserRole } from '../../shared/types.js';
import { uploadAvatar, saveAvatarFile, deleteAvatarFile } from '../middleware/upload.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// 获取所有用户
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await userDb.findAll();
    const response: ApiResponse<{ users: UserWithStats[], total: number }> = {
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

    const response: ApiResponse<UserWithStats> = {
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

// 更新当前用户资料（支持头像上传）
router.put('/profile', authenticateToken, uploadAvatar, async (req: Request, res: Response) => {
  try {
    const { nickname } = req.body;
    const file = req.file;
    const userId = (req as any).user.userId;

    const user = await userDb.findById(userId);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return res.status(404).json(response);
    }

    let avatarPath = user.avatar;

    // 如果有新头像文件，处理文件上传
    if (file) {
      // 删除旧头像文件
      if (user.avatar) {
        await deleteAvatarFile(user.avatar);
      }
      
      // 保存新头像文件
      avatarPath = await saveAvatarFile(file.buffer, file.originalname, userId);
    }

    const updatedUser = await userDb.update(userId, {
      nickname: nickname || user.nickname,
      avatar: avatarPath
    });

    // 重新获取用户信息（包含统计数据）
    const userWithStats = await userDb.findById(userId);

    const response: ApiResponse<UserWithStats> = {
      success: true,
      data: userWithStats!,
      message: '用户资料更新成功'
    };
    res.json(response);
  } catch (error) {
    console.error('更新用户资料失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '更新用户资料失败'
    };
    res.status(500).json(response);
  }
});

// 管理员更新用户资料（支持头像上传）
router.put('/:id/profile', uploadAvatar, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nickname } = req.body;
    const file = req.file;

    const user = await userDb.findById(id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return res.status(404).json(response);
    }

    let avatarPath = user.avatar;

    // 如果有新头像文件，处理文件上传
    if (file) {
      // 删除旧头像文件
      if (user.avatar) {
        await deleteAvatarFile(user.avatar);
      }
      
      // 保存新头像文件
      avatarPath = await saveAvatarFile(file.buffer, file.originalname, id);
    }

    const updatedUser = await userDb.update(id, {
      nickname: nickname || user.nickname,
      avatar: avatarPath
    });

    // 重新获取用户信息（包含统计数据）
    const userWithStats = await userDb.findById(id);

    const response: ApiResponse<UserWithStats> = {
      success: true,
      data: userWithStats!,
      message: '用户资料更新成功'
    };
    res.json(response);
  } catch (error) {
    console.error('更新用户资料失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '更新用户资料失败'
    };
    res.status(500).json(response);
  }
});

// 更新用户信息
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await userDb.findById(id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return res.status(404).json(response);
    }

    const updatedUser = await userDb.update(id, updateData);
    
    // 重新获取用户信息（包含统计数据）
    const userWithStats = await userDb.findById(id);

    const response: ApiResponse<UserWithStats> = {
      success: true,
      data: userWithStats!,
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

    // 删除用户头像文件
    if (user.avatar) {
      await deleteAvatarFile(user.avatar);
    }

    const deleted = await userDb.delete(id);
    
    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        error: '删除用户失败'
      };
      return res.status(500).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: '用户删除成功'
    };
    res.json(response);
  } catch (error) {
    console.error('删除用户失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '删除用户失败'
    };
    res.status(500).json(response);
  }
});

// 获取用户历史记录（使用实时计算）
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

    // 获取用户的积分历史记录（实时计算）
    const pointHistories = calculateUserPointHistory(id);
    
    // 获取用户的对局记录
    const userGamePlayers = await gamePlayerDb.findByUserId(id);
    
    // 为每个对局获取详细信息和其他玩家信息
    const gameHistories = await Promise.all(
      userGamePlayers.map(async (gamePlayer) => {
        const game = await gameDb.findById(gamePlayer.id.split('_')[0]); // 从复合ID中提取gameId
        const allPlayers = await gamePlayerDb.findByGameId(gamePlayer.id.split('_')[0]);
        
        // 获取对应的积分历史记录
        const pointHistory = pointHistories.find(ph => ph.gameId === gamePlayer.id.split('_')[0]);
        
        return {
          game,
          gamePlayer,
          allPlayers,
          pointHistory,
          opponents: allPlayers.filter(p => p.userId !== id).map(p => p.user?.nickname || p.user?.username || '未知玩家')
        };
      })
    );
    
    // 按时间排序（最新的在前）
    gameHistories.sort((a, b) => new Date(b.game?.createdAt || 0).getTime() - new Date(a.game?.createdAt || 0).getTime());
    
    // 分页处理
    const paginatedHistories = gameHistories.slice(Number(offset), Number(offset) + Number(limit));
    
    // 计算统计数据（使用实时计算的用户统计）
    const userStats = calculateUserStats(id);
    const stats = {
      totalGames: userStats.gamesPlayed,
      wins: userStats.wins,
      averagePosition: userStats.averagePosition.toString(),
      totalPointsChange: userStats.totalPoints, // 总积分变化 = 当前积分 - 初始积分
      currentPoints: userStats.totalPoints,
      currentRank: userStats.rankLevel
    };
    
    // 准备图表数据（积分和段位变化）
    const chartData = {
      pointsHistory: pointHistories.map(ph => ({
        date: ph.gameDate,
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
      user: UserWithStats;
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

// 更新用户角色
router.put('/:id/role', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // 验证角色值
    if (!Object.values(UserRole).includes(role)) {
      const response: ApiResponse = {
        success: false,
        error: '无效的角色值'
      };
      return res.status(400).json(response);
    }

    const user = await userDb.findById(id);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return res.status(404).json(response);
    }

    const updatedUser = await userDb.update(id, { role });
    
    // 重新获取用户信息（包含统计数据）
    const userWithStats = await userDb.findById(id);

    const response: ApiResponse<UserWithStats> = {
      success: true,
      data: userWithStats!,
      message: '用户角色更新成功'
    };
    res.json(response);
  } catch (error) {
    console.error('更新用户角色失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '更新用户角色失败'
    };
    res.status(500).json(response);
  }
});

// 获取用户权限
router.get('/:id/permissions', async (req: Request, res: Response) => {
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

    // 根据用户角色返回权限
    const permissions = {
      canManageUsers: user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN,
      canManageGames: user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN,
      canViewAllData: user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN,
      canDeleteUsers: user.role === UserRole.SUPER_ADMIN,
      canChangeRoles: user.role === UserRole.SUPER_ADMIN
    };

    const response: ApiResponse<typeof permissions> = {
      success: true,
      data: permissions
    };
    res.json(response);
  } catch (error) {
    console.error('获取用户权限失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户权限失败'
    };
    res.status(500).json(response);
  }
});

export default router;