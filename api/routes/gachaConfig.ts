import express, { Request, Response } from 'express';
import { GachaConfigManager, getGachaConfig, updateGachaConfig } from '../utils/gachaConfigManager.js';
import { ApiResponse, GachaConfig } from '../../shared/types.js';
import { authenticateToken, requireSuperAdmin } from './auth.js';

const router = express.Router();

// 获取抽卡配置
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    // 检查并重新加载配置（热重载）
    await GachaConfigManager.checkAndReload();
    
    const config = getGachaConfig();
    
    const response: ApiResponse<GachaConfig> = {
      success: true,
      data: config
    };
    res.json(response);
  } catch (error) {
    console.error('获取抽卡配置失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取抽卡配置失败'
    };
    res.status(500).json(response);
  }
});

// 更新抽卡配置（超级管理员权限）
router.put('/', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const config: GachaConfig = req.body;

    // 基本验证
    if (!config) {
      const response: ApiResponse = {
        success: false,
        error: '配置数据不能为空'
      };
      return res.status(400).json(response);
    }

    // 验证稀有度概率配置
    if (!config.rarityRates || typeof config.rarityRates !== 'object') {
      const response: ApiResponse = {
        success: false,
        error: '稀有度概率配置无效'
      };
      return res.status(400).json(response);
    }

    // 验证概率总和是否为100%
    const totalRate = Object.values(config.rarityRates).reduce((sum, rate) => sum + rate, 0);
    if (Math.abs(totalRate - 100) > 0.01) {
      const response: ApiResponse = {
        success: false,
        error: `稀有度概率总和必须为100%，当前为${totalRate}%`
      };
      return res.status(400).json(response);
    }

    // 验证保底配置
    if (!config.guaranteeConfig || typeof config.guaranteeConfig !== 'object') {
      const response: ApiResponse = {
        success: false,
        error: '保底配置无效'
      };
      return res.status(400).json(response);
    }

    // 验证游戏奖励配置
    if (!config.gameRewardConfig || typeof config.gameRewardConfig !== 'object') {
      const response: ApiResponse = {
        success: false,
        error: '游戏奖励配置无效'
      };
      return res.status(400).json(response);
    }

    // 验证奖励配置
    const rewardsByPosition = config.gameRewardConfig.rewardsByPosition;
    if (!rewardsByPosition || typeof rewardsByPosition !== 'object') {
      const response: ApiResponse = {
        success: false,
        error: '游戏奖励位次配置无效'
      };
      return res.status(400).json(response);
    }

    // 验证位次奖励数值
    for (let position = 1; position <= 4; position++) {
      const reward = rewardsByPosition[position as 1 | 2 | 3 | 4];
      if (typeof reward !== 'number' || reward < 0) {
        const response: ApiResponse = {
          success: false,
          error: `第${position}名奖励配置无效，必须为非负数`
        };
        return res.status(400).json(response);
      }
    }

    // 验证其他配置
    if (typeof config.maxTicketsPerUser !== 'number' || config.maxTicketsPerUser <= 0) {
      const response: ApiResponse = {
        success: false,
        error: '用户最大抽卡次数必须为正数'
      };
      return res.status(400).json(response);
    }

    if (!['ignore', 'convert'].includes(config.duplicateItemHandling)) {
      const response: ApiResponse = {
        success: false,
        error: '重复道具处理方式无效'
      };
      return res.status(400).json(response);
    }

    // 更新配置
    await updateGachaConfig(config);

    const response: ApiResponse = {
      success: true,
      message: '抽卡配置更新成功'
    };
    res.json(response);

  } catch (error) {
    console.error('更新抽卡配置失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '更新抽卡配置失败'
    };
    res.status(500).json(response);
  }
});

// 重置为默认配置（超级管理员权限）
router.post('/reset', authenticateToken, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    // 获取默认配置
    const defaultConfig: GachaConfig = {
      rarityRates: {
        R: 85,
        SR: 13,
        SSR: 2
      },
      guaranteeConfig: {
        tenPullGuaranteeSR: true,
        pitySystemEnabled: false,
        srPityCount: 10,
        ssrPityCount: 90
      },
      gameRewardConfig: {
        enabled: true,
        rewardsByPosition: {
          1: 4,
          2: 3,
          3: 2,
          4: 1
        }
      },
      maxTicketsPerUser: 999,
      duplicateItemHandling: 'ignore'
    };

    // 更新为默认配置
    await updateGachaConfig(defaultConfig);

    const response: ApiResponse = {
      success: true,
      message: '抽卡配置已重置为默认值'
    };
    res.json(response);

  } catch (error) {
    console.error('重置抽卡配置失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '重置抽卡配置失败'
    };
    res.status(500).json(response);
  }
});

export default router;