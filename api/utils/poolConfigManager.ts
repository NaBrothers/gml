// 卡池配置管理器
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GachaPool, GachaPoolItem } from '../../shared/types.js';
import { getItemById } from './itemConfigManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件路径
const CONFIG_DIR = path.join(__dirname, '../../config');
const POOLS_CONFIG_FILE = path.join(CONFIG_DIR, 'gachaPools.conf');

// 配置缓存
interface ConfigCache {
  pools: GachaPool[];
  lastModified: number;
}

let configCache: ConfigCache = {
  pools: [],
  lastModified: 0
};

// 解析.conf文件
function parsePoolsConfig(filePath: string): GachaPool[] {
  if (!fs.existsSync(filePath)) {
    console.log('卡池配置文件不存在，返回空数组');
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const poolsMap = new Map<string, Partial<GachaPool>>();
  const poolItemsMap = new Map<string, GachaPoolItem[]>();

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // 跳过注释和空行
    if (trimmedLine.startsWith('#') || trimmedLine === '') {
      continue;
    }

    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }

    const key = trimmedLine.substring(0, equalIndex).trim();
    const value = trimmedLine.substring(equalIndex + 1).trim();

    // 解析卡池基本信息
    if (key.startsWith('POOL_') && !key.includes('_ITEM_')) {
      const poolId = key.replace('POOL_', '');
      const parts = value.split(',');
      
      if (parts.length >= 3) {
        const pool: Partial<GachaPool> = {
          id: poolId,
          name: parts[0].trim(),
          description: parts[1].trim(),
          isActive: parts[2].trim() === 'true',
          startTime: parts[3] ? parts[3].trim() : undefined,
          endTime: parts[4] ? parts[4].trim() : undefined,
          bannerImageUrl: parts[5] ? parts[5].trim() : undefined,
          createdAt: new Date().toISOString(), // 兼容性字段
          updatedAt: new Date().toISOString()  // 兼容性字段
        };
        poolsMap.set(poolId, pool);
      }
    }
    
    // 解析卡池道具配置
    else if (key.includes('_ITEM_')) {
      const match = key.match(/^POOL_(.+)_ITEM_\d+$/);
      if (match) {
        const poolId = match[1];
        const parts = value.split(',');
        
        if (parts.length >= 2) {
          const poolItem: GachaPoolItem = {
            itemId: parts[0].trim(),
            weight: parseInt(parts[1].trim())
          };
          
          if (!poolItemsMap.has(poolId)) {
            poolItemsMap.set(poolId, []);
          }
          poolItemsMap.get(poolId)!.push(poolItem);
        }
      }
    }
  }

  // 组合卡池数据
  const pools: GachaPool[] = [];
  for (const [poolId, poolData] of poolsMap) {
    const items = poolItemsMap.get(poolId) || [];
    
    // 为每个道具添加关联的道具信息
    const itemsWithDetails = items.map(poolItem => ({
      ...poolItem,
      item: getItemById(poolItem.itemId)
    }));

    const pool: GachaPool = {
      ...poolData,
      items: itemsWithDetails
    } as GachaPool;
    
    pools.push(pool);
  }

  console.log(`卡池配置解析完成，共 ${pools.length} 个卡池`);
  return pools;
}

