import express, { Request, Response } from 'express';
import { 
  gachaPoolDb, 
  gachaRecordDb, 
  userTicketDb, 
  ticketRecordDb, 
  itemDb, 
  userItemDb 
} from '../utils/gachaDatabase.js';
import { 
  ApiResponse, 
  GachaPool, 
  GachaRecord, 
  UserGachaTickets, 
  GachaTicketRecord,
  GachaResult,
  Item,
  ItemRarity
} from '../../shared/types.js';
import { authenticateToken, requireAdmin } from './auth.js';
import { getGachaConfig } from '../utils/gachaConfigManager.js';

const router = express.Router();

// 获取所有卡池
router.get('/pools', async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    let pools;
    
    if (active === 'true') {
      pools = await gachaPoolDb.findActive();
    } else {
      pools = await gachaPoolDb.findAll();
    }

    const response: ApiResponse<{ pools: GachaPool[], total: number }> = {
      success: true,
      data: {
        pools,
        total: pools.length
      }
    };
    res.json(response);
  } catch (error) {
    console.error('获取卡池列表失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取卡池列表失败'
    };
    res.status(500).json(response);
  }
});

// 根据ID获取卡池详情
router.get('/pools/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = await gachaPoolDb.findById(id);
    
    if (!pool) {
      const response: ApiResponse = {
        success: false,
        error: '卡池不存在'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<GachaPool> = {
      success: true,
      data: pool
    };
    res.json(response);
  } catch (error) {
    console.error('获取卡池详情失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取卡池详情失败'
    };
    res.status(500).json(response);
  }
});

// 创建卡池（管理员权限）
router.post('/pools', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, isActive, startTime, endTime, bannerImageUrl, items } = req.body;

    // 验证必填字段
    if (!name || !description || !items || !Array.isArray(items)) {
      const response: ApiResponse = {
        success: false,
        error: '名称、描述和道具列表为必填字段'
      };
      return res.status(400).json(response);
    }

    // 验证道具是否存在
    for (const poolItem of items) {
      const item = await itemDb.findById(poolItem.itemId);
      if (!item) {
        const response: ApiResponse = {
          success: false,
          error: `道具 ${poolItem.itemId} 不存在`
        };
        return res.status(400).json(response);
      }
    }

    const poolData = {
      name,
      description,
      isActive: isActive || false,
      startTime,
      endTime,
      bannerImageUrl,
      items
    };

    const pool = await gachaPoolDb.create(poolData);

    const response: ApiResponse<GachaPool> = {
      success: true,
      data: pool,
      message: '卡池创建成功'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('创建卡池失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '创建卡池失败'
    };
    res.status(500).json(response);
  }
});

// 更新卡池（管理员权限）
router.put('/pools/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 检查卡池是否存在
    const existingPool = await gachaPoolDb.findById(id);
    if (!existingPool) {
      const response: ApiResponse = {
        success: false,
        error: '卡池不存在'
      };
      return res.status(404).json(response);
    }

    // 如果更新道具列表，验证道具是否存在
    if (updateData.items && Array.isArray(updateData.items)) {
      for (const poolItem of updateData.items) {
        const item = await itemDb.findById(poolItem.itemId);
        if (!item) {
          const response: ApiResponse = {
            success: false,
            error: `道具 ${poolItem.itemId} 不存在`
          };
          return res.status(400).json(response);
        }
      }
    }

    const updatedPool = await gachaPoolDb.update(id, updateData);

    const response: ApiResponse<GachaPool> = {
      success: true,
      data: updatedPool!,
      message: '卡池更新成功'
    };
    res.json(response);
  } catch (error) {
    console.error('更新卡池失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '更新卡池失败'
    };
    res.status(500).json(response);
  }
});

// 删除卡池（管理员权限）
router.delete('/pools/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 检查卡池是否存在
    const existingPool = await gachaPoolDb.findById(id);
    if (!existingPool) {
      const response: ApiResponse = {
        success: false,
        error: '卡池不存在'
      };
      return res.status(404).json(response);
    }

    const success = await gachaPoolDb.delete(id);
    if (!success) {
      const response: ApiResponse = {
        success: false,
        error: '删除卡池失败'
      };
      return res.status(500).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: '卡池删除成功'
    };
    res.json(response);
  } catch (error) {
    console.error('删除卡池失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '删除卡池失败'
    };
    res.status(500).json(response);
  }
});

