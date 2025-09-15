// 抽卡系统数据库操作
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  Item, 
  UserItem, 
  GachaPool, 
  GachaRecord, 
  UserGachaTickets, 
  GachaTicketRecord,
  UserEquipment,
  ItemRarity,
  ItemType
} from '../../shared/types.js';
import { ItemConfigManager } from './itemConfigManager.js';
import { PoolConfigManager } from './poolConfigManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据文件路径
const DATA_DIR = path.join(__dirname, '../../data');
const ITEMS_FILE = path.join(DATA_DIR, 'items.json');
const USER_ITEMS_FILE = path.join(DATA_DIR, 'userItems.json');
const GACHA_POOLS_FILE = path.join(DATA_DIR, 'gachaPools.json');
const GACHA_RECORDS_FILE = path.join(DATA_DIR, 'gachaRecords.json');
const USER_TICKETS_FILE = path.join(DATA_DIR, 'userGachaTickets.json');
const TICKET_RECORDS_FILE = path.join(DATA_DIR, 'gachaTicketRecords.json');
const USER_EQUIPMENT_FILE = path.join(DATA_DIR, 'userEquipment.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 文件存储工具类
class FileStorage<T> {
  constructor(private filePath: string) {}

  async load(): Promise<T[]> {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`加载文件失败 ${this.filePath}:`, error);
      return [];
    }
  }

  async save(data: T[]): Promise<void> {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`保存文件失败 ${this.filePath}:`, error);
      throw error;
    }
  }
}

// 文件存储实例
const itemStorage = new FileStorage<Item>(ITEMS_FILE);
const userItemStorage = new FileStorage<UserItem>(USER_ITEMS_FILE);
const gachaPoolStorage = new FileStorage<GachaPool>(GACHA_POOLS_FILE);
const gachaRecordStorage = new FileStorage<GachaRecord>(GACHA_RECORDS_FILE);
const userTicketStorage = new FileStorage<UserGachaTickets>(USER_TICKETS_FILE);
const ticketRecordStorage = new FileStorage<GachaTicketRecord>(TICKET_RECORDS_FILE);
const userEquipmentStorage = new FileStorage<UserEquipment>(USER_EQUIPMENT_FILE);

// 内存缓存（保留用户相关的动态数据）
let userItems: UserItem[] = [];
let gachaRecords: GachaRecord[] = [];
let userTickets: UserGachaTickets[] = [];
let ticketRecords: GachaTicketRecord[] = [];
let userEquipment: UserEquipment[] = [];

let isLoaded = false;

// 生成唯一ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 清理所有用户的抽卡记录，每个用户只保留最近10条
async function cleanupAllGachaRecords(): Promise<void> {
  // 按用户分组
  const userRecordsMap = new Map<string, GachaRecord[]>();
  
  gachaRecords.forEach(record => {
    if (!userRecordsMap.has(record.userId)) {
      userRecordsMap.set(record.userId, []);
    }
    userRecordsMap.get(record.userId)!.push(record);
  });

  // 清理后的记录
  const cleanedRecords: GachaRecord[] = [];
  
  userRecordsMap.forEach((records, userId) => {
    // 按时间排序，保留最近10条
    const sortedRecords = records
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    cleanedRecords.push(...sortedRecords);
  });

  // 更新全局数组
  gachaRecords = cleanedRecords;
  
  // 保存到文件
  await gachaRecordStorage.save(gachaRecords);
  
  console.log(`抽卡记录清理完成，保留了 ${cleanedRecords.length} 条记录`);
}

// 加载用户相关的动态数据
async function loadAllData(): Promise<void> {
  if (isLoaded) return;

  try {
    [userItems, gachaRecords, userTickets, ticketRecords, userEquipment] = await Promise.all([
      userItemStorage.load(),
      gachaRecordStorage.load(),
      userTicketStorage.load(),
      ticketRecordStorage.load(),
      userEquipmentStorage.load()
    ]);

    // 加载完成后清理抽卡记录
    await cleanupAllGachaRecords();

    isLoaded = true;
    console.log('用户数据加载完成');
  } catch (error) {
    console.error('加载用户数据失败:', error);
    throw error;
  }
}

