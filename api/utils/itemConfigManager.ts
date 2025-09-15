// 道具配置管理器
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Item, ItemType, ItemRarity } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件路径
const CONFIG_DIR = path.join(__dirname, '../../config');
const ITEMS_CONFIG_FILE = path.join(CONFIG_DIR, 'items.conf');

// 配置缓存
interface ConfigCache {
  items: Item[];
  lastModified: number;
}

let configCache: ConfigCache = {
  items: [],
  lastModified: 0
};

// 解析.conf文件
function parseItemsConfig(filePath: string): Item[] {
  if (!fs.existsSync(filePath)) {
    console.log('道具配置文件不存在，返回空数组');
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const items: Item[] = [];

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

    // 解析道具配置
    if (key.startsWith('ITEM_')) {
      const itemId = key.replace('ITEM_', '');
      const parts = value.split(',');
      
      if (parts.length >= 6) {
        const item: Item = {
          id: itemId,
          name: parts[0].trim(),
          description: parts[1].trim(),
          type: parts[2].trim() as ItemType,
          rarity: parts[3].trim() as ItemRarity,
          imageUrl: parts[4].trim(),
          thumbnailUrl: parts[5].trim() || undefined,
          isActive: parts[6] ? parts[6].trim() === 'true' : true,
          createdAt: new Date().toISOString(), // 兼容性字段
          updatedAt: new Date().toISOString()  // 兼容性字段
        };
        items.push(item);
      }
    }
  }

  console.log(`道具配置解析完成，共 ${items.length} 个道具`);
  return items;
}

// 生成道具配置文件内容
function generateItemsConfigContent(items: Item[]): string {
  let content = `# 道具配置文件
# 格式: ITEM_[ID]=[name],[description],[type],[rarity],[imageUrl],[thumbnailUrl],[isActive]
# 道具类型: home_illustration, avatar_frame, profile_banner, theme, decoration
# 稀有度: R, SR, SSR

`;

  // 按稀有度分组
  const rarityGroups = {
    SSR: items.filter(item => item.rarity === ItemRarity.SSR),
    SR: items.filter(item => item.rarity === ItemRarity.SR),
    R: items.filter(item => item.rarity === ItemRarity.R)
  };

  for (const [rarity, rarityItems] of Object.entries(rarityGroups)) {
    if (rarityItems.length > 0) {
      const rarityName = rarity === 'SSR' ? '超稀有' : rarity === 'SR' ? '稀有' : '普通';
      content += `# ${rarity} 道具 (${rarityName})\n`;
      
      for (const item of rarityItems) {
        const thumbnailUrl = item.thumbnailUrl || '';
        content += `ITEM_${item.id}=${item.name},${item.description},${item.type},${item.rarity},${item.imageUrl},${thumbnailUrl},${item.isActive}\n`;
      }
      content += '\n';
    }
  }

  return content;
}

// 保存配置到文件
async function saveConfig(items: Item[]): Promise<void> {
  try {
    const content = generateItemsConfigContent(items);
    fs.writeFileSync(ITEMS_CONFIG_FILE, content, 'utf-8');
    console.log('道具配置保存成功');
  } catch (error) {
    console.error('保存道具配置失败:', error);
    throw error;
  }
}

// 加载配置文件
async function loadConfig(force: boolean = false): Promise<void> {
  try {
    // 检查文件修改时间
    const stats = fs.existsSync(ITEMS_CONFIG_FILE) ? fs.statSync(ITEMS_CONFIG_FILE) : null;
    const fileModified = stats?.mtimeMs || 0;

    // 如果不是强制加载且文件没有修改，跳过加载
    if (!force && configCache.lastModified === fileModified) {
      return;
    }

    console.log('加载道具配置文件...');
    configCache.items = parseItemsConfig(ITEMS_CONFIG_FILE);
    configCache.lastModified = fileModified;
    console.log('道具配置加载完成');
  } catch (error) {
    console.error('加载道具配置失败:', error);
    throw error;
  }
}

// 道具配置管理器类
export class ItemConfigManager {
  // 初始化配置管理器
  static async initialize(): Promise<void> {
    await loadConfig(true);
    console.log('道具配置管理器初始化完成');
  }

  // 获取所有道具配置
  static getItems(): Item[] {
    if (!configCache.items || configCache.items.length === 0) {
      console.warn('道具配置未加载，返回空数组');
      return [];
    }
    return [...configCache.items];
  }

  // 根据ID获取道具
  static getItemById(id: string): Item | null {
    const items = this.getItems();
    return items.find(item => item.id === id) || null;
  }

  // 根据类型获取道具
  static getItemsByType(type: ItemType): Item[] {
    const items = this.getItems();
    return items.filter(item => item.type === type);
  }

  // 根据稀有度获取道具
  static getItemsByRarity(rarity: ItemRarity): Item[] {
    const items = this.getItems();
    return items.filter(item => item.rarity === rarity);
  }

  // 获取激活的道具
  static getActiveItems(): Item[] {
    const items = this.getItems();
    return items.filter(item => item.isActive);
  }

  // 更新配置
  static async updateConfig(items: Item[]): Promise<void> {
    await saveConfig(items);
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
export const getItems = () => ItemConfigManager.getItems();
export const getItemById = (id: string) => ItemConfigManager.getItemById(id);
export const getItemsByType = (type: ItemType) => ItemConfigManager.getItemsByType(type);
export const getItemsByRarity = (rarity: ItemRarity) => ItemConfigManager.getItemsByRarity(rarity);
export const getActiveItems = () => ItemConfigManager.getActiveItems();
export const updateItemsConfig = (items: Item[]) => ItemConfigManager.updateConfig(items);
export const reloadItemsConfig = () => ItemConfigManager.reloadConfig();

// 初始化配置管理器
ItemConfigManager.initialize().catch(console.error);