// 执行抽卡
router.post('/pull', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { poolId, count = 1 } = req.body;
    const userId = (req as any).user.userId;

    // 验证抽卡次数
    if (count !== 1 && count !== 10) {
      const response: ApiResponse = {
        success: false,
        error: '只支持单抽(1次)或十连抽(10次)'
      };
      return res.status(400).json(response);
    }

    // 检查卡池是否存在且激活
    const pool = await gachaPoolDb.findById(poolId);
    if (!pool) {
      const response: ApiResponse = {
        success: false,
        error: '卡池不存在'
      };
      return res.status(404).json(response);
    }

    if (!pool.isActive) {
      const response: ApiResponse = {
        success: false,
        error: '卡池未开启'
      };
      return res.status(400).json(response);
    }

    // 检查卡池时间限制
    const now = new Date().toISOString();
    if (pool.startTime && pool.startTime > now) {
      const response: ApiResponse = {
        success: false,
        error: '卡池尚未开始'
      };
      return res.status(400).json(response);
    }

    if (pool.endTime && pool.endTime < now) {
      const response: ApiResponse = {
        success: false,
        error: '卡池已结束'
      };
      return res.status(400).json(response);
    }

    // 检查用户抽卡次数
    const userTickets = await userTicketDb.findByUserId(userId);
    if (!userTickets || userTickets.tickets < count) {
      const response: ApiResponse = {
        success: false,
        error: '抽卡次数不足'
      };
      return res.status(400).json(response);
    }

    // 执行抽卡逻辑
    const gachaResult = await performGacha(userId, pool, count);

    // 扣除抽卡次数
    await userTicketDb.useTickets(userId, count);

    const response: ApiResponse<GachaResult> = {
      success: true,
      data: gachaResult,
      message: '抽卡成功'
    };
    res.json(response);
  } catch (error) {
    console.error('抽卡失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '抽卡失败'
    };
    res.status(500).json(response);
  }
});

// 抽卡逻辑实现
async function performGacha(userId: string, pool: GachaPool, count: number): Promise<GachaResult> {
  const config = await getGachaConfig();
  const batchId = count === 10 ? `batch_${Date.now()}_${Math.random().toString(36).substring(2)}` : undefined;
  const results: { item: Item; isNew: boolean; isGuaranteed: boolean }[] = [];

  // 计算总权重
  const totalWeight = pool.items.reduce((sum, poolItem) => sum + poolItem.weight, 0);

  if (count === 1) {
    // 单抽逻辑
    const item = selectRandomItem(pool, totalWeight);
    const isNew = !(await userItemDb.hasItem(userId, item.id));

    // 创建抽卡记录
    await gachaRecordDb.create({
      userId,
      poolId: pool.id,
      itemId: item.id,
      rarity: item.rarity,
      isGuaranteed: false,
      gachaType: 'single'
    });

    // 添加到用户道具
    if (isNew) {
      await userItemDb.create({
        userId,
        itemId: item.id,
        obtainedAt: new Date().toISOString(),
        isEquipped: false
      });
    }

    results.push({ item, isNew, isGuaranteed: false });
  } else if (count === 10) {
    // 十连抽逻辑
    let guaranteedSRNeeded = false;
    
    // 先抽取前9次
    for (let i = 0; i < 9; i++) {
      const item = selectRandomItem(pool, totalWeight);
      const isNew = !(await userItemDb.hasItem(userId, item.id));

      // 创建抽卡记录
      await gachaRecordDb.create({
        userId,
        poolId: pool.id,
        itemId: item.id,
        rarity: item.rarity,
        isGuaranteed: false,
        gachaType: 'ten',
        batchId
      });

      // 添加到用户道具
      if (isNew) {
        await userItemDb.create({
          userId,
          itemId: item.id,
          obtainedAt: new Date().toISOString(),
          isEquipped: false
        });
      }

      results.push({ item, isNew, isGuaranteed: false });
    }

    // 检查前9次是否有SR以上，如果没有则第10次保底
    if (config.guaranteeConfig.tenPullGuaranteeSR) {
      const hasSROrAbove = results.some(result => 
        result.item.rarity === ItemRarity.SR || result.item.rarity === ItemRarity.SSR
      );
      guaranteedSRNeeded = !hasSROrAbove;
    }

    // 第10次抽取
    let item: Item;
    let isGuaranteed = false;

    if (guaranteedSRNeeded) {
      // 保底SR或以上
      item = selectGuaranteedSRItem(pool);
      isGuaranteed = true;
    } else {
      item = selectRandomItem(pool, totalWeight);
    }

    const isNew = !(await userItemDb.hasItem(userId, item.id));

    // 创建抽卡记录
    await gachaRecordDb.create({
      userId,
      poolId: pool.id,
      itemId: item.id,
      rarity: item.rarity,
      isGuaranteed,
      gachaType: 'ten',
      batchId
    });

    // 添加到用户道具
    if (isNew) {
      await userItemDb.create({
        userId,
        itemId: item.id,
        obtainedAt: new Date().toISOString(),
        isEquipped: false
      });
    }

    results.push({ item, isNew, isGuaranteed });
  }

  // 获取更新后的抽卡次数
  const updatedTickets = await userTicketDb.findByUserId(userId);

  return {
    items: results,
    ticketsUsed: count,
    remainingTickets: updatedTickets?.tickets || 0
  };
}