// 道具数据库操作（从配置文件读取）
export const itemDb = {
  async findAll(): Promise<Item[]> {
    await ItemConfigManager.checkAndReload();
    return ItemConfigManager.getItems();
  },

  async findById(id: string): Promise<Item | null> {
    await ItemConfigManager.checkAndReload();
    return ItemConfigManager.getItemById(id);
  },

  async findByType(type: ItemType): Promise<Item[]> {
    await ItemConfigManager.checkAndReload();
    return ItemConfigManager.getItemsByType(type);
  },

  async findByRarity(rarity: ItemRarity): Promise<Item[]> {
    await ItemConfigManager.checkAndReload();
    return ItemConfigManager.getItemsByRarity(rarity);
  },

  async findActive(): Promise<Item[]> {
    await ItemConfigManager.checkAndReload();
    return ItemConfigManager.getActiveItems();
  },

  async create(itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Promise<Item> {
    // 配置文件模式下，创建道具需要更新配置文件
    const items = await this.findAll();
    const newItem: Item = {
      id: generateId(),
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    await ItemConfigManager.updateConfig(items);
    return newItem;
  },

  async update(id: string, updateData: Partial<Omit<Item, 'id' | 'createdAt'>>): Promise<Item | null> {
    const items = await this.findAll();
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return null;
    }

    const updatedItem = {
      ...items[itemIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    items[itemIndex] = updatedItem;
    await ItemConfigManager.updateConfig(items);
    return updatedItem;
  },

  async delete(id: string): Promise<boolean> {
    const items = await this.findAll();
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return false;
    }

    items.splice(itemIndex, 1);
    await ItemConfigManager.updateConfig(items);
    return true;
  }
};

// 用户道具数据库操作
export const userItemDb = {
  async findByUserId(userId: string): Promise<UserItem[]> {
    await loadAllData();
    const userItemList = userItems.filter(ui => ui.userId === userId);
    
    // 关联道具信息（从配置文件获取）
    const result = [];
    for (const ui of userItemList) {
      const item = await ItemConfigManager.getItemById(ui.itemId);
      result.push({
        ...ui,
        item
      });
    }
    return result;
  },

  async findByUserIdAndItemId(userId: string, itemId: string): Promise<UserItem | null> {
    await loadAllData();
    const userItem = userItems.find(ui => ui.userId === userId && ui.itemId === itemId);
    if (!userItem) return null;

    // 从配置文件获取道具信息
    const item = await ItemConfigManager.getItemById(userItem.itemId);
    return {
      ...userItem,
      item
    };
  },

  async create(userItemData: Omit<UserItem, 'id'>): Promise<UserItem> {
    await loadAllData();
    const userItem: UserItem = {
      id: generateId(),
      ...userItemData
    };
    userItems.push(userItem);
    await userItemStorage.save(userItems);
    return userItem;
  },

  async updateEquipStatus(userId: string, itemId: string, isEquipped: boolean): Promise<UserItem | null> {
    await loadAllData();
    const index = userItems.findIndex(ui => ui.userId === userId && ui.itemId === itemId);
    if (index === -1) return null;

    userItems[index].isEquipped = isEquipped;
    await userItemStorage.save(userItems);
    return userItems[index];
  },

  async hasItem(userId: string, itemId: string): Promise<boolean> {
    await loadAllData();
    return userItems.some(ui => ui.userId === userId && ui.itemId === itemId);
  }
};

// 卡池数据库操作（从配置文件读取）
export const gachaPoolDb = {
  async findAll(): Promise<GachaPool[]> {
    await PoolConfigManager.checkAndReload();
    return PoolConfigManager.getPools();
  },

  async findById(id: string): Promise<GachaPool | null> {
    await PoolConfigManager.checkAndReload();
    return PoolConfigManager.getPoolById(id);
  },

  async findActive(): Promise<GachaPool[]> {
    await PoolConfigManager.checkAndReload();
    return PoolConfigManager.getActivePools();
  },

  async create(poolData: Omit<GachaPool, 'id' | 'createdAt' | 'updatedAt'>): Promise<GachaPool> {
    // 配置文件模式下，创建卡池需要更新配置文件
    const pools = await this.findAll();
    const newPool: GachaPool = {
      id: generateId(),
      ...poolData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    pools.push(newPool);
    await PoolConfigManager.updateConfig(pools);
    return newPool;
  },

  async update(id: string, updateData: Partial<Omit<GachaPool, 'id' | 'createdAt'>>): Promise<GachaPool | null> {
    const pools = await this.findAll();
    const poolIndex = pools.findIndex(pool => pool.id === id);
    if (poolIndex === -1) {
      return null;
    }

    const updatedPool = {
      ...pools[poolIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    pools[poolIndex] = updatedPool;
    await PoolConfigManager.updateConfig(pools);
    return updatedPool;
  },

  async delete(id: string): Promise<boolean> {
    const pools = await this.findAll();
    const poolIndex = pools.findIndex(pool => pool.id === id);
    if (poolIndex === -1) {
      return false;
    }

    pools.splice(poolIndex, 1);
    await PoolConfigManager.updateConfig(pools);
    return true;
  }
};

// 抽卡记录数据库操作
export const gachaRecordDb = {
  async findByUserId(userId: string, limit?: number): Promise<GachaRecord[]> {
    await loadAllData();
    let records = gachaRecords
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (limit) {
      records = records.slice(0, limit);
    }

    // 关联道具和卡池信息（从配置文件获取）
    const result = [];
    for (const record of records) {
      const item = await ItemConfigManager.getItemById(record.itemId);
      const pool = await PoolConfigManager.getPoolById(record.poolId);
      result.push({
        ...record,
        item,
        pool
      });
    }
    return result;
  },

  async create(recordData: Omit<GachaRecord, 'id' | 'createdAt'>): Promise<GachaRecord> {
    await loadAllData();
    const record: GachaRecord = {
      id: generateId(),
      ...recordData,
      createdAt: new Date().toISOString()
    };
    
    // 添加新记录
    gachaRecords.push(record);
    
    // 清理该用户的旧记录，只保留最近10条
    await this.cleanupUserRecords(recordData.userId);
    
    await gachaRecordStorage.save(gachaRecords);
    return record;
  },

  // 清理用户记录，只保留最近10条
  async cleanupUserRecords(userId: string): Promise<void> {
    const userRecords = gachaRecords
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (userRecords.length > 10) {
      // 获取需要保留的记录ID
      const keepRecordIds = new Set(userRecords.slice(0, 10).map(r => r.id));
      
      // 从全局数组中移除该用户的旧记录
      gachaRecords = gachaRecords.filter(record => 
        record.userId !== userId || keepRecordIds.has(record.id)
      );
    }
  },

  async findByBatchId(batchId: string): Promise<GachaRecord[]> {
    await loadAllData();
    const records = gachaRecords.filter(record => record.batchId === batchId);
    
    // 关联道具和卡池信息（从配置文件获取）
    const result = [];
    for (const record of records) {
      const item = await ItemConfigManager.getItemById(record.itemId);
      const pool = await PoolConfigManager.getPoolById(record.poolId);
      result.push({
        ...record,
        item,
        pool
      });
    }
    return result;
  }
};

// 用户抽卡次数数据库操作
export const userTicketDb = {
  async findByUserId(userId: string): Promise<UserGachaTickets | null> {
    await loadAllData();
    return userTickets.find(ut => ut.userId === userId) || null;
  },

  async createOrUpdate(userId: string, ticketData: Partial<Omit<UserGachaTickets, 'userId'>>): Promise<UserGachaTickets> {
    await loadAllData();
    const index = userTickets.findIndex(ut => ut.userId === userId);
    
    if (index === -1) {
      // 创建新记录
      const newTickets: UserGachaTickets = {
        userId,
        tickets: ticketData.tickets || 0,
        totalEarned: ticketData.totalEarned || 0,
        totalUsed: ticketData.totalUsed || 0,
        lastUpdated: new Date().toISOString()
      };
      userTickets.push(newTickets);
      await userTicketStorage.save(userTickets);
      return newTickets;
    } else {
      // 更新现有记录
      userTickets[index] = {
        ...userTickets[index],
        ...ticketData,
        lastUpdated: new Date().toISOString()
      };
      await userTicketStorage.save(userTickets);
      return userTickets[index];
    }
  },

  async addTickets(userId: string, amount: number): Promise<UserGachaTickets> {
    const current = await this.findByUserId(userId);
    const tickets = (current?.tickets || 0) + amount;
    const totalEarned = (current?.totalEarned || 0) + amount;
    
    return this.createOrUpdate(userId, {
      tickets,
      totalEarned
    });
  },

  async useTickets(userId: string, amount: number): Promise<UserGachaTickets | null> {
    const current = await this.findByUserId(userId);
    if (!current || current.tickets < amount) {
      return null; // 抽卡次数不足
    }

    const tickets = current.tickets - amount;
    const totalUsed = current.totalUsed + amount;
    
    return this.createOrUpdate(userId, {
      tickets,
      totalUsed
    });
  }
};

// 抽卡次数记录数据库操作
export const ticketRecordDb = {
  async findByUserId(userId: string, limit?: number): Promise<GachaTicketRecord[]> {
    await loadAllData();
    let records = ticketRecords
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (limit) {
      records = records.slice(0, limit);
    }

    return records;
  },

  async create(recordData: Omit<GachaTicketRecord, 'id' | 'createdAt'>): Promise<GachaTicketRecord> {
    await loadAllData();
    const record: GachaTicketRecord = {
      id: generateId(),
      ...recordData,
      createdAt: new Date().toISOString()
    };
    ticketRecords.push(record);
    await ticketRecordStorage.save(ticketRecords);
    return record;
  }
};

// 用户装备数据库操作
export const userEquipmentDb = {
  async findByUserId(userId: string): Promise<UserEquipment | null> {
    await loadAllData();
    return userEquipment.find(ue => ue.userId === userId) || null;
  },

  async createOrUpdate(userId: string, equipmentData: Partial<Omit<UserEquipment, 'userId'>>): Promise<UserEquipment> {
    await loadAllData();
    const index = userEquipment.findIndex(ue => ue.userId === userId);
    
    if (index === -1) {
      // 创建新记录
      const newEquipment: UserEquipment = {
        userId,
        ...equipmentData,
        updatedAt: new Date().toISOString()
      };
      userEquipment.push(newEquipment);
      await userEquipmentStorage.save(userEquipment);
      return newEquipment;
    } else {
      // 更新现有记录
      userEquipment[index] = {
        ...userEquipment[index],
        ...equipmentData,
        updatedAt: new Date().toISOString()
      };
      await userEquipmentStorage.save(userEquipment);
      return userEquipment[index];
    }
  }
};

// 初始化抽卡系统数据
export async function initializeGachaData(): Promise<void> {
  await loadAllData();
  await ItemConfigManager.initialize();
  await PoolConfigManager.initialize();
  console.log('抽卡系统数据初始化完成');
}