// 生成卡池配置文件内容
function generatePoolsConfigContent(pools: GachaPool[]): string {
  let content = `# 卡池配置文件
# 格式: POOL_[ID]=[name],[description],[isActive],[startTime],[endTime],[bannerImageUrl]
# 格式: POOL_[ID]_ITEM_[INDEX]=[itemId],[weight]

`;

  for (const pool of pools) {
    // 生成卡池基本信息
    const startTime = pool.startTime || '';
    const endTime = pool.endTime || '';
    const bannerImageUrl = pool.bannerImageUrl || '';
    
    content += `# ${pool.name}\n`;
    content += `POOL_${pool.id}=${pool.name},${pool.description},${pool.isActive},${startTime},${endTime},${bannerImageUrl}\n\n`;
    
    // 生成卡池道具配置
    content += `# ${pool.name}道具配置\n`;
    
    // 按稀有度分组显示
    const ssrItems = pool.items.filter(item => item.item?.rarity === 'SSR');
    const srItems = pool.items.filter(item => item.item?.rarity === 'SR');
    const rItems = pool.items.filter(item => item.item?.rarity === 'R');
    
    let itemIndex = 1;
    
    if (ssrItems.length > 0) {
      content += `# SSR 道具 (权重 ${ssrItems[0]?.weight || 'N/A'})\n`;
      for (const item of ssrItems) {
        content += `POOL_${pool.id}_ITEM_${itemIndex.toString().padStart(2, '0')}=${item.itemId},${item.weight}\n`;
        itemIndex++;
      }
      content += '\n';
    }
    
    if (srItems.length > 0) {
      content += `# SR 道具 (权重 ${srItems[0]?.weight || 'N/A'})\n`;
      for (const item of srItems) {
        content += `POOL_${pool.id}_ITEM_${itemIndex.toString().padStart(2, '0')}=${item.itemId},${item.weight}\n`;
        itemIndex++;
      }
      content += '\n';
    }
    
    if (rItems.length > 0) {
      content += `# R 道具 (权重 ${rItems[0]?.weight || 'N/A'})\n`;
      for (const item of rItems) {
        content += `POOL_${pool.id}_ITEM_${itemIndex.toString().padStart(2, '0')}=${item.itemId},${item.weight}\n`;
        itemIndex++;
      }
      content += '\n';
    }
  }

  return content;
}

// 保存配置到文件
async function saveConfig(pools: GachaPool[]): Promise<void> {
  try {
    const content = generatePoolsConfigContent(pools);
    fs.writeFileSync(POOLS_CONFIG_FILE, content, 'utf-8');
    console.log('卡池配置保存成功');
  } catch (error) {
    console.error('保存卡池配置失败:', error);
    throw error;
  }
}

// 加载配置文件
async function loadConfig(force: boolean = false): Promise<void> {
  try {
    // 检查文件修改时间
    const stats = fs.existsSync(POOLS_CONFIG_FILE) ? fs.statSync(POOLS_CONFIG_FILE) : null;
    const fileModified = stats?.mtimeMs || 0;

    // 如果不是强制加载且文件没有修改，跳过加载
    if (!force && configCache.lastModified === fileModified) {
      return;
    }

    console.log('加载卡池配置文件...');
    configCache.pools = parsePoolsConfig(POOLS_CONFIG_FILE);
    configCache.lastModified = fileModified;
    console.log('卡池配置加载完成');
  } catch (error) {
    console.error('加载卡池配置失败:', error);
    throw error;
  }
}

// 卡池配置管理器类
export class PoolConfigManager {
  // 初始化配置管理器
  static async initialize(): Promise<void> {
    await loadConfig(true);
    console.log('卡池配置管理器初始化完成');
  }

  // 获取所有卡池配置
  static getPools(): GachaPool[] {
    if (!configCache.pools || configCache.pools.length === 0) {
      console.warn('卡池配置未加载，返回空数组');
      return [];
    }
    return [...configCache.pools];
  }

  // 根据ID获取卡池
  static getPoolById(id: string): GachaPool | null {
    const pools = this.getPools();
    return pools.find(pool => pool.id === id) || null;
  }

  // 获取激活的卡池
  static getActivePools(): GachaPool[] {
    const pools = this.getPools();
    return pools.filter(pool => pool.isActive);
  }

  // 更新配置
  static async updateConfig(pools: GachaPool[]): Promise<void> {
    await saveConfig(pools);
    await this.reloadConfig();
  }

  // 重新加载配置
  static async reloadConfig(): Promise<void> {
    await loadConfig(true);
  }

  // 检查并重新加载配置（热重载）
  static async checkAndReload(): Promise<void> {
    await loadConfig(false);
  }
}

// 导出便捷函数
export const getPools = () => PoolConfigManager.getPools();
export const getPoolById = (id: string) => PoolConfigManager.getPoolById(id);
export const getActivePools = () => PoolConfigManager.getActivePools();
export const updatePoolsConfig = (pools: GachaPool[]) => PoolConfigManager.updateConfig(pools);
export const reloadPoolsConfig = () => PoolConfigManager.reloadConfig();

// 初始化配置管理器
PoolConfigManager.initialize().catch(console.error);