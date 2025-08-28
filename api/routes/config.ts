import express, { Request, Response } from 'express';
import { ConfigManager } from '../utils/configManager.js';
import { ApiResponse, UserRole } from '../../shared/types.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// 中间件：验证超级管理员权限
const requireSuperAdmin = (req: any, res: Response, next: any) => {
  if (!req.user || req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({
      success: false,
      error: '需要超级管理员权限'
    } as ApiResponse);
  }
  next();
};

// 公开获取段位配置（不需要认证）
router.get('/public/ranks', async (req: Request, res: Response) => {
  try {
    // 检查并自动重新加载配置
    await ConfigManager.checkAndReload();
    
    const config = ConfigManager.getRanksConfig();
    
    res.json({
      success: true,
      data: config
    } as ApiResponse);
  } catch (error) {
    console.error('获取段位配置失败:', error);
    res.status(500).json({
      success: false,
      error: '获取段位配置失败'
    } as ApiResponse);
  }
});

// 获取所有配置
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // 检查并自动重新加载配置（热重载）
    await ConfigManager.checkAndReload();
    
    const config = ConfigManager.getAllConfig();
    
    res.json({
      success: true,
      data: config
    } as ApiResponse);
  } catch (error) {
    console.error('获取配置失败:', error);
    res.status(500).json({
      success: false,
      error: '获取配置失败'
    } as ApiResponse);
  }
});

// 获取特定类型的配置
router.get('/:type', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    // 检查并自动重新加载配置
    await ConfigManager.checkAndReload();
    
    let config;
    switch (type) {
      case 'game':
        config = ConfigManager.getGameConfig();
        break;
      case 'ranks':
        config = ConfigManager.getRanksConfig();
        break;
      case 'achievements':
        config = ConfigManager.getAchievementsConfig();
        break;
      default:
        return res.status(400).json({
          success: false,
          error: '无效的配置类型'
        } as ApiResponse);
    }
    
    res.json({
      success: true,
      data: config
    } as ApiResponse);
  } catch (error) {
    console.error('获取配置失败:', error);
    res.status(500).json({
      success: false,
      error: '获取配置失败'
    } as ApiResponse);
  }
});

// 更新配置
router.put('/:type', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const config = req.body;

    // 验证配置类型
    if (!['game', 'ranks', 'achievements'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: '不支持的配置类型'
      } as ApiResponse);
    }

    // 基本验证
    if (!config) {
      return res.status(400).json({
        success: false,
        error: '配置数据不能为空'
      } as ApiResponse);
    }

    // 类型特定验证
    if (type === 'game') {
      if (!config.BASE_POINTS || !config.TOTAL_POINTS || config.INITIAL_POINTS === undefined || config.INITIAL_POINTS === null) {
        return res.status(400).json({
          success: false,
          error: '游戏配置缺少必要字段'
        } as ApiResponse);
      }
    }
    
    if (type === 'ranks') {
      if (!Array.isArray(config)) {
        return res.status(400).json({
          success: false,
          error: '段位配置必须是数组'
        } as ApiResponse);
      }
    }

    if (type === 'achievements') {
      if (!config.achievements || !Array.isArray(config.achievements)) {
        return res.status(400).json({
          success: false,
          error: '成就配置必须包含成就数组'
        } as ApiResponse);
      }
      
      if (typeof config.enabled !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: '成就配置必须包含启用状态'
        } as ApiResponse);
      }
    }

    // 更新配置
    await ConfigManager.updateConfig(type as 'game' | 'ranks' | 'achievements', config);

    // 记录配置变更历史
    configChangeHistory.push({
      timestamp: new Date().toISOString(),
      type,
      user: (req as any).user?.username || 'unknown',
      action: 'update'
    });

    res.json({
      success: true,
      message: `${type === 'game' ? '游戏' : type === 'ranks' ? '段位' : '成就'}配置更新成功`
    } as ApiResponse);

  } catch (error) {
    console.error('更新配置失败:', error);
    res.status(500).json({
      success: false,
      error: '更新配置失败'
    } as ApiResponse);
  }
});