// 随机选择道具
function selectRandomItem(pool: GachaPool, totalWeight: number): Item {
  const random = Math.random() * totalWeight;
  let currentWeight = 0;

  for (const poolItem of pool.items) {
    currentWeight += poolItem.weight;
    if (random <= currentWeight && poolItem.item) {
      return poolItem.item;
    }
  }

  // 兜底：返回第一个道具
  return pool.items[0].item!;
}

// 选择保底SR道具
function selectGuaranteedSRItem(pool: GachaPool): Item {
  const srOrAboveItems = pool.items.filter(poolItem => 
    poolItem.item && (poolItem.item.rarity === ItemRarity.SR || poolItem.item.rarity === ItemRarity.SSR)
  );

  if (srOrAboveItems.length === 0) {
    // 如果没有SR以上道具，返回第一个道具
    return pool.items[0].item!;
  }

  const totalWeight = srOrAboveItems.reduce((sum, poolItem) => sum + poolItem.weight, 0);
  const random = Math.random() * totalWeight;
  let currentWeight = 0;

  for (const poolItem of srOrAboveItems) {
    currentWeight += poolItem.weight;
    if (random <= currentWeight && poolItem.item) {
      return poolItem.item;
    }
  }

  // 兜底：返回第一个SR以上道具
  return srOrAboveItems[0].item!;
}

// 获取用户抽卡次数
router.get('/tickets/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    // 权限检查：只能查看自己的抽卡次数，或管理员可以查看所有用户的
    if (currentUser.userId !== userId && currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
      const response: ApiResponse = {
        success: false,
        error: '权限不足'
      };
      return res.status(403).json(response);
    }

    const tickets = await userTicketDb.findByUserId(userId);

    const response: ApiResponse<UserGachaTickets | null> = {
      success: true,
      data: tickets
    };
    res.json(response);
  } catch (error) {
    console.error('获取用户抽卡次数失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户抽卡次数失败'
    };
    res.status(500).json(response);
  }
});

// 管理员发放抽卡次数
router.post('/tickets/grant', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      const response: ApiResponse = {
        success: false,
        error: '用户ID和发放数量为必填字段，且数量必须大于0'
      };
      return res.status(400).json(response);
    }

    // 添加抽卡次数
    await userTicketDb.addTickets(userId, amount);

    // 记录发放历史
    await ticketRecordDb.create({
      userId,
      type: 'earn',
      amount,
      source: 'admin_grant',
      description: description || '管理员发放'
    });

    const response: ApiResponse = {
      success: true,
      message: `成功为用户发放 ${amount} 次抽卡机会`
    };
    res.json(response);
  } catch (error) {
    console.error('发放抽卡次数失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '发放抽卡次数失败'
    };
    res.status(500).json(response);
  }
});

// 获取用户抽卡记录
router.get('/records/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;
    const currentUser = (req as any).user;

    // 权限检查：只能查看自己的抽卡记录，或管理员可以查看所有用户的
    if (currentUser.userId !== userId && currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
      const response: ApiResponse = {
        success: false,
        error: '权限不足'
      };
      return res.status(403).json(response);
    }

    const records = await gachaRecordDb.findByUserId(userId, limit ? parseInt(limit as string) : undefined);

    const response: ApiResponse<{ records: GachaRecord[], total: number }> = {
      success: true,
      data: {
        records,
        total: records.length
      }
    };
    res.json(response);
  } catch (error) {
    console.error('获取抽卡记录失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取抽卡记录失败'
    };
    res.status(500).json(response);
  }
});

// 获取抽卡次数获得记录
router.get('/ticket-records/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit } = req.query;
    const currentUser = (req as any).user;

    // 权限检查：只能查看自己的记录，或管理员可以查看所有用户的
    if (currentUser.userId !== userId && currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
      const response: ApiResponse = {
        success: false,
        error: '权限不足'
      };
      return res.status(403).json(response);
    }

    const records = await ticketRecordDb.findByUserId(userId, limit ? parseInt(limit as string) : undefined);

    const response: ApiResponse<{ records: GachaTicketRecord[], total: number }> = {
      success: true,
      data: {
        records,
        total: records.length
      }
    };
    res.json(response);
  } catch (error) {
    console.error('获取抽卡次数记录失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取抽卡次数记录失败'
    };
    res.status(500).json(response);
  }
});

export default router;