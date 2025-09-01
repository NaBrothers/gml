import express, { Request, Response } from 'express';
import { itemDb, userItemDb, userEquipmentDb, gachaPoolDb } from '../utils/gachaDatabase.js';
import { ApiResponse, Item, ItemType, ItemRarity, UserItem, UserEquipment, GachaPool } from '../../shared/types.js';
import { authenticateToken, requireAdmin } from './auth.js';
import { uploadAvatar } from '../middleware/upload.js';

const router = express.Router();

// 获取所有道具（公开接口）
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, rarity, active } = req.query;
    let items = await itemDb.findAll();

    // 应用过滤条件
    if (type) {
      items = items.filter(item => item.type === type);
    }
    if (rarity) {
      items = items.filter(item => item.rarity === rarity);
    }
    if (active !== undefined) {
      const isActive = active === 'true';
      items = items.filter(item => item.isActive === isActive);
    }

    const response: ApiResponse<{ items: Item[], total: number }> = {
      success: true,
      data: {
        items,
        total: items.length
      }
    };
    res.json(response);
  } catch (error) {
    console.error('获取道具列表失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取道具列表失败'
    };
    res.status(500).json(response);
  }
});

// 获取道具所属的卡池信息
router.get('/:id/pools', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 检查道具是否存在
    const item = await itemDb.findById(id);
    if (!item) {
      const response: ApiResponse = {
        success: false,
        error: '道具不存在'
      };
      return res.status(404).json(response);
    }

    // 获取包含该道具的所有卡池
    const allPools = await gachaPoolDb.findAll();
    const itemPools = allPools.filter(pool => 
      pool.items.some(poolItem => poolItem.itemId === id)
    );

    const response: ApiResponse<{ pools: GachaPool[], total: number }> = {
      success: true,
      data: {
        pools: itemPools,
        total: itemPools.length
      }
    };
    res.json(response);
  } catch (error) {
    console.error('获取道具卡池信息失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取道具卡池信息失败'
    };
    res.status(500).json(response);
  }
});

// 获取所有道具及其所属卡池信息
router.get('/with-pools/all', async (req: Request, res: Response) => {
  try {
    const { type, rarity, active, poolId } = req.query;
    let items = await itemDb.findAll();
    const allPools = await gachaPoolDb.findAll();

    // 应用过滤条件
    if (type) {
      items = items.filter(item => item.type === type);
    }
    if (rarity) {
      items = items.filter(item => item.rarity === rarity);
    }
    if (active !== undefined) {
      const isActive = active === 'true';
      items = items.filter(item => item.isActive === isActive);
    }

    // 为每个道具添加所属卡池信息
    const itemsWithPools = items.map(item => {
      const itemPools = allPools.filter(pool => 
        pool.items.some(poolItem => poolItem.itemId === item.id)
      );
      
      return {
        ...item,
        pools: itemPools
      };
    });

    // 如果指定了卡池ID，只返回属于该卡池的道具
    let filteredItems = itemsWithPools;
    if (poolId) {
      filteredItems = itemsWithPools.filter(item => 
        item.pools.some(pool => pool.id === poolId)
      );
    }

    const response: ApiResponse<{ items: any[], pools: GachaPool[], total: number }> = {
      success: true,
      data: {
        items: filteredItems,
        pools: allPools,
        total: filteredItems.length
      }
    };
    res.json(response);
  } catch (error) {
    console.error('获取道具和卡池信息失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取道具和卡池信息失败'
    };
    res.status(500).json(response);
  }
});

// 根据ID获取道具
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await itemDb.findById(id);
    
    if (!item) {
      const response: ApiResponse = {
        success: false,
        error: '道具不存在'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Item> = {
      success: true,
      data: item
    };
    res.json(response);
  } catch (error) {
    console.error('获取道具详情失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取道具详情失败'
    };
    res.status(500).json(response);
  }
});

// 创建道具（管理员权限）
router.post('/', authenticateToken, requireAdmin, (req, res, next) => {
  uploadAvatar(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || '文件上传失败'
      });
    }
    
    try {
      const { name, description, type, rarity, isActive } = req.body;

      // 验证必填字段
      if (!name || !description || !type || !rarity) {
        const response: ApiResponse = {
          success: false,
          error: '名称、描述、类型和稀有度为必填字段'
        };
        return res.status(400).json(response);
      }

      // 验证枚举值
      if (!Object.values(ItemType).includes(type)) {
        const response: ApiResponse = {
          success: false,
          error: '无效的道具类型'
        };
        return res.status(400).json(response);
      }

      if (!Object.values(ItemRarity).includes(rarity)) {
        const response: ApiResponse = {
          success: false,
          error: '无效的稀有度'
        };
        return res.status(400).json(response);
      }

      // 处理图片上传
      let imageUrl = '';
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const itemData = {
        name,
        description,
        type: type as ItemType,
        rarity: rarity as ItemRarity,
        imageUrl,
        isActive: isActive === 'true' || isActive === true
      };

      const item = await itemDb.create(itemData);

      const response: ApiResponse<Item> = {
        success: true,
        data: item,
        message: '道具创建成功'
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('创建道具失败:', error);
      const response: ApiResponse = {
        success: false,
        error: '创建道具失败'
      };
      res.status(500).json(response);
    }
  });
});

// 更新道具（管理员权限）
router.put('/:id', authenticateToken, requireAdmin, (req, res, next) => {
  uploadAvatar(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || '文件上传失败'
      });
    }
    
    try {
      const { id } = req.params;
      const { name, description, type, rarity, isActive } = req.body;

      // 检查道具是否存在
      const existingItem = await itemDb.findById(id);
      if (!existingItem) {
        const response: ApiResponse = {
          success: false,
          error: '道具不存在'
        };
        return res.status(404).json(response);
      }

      // 验证枚举值
      if (type && !Object.values(ItemType).includes(type)) {
        const response: ApiResponse = {
          success: false,
          error: '无效的道具类型'
        };
        return res.status(400).json(response);
      }

      if (rarity && !Object.values(ItemRarity).includes(rarity)) {
        const response: ApiResponse = {
          success: false,
          error: '无效的稀有度'
        };
        return res.status(400).json(response);
      }

      // 准备更新数据
      const updateData: Partial<Item> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (type !== undefined) updateData.type = type as ItemType;
      if (rarity !== undefined) updateData.rarity = rarity as ItemRarity;
      if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;

      // 处理图片上传
      if (req.file) {
        updateData.imageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedItem = await itemDb.update(id, updateData);

      const response: ApiResponse<Item> = {
        success: true,
        data: updatedItem!,
        message: '道具更新成功'
      };
      res.json(response);
    } catch (error) {
      console.error('更新道具失败:', error);
      const response: ApiResponse = {
        success: false,
        error: '更新道具失败'
      };
      res.status(500).json(response);
    }
  });
});

// 删除道具（管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 检查道具是否存在
    const existingItem = await itemDb.findById(id);
    if (!existingItem) {
      const response: ApiResponse = {
        success: false,
        error: '道具不存在'
      };
      return res.status(404).json(response);
    }

    const success = await itemDb.delete(id);
    if (!success) {
      const response: ApiResponse = {
        success: false,
        error: '删除道具失败'
      };
      return res.status(500).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: '道具删除成功'
    };
    res.json(response);
  } catch (error) {
    console.error('删除道具失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '删除道具失败'
    };
    res.status(500).json(response);
  }
});

// 获取用户拥有的道具
router.get('/user/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    // 权限检查：只能查看自己的道具，或管理员可以查看所有用户的道具
    if (currentUser.userId !== userId && currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
      const response: ApiResponse = {
        success: false,
        error: '权限不足'
      };
      return res.status(403).json(response);
    }

    const userItems = await userItemDb.findByUserId(userId);

    const response: ApiResponse<{ userItems: UserItem[], total: number }> = {
      success: true,
      data: {
        userItems,
        total: userItems.length
      }
    };
    res.json(response);
  } catch (error) {
    console.error('获取用户道具失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户道具失败'
    };
    res.status(500).json(response);
  }
});

// 装备/卸载道具
router.put('/user/:userId/equip/:itemId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId, itemId } = req.params;
    const { isEquipped } = req.body;
    const currentUser = (req as any).user;

    // 权限检查：只能操作自己的道具
    if (currentUser.userId !== userId) {
      const response: ApiResponse = {
        success: false,
        error: '权限不足'
      };
      return res.status(403).json(response);
    }

    // 检查用户是否拥有该道具
    const userItem = await userItemDb.findByUserIdAndItemId(userId, itemId);
    if (!userItem) {
      const response: ApiResponse = {
        success: false,
        error: '您还未拥有该道具'
      };
      return res.status(404).json(response);
    }

    // 更新装备状态
    const updatedUserItem = await userItemDb.updateEquipStatus(userId, itemId, isEquipped);

    // 如果是装备操作，需要更新用户装备配置
    if (isEquipped && userItem.item) {
      const equipmentUpdate: Partial<UserEquipment> = {};
      
      switch (userItem.item.type) {
        case ItemType.AVATAR_FRAME:
          equipmentUpdate.avatarFrameId = itemId;
          break;
        case ItemType.HOME_ILLUSTRATION:
          equipmentUpdate.homeIllustrationId = itemId;
          break;
        case ItemType.PROFILE_BANNER:
          equipmentUpdate.profileBannerId = itemId;
          break;
        case ItemType.THEME:
          equipmentUpdate.themeId = itemId;
          break;
      }

      if (Object.keys(equipmentUpdate).length > 0) {
        await userEquipmentDb.createOrUpdate(userId, equipmentUpdate);
      }
    }

    const response: ApiResponse<UserItem> = {
      success: true,
      data: updatedUserItem!,
      message: isEquipped ? '道具装备成功' : '道具卸载成功'
    };
    res.json(response);
  } catch (error) {
    console.error('装备道具失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '装备道具失败'
    };
    res.status(500).json(response);
  }
});

// 获取用户装备配置
router.get('/user/:userId/equipment', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUser = (req as any).user;

    // 权限检查：只能查看自己的装备，或管理员可以查看所有用户的装备
    if (currentUser.userId !== userId && currentUser.role !== 'admin' && currentUser.role !== 'super_admin') {
      const response: ApiResponse = {
        success: false,
        error: '权限不足'
      };
      return res.status(403).json(response);
    }

    const equipment = await userEquipmentDb.findByUserId(userId);

    const response: ApiResponse<UserEquipment | null> = {
      success: true,
      data: equipment
    };
    res.json(response);
  } catch (error) {
    console.error('获取用户装备配置失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '获取用户装备配置失败'
    };
    res.status(500).json(response);
  }
});

export default router;