// 更新单个段位
router.put('/ranks/:id', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const rankId = parseInt(req.params.id);
    const updatedRank = req.body;
    
    if (!rankId || !updatedRank) {
      return res.status(400).json({
        success: false,
        error: '无效的段位ID或数据'
      } as ApiResponse);
    }
    
    // 验证必要字段
    if (!updatedRank.rankName || updatedRank.minPoints === undefined || updatedRank.maxPoints === undefined) {
      return res.status(400).json({
        success: false,
        error: '段位名称、最小积分和最大积分不能为空'
      } as ApiResponse);
    }
    
    // 验证积分范围
    if (updatedRank.minPoints >= updatedRank.maxPoints) {
      return res.status(400).json({
        success: false,
        error: '最小积分必须小于最大积分'
      } as ApiResponse);
    }
    
    // 获取当前所有段位配置
    const allRanks = ConfigManager.getRanksConfig();
    const existingRankIndex = allRanks.findIndex(rank => rank.id === rankId);
    
    if (existingRankIndex === -1) {
      return res.status(404).json({
        success: false,
        error: '段位不存在'
      } as ApiResponse);
    }
    
    // 检查积分范围是否与其他段位重叠（排除当前段位）
    const otherRanks = allRanks.filter(rank => rank.id !== rankId);
    for (const rank of otherRanks) {
      // 检查是否有重叠
      if (!(updatedRank.maxPoints < rank.minPoints || updatedRank.minPoints > rank.maxPoints)) {
        return res.status(400).json({
          success: false,
          error: `积分范围与段位"${rank.rankName}"(${rank.minPoints}-${rank.maxPoints})重叠`
        } as ApiResponse);
      }
    }
    
    // 更新段位信息
    const updatedRankConfig = {
      ...allRanks[existingRankIndex],
      ...updatedRank,
      id: rankId // 确保ID不被修改
    };
    
    // 更新配置数组
    allRanks[existingRankIndex] = updatedRankConfig;
    
    // 保存配置
    await ConfigManager.updateConfig('ranks', allRanks);
    
    // 记录操作日志
    console.log(`段位已更新 - ID: ${rankId}, 名称: ${updatedRank.rankName}, 用户: ${(req as any).user?.username}, 时间: ${new Date().toISOString()}`);
    
    res.json({
      success: true,
      message: '段位更新成功',
      data: updatedRankConfig
    } as ApiResponse);
  } catch (error) {
    console.error('更新段位失败:', error);
    res.status(500).json({
      success: false,
      error: '更新段位失败'
    } as ApiResponse);
  }
});

// 重新加载配置
router.post('/reload', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await ConfigManager.reloadConfig();
    
    console.log(`配置已重新加载 - 用户: ${(req as any).user?.username}, 时间: ${new Date().toISOString()}`);
    
    res.json({
      success: true,
      message: '配置重新加载成功'
    } as ApiResponse);
  } catch (error) {
    console.error('重新加载配置失败:', error);
    res.status(500).json({
      success: false,
      error: '重新加载配置失败'
    } as ApiResponse);
  }
});

// 获取配置变更历史（简单版本，记录在内存中）
const configChangeHistory: Array<{
  timestamp: string;
  type: string;
  user: string;
  action: 'update' | 'reload';
}> = [];

router.get('/history/changes', authenticateToken, requireSuperAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: configChangeHistory.slice(-50) // 返回最近50条记录
  } as ApiResponse);
});

// 验证配置
router.post('/validate/:type', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const config = req.body;

    const errors: string[] = [];

    if (type === 'game') {
      if (!config.BASE_POINTS || config.BASE_POINTS <= 0) {
        errors.push('基础分数必须大于0');
      }
      if (!config.TOTAL_POINTS || config.TOTAL_POINTS <= 0) {
        errors.push('总分数必须大于0');
      }
      if (!config.INITIAL_POINTS && config.INITIAL_POINTS !== 0) {
        errors.push('初始分数不能为空');
      }
      if (typeof config.INITIAL_POINTS !== 'number' || config.INITIAL_POINTS < 0) {
        errors.push('初始分数必须是大于等于0的数字');
      }
    }
    
    if (type === 'ranks') {
      if (!Array.isArray(config)) {
        errors.push('段位配置必须是数组');
      } else {
        config.forEach((rank: any, index: number) => {
          if (!rank.rankName) {
            errors.push(`第${index + 1}个段位缺少段位名称`);
          }
          if (typeof rank.minPoints !== 'number') {
            errors.push(`第${index + 1}个段位的最小积分必须是数字`);
          }
          if (typeof rank.maxPoints !== 'number') {
            errors.push(`第${index + 1}个段位的最大积分必须是数字`);
          }
          if (rank.minPoints >= rank.maxPoints) {
            errors.push(`第${index + 1}个段位的最小积分必须小于最大积分`);
          }
        });
      }
    }

    res.json({
      success: errors.length === 0,
      errors,
      message: errors.length === 0 ? '配置验证通过' : '配置验证失败'
    } as ApiResponse);

  } catch (error) {
    console.error('验证配置失败:', error);
    res.status(500).json({
      success: false,
      error: '验证配置失败'
    } as ApiResponse);
  }
});

export default router;