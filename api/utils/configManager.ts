import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RankConfig } from '../../shared/types.js';

// 导入缓存失效函数
let invalidatePointsCache: (() => void) | null = null;

// 设置缓存失效回调函数
export function setPointsCacheInvalidator(invalidator: () => void): void {
  invalidatePointsCache = invalidator;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件路径
const CONFIG_DIR = path.join(__dirname, '../../config');

// 配置缓存
interface GameConfig {
  BASE_POINTS: number;
  TOTAL_POINTS: number;
  INITIAL_POINTS: number;
  UMA_POINTS: number[];
  DEFAULT_GAME_TYPE: string;
  MIN_PLAYERS: number;
  MAX_PLAYERS: number;
  NEWBIE_PROTECTION_MAX_RANK: number;
}



interface ConfigCache {
  game: GameConfig;
  ranks: RankConfig[];
  lastModified: { [key: string]: number };
}

let configCache: ConfigCache = {
  game: {} as GameConfig,
  ranks: [],
  lastModified: {}
};

// 解析.conf文件
function parseConfFile(filePath: string): { [key: string]: any } {
  if (!fs.existsSync(filePath)) {
    throw new Error(`配置文件不存在: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const config: { [key: string]: any } = {};

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

    // 解析不同类型的值
    if (value === 'true') {
      config[key] = true;
    } else if (value === 'false') {
      config[key] = false;
    } else if (!isNaN(Number(value))) {
      config[key] = Number(value);
    } else if (value.includes(',')) {
      // 处理数组值
      config[key] = value.split(',').map(v => {
        const trimmed = v.trim();
        return !isNaN(Number(trimmed)) ? Number(trimmed) : trimmed;
      });
    } else {
      config[key] = value;
    }
  }

  return config;
}

// 解析段位配置
function parseRanksConfig(filePath: string): RankConfig[] {
  const rawConfig = parseConfFile(filePath);
  const ranks: RankConfig[] = [];

  console.log('解析段位配置，原始配置键数量:', Object.keys(rawConfig).length);

  for (const [key, value] of Object.entries(rawConfig)) {
    if (key.startsWith('RANK_')) {
      // 配置解析器已经将逗号分隔的值解析为数组
      if (Array.isArray(value) && value.length === 10) {
        const rankId = parseInt(key.replace('RANK_', ''));
        const rank: RankConfig = {
          id: rankId,
          rankName: String(value[0]).trim(),
          minPoints: Number(value[1]),
          maxPoints: Number(value[2]),
          promotionBonus: Number(value[3]),
          demotionPenalty: Number(value[4]),
          rankOrder: Number(value[5]),
          majorRank: String(value[6]).trim(),
          minorRankType: String(value[7]).trim() as 'dan' | 'star' | 'none',
          minorRankRange: [Number(value[8]), Number(value[9])]
        };
        ranks.push(rank);
        console.log(`成功解析段位:`, rank.rankName);
      } else if (typeof value === 'string') {
        // 如果是字符串，按原来的方式解析
        const parts = value.split(',');
        if (parts.length === 10) {
          const rankId = parseInt(key.replace('RANK_', ''));
          const rank: RankConfig = {
            id: rankId,
            rankName: parts[0].trim(),
            minPoints: parseInt(parts[1].trim()),
            maxPoints: parseInt(parts[2].trim()),
            promotionBonus: parseInt(parts[3].trim()),
            demotionPenalty: parseInt(parts[4].trim()),
            rankOrder: parseInt(parts[5].trim()),
            majorRank: parts[6].trim(),
            minorRankType: parts[7].trim() as 'dan' | 'star' | 'none',
            minorRankRange: [parseInt(parts[8].trim()), parseInt(parts[9].trim())]
          };
          ranks.push(rank);
          console.log(`成功解析段位:`, rank.rankName);
        }
      }
    }
  }

  console.log('段位配置解析完成，共', ranks.length, '个段位');
  // 按rankOrder排序
  return ranks.sort((a, b) => a.rankOrder - b.rankOrder);
}

// 检查文件是否已修改
function isFileModified(filePath: string, lastModified: number): boolean {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.getTime() > lastModified;
  } catch (error) {
    return true; // 如果文件不存在或出错，认为需要重新加载
  }
}

// 加载配置文件
async function loadConfig(forceReload: boolean = false): Promise<void> {
  try {
    const gameConfigPath = path.join(CONFIG_DIR, 'game.conf');
    const ranksConfigPath = path.join(CONFIG_DIR, 'ranks.conf');

    // 检查文件是否被修改
    const gameModified = forceReload || isFileModified(gameConfigPath, configCache.lastModified.game || 0);
    const ranksModified = forceReload || isFileModified(ranksConfigPath, configCache.lastModified.ranks || 0);

    if (gameModified) {
      configCache.game = parseConfFile(gameConfigPath) as GameConfig;
      configCache.lastModified.game = fs.statSync(gameConfigPath).mtimeMs;
    }

    if (ranksModified) {
      configCache.ranks = parseRanksConfig(ranksConfigPath);
      configCache.lastModified.ranks = fs.statSync(ranksConfigPath).mtimeMs;
    }
  } catch (error) {
    console.error('加载配置文件失败:', error);
    throw error;
  }
}

// 保存配置到文件
async function saveConfig(configType: 'game' | 'ranks', config: any): Promise<void> {
  let filePath: string;
  let content: string;

  if (configType === 'game') {
    filePath = path.join(CONFIG_DIR, 'game.conf');
    content = generateGameConfigContent(config);
  } else if (configType === 'ranks') {
    filePath = path.join(CONFIG_DIR, 'ranks.conf');
    content = generateRanksConfigContent(config);
  } else {
    throw new Error(`不支持的配置类型: ${configType}`);
  }

  await fs.promises.writeFile(filePath, content, 'utf8');
}

// 生成游戏配置文件内容
function generateGameConfigContent(config: GameConfig): string {
  return `# 麻将游戏基础配置文件
# 格式: key=value
# 注释以#开头

# 基础游戏配置
BASE_POINTS=${config.BASE_POINTS}
TOTAL_POINTS=${config.TOTAL_POINTS}
INITIAL_POINTS=${config.INITIAL_POINTS}

# 马点配置 (1-4位的马点，用逗号分隔)
UMA_POINTS=${config.UMA_POINTS.join(',')}

# 游戏类型配置
DEFAULT_GAME_TYPE=${config.DEFAULT_GAME_TYPE}

# 其他游戏规则配置
MIN_PLAYERS=${config.MIN_PLAYERS}
MAX_PLAYERS=${config.MAX_PLAYERS}

# 新手保护配置
NEWBIE_PROTECTION_MAX_RANK=${config.NEWBIE_PROTECTION_MAX_RANK}`;
}



// 生成段位配置文件内容
function generateRanksConfigContent(ranks: RankConfig[]): string {
  let content = `# 段位系统配置文件
# 格式: RANK_[ID]=[rankName],[minPoints],[maxPoints],[promotionBonus],[demotionPenalty],[rankOrder],[majorRank],[minorRankType],[minorRankMin],[minorRankMax]

`;

  const groupedRanks = new Map<string, RankConfig[]>();
  
  // 按大段位分组
  for (const rank of ranks) {
    if (!groupedRanks.has(rank.majorRank)) {
      groupedRanks.set(rank.majorRank, []);
    }
    groupedRanks.get(rank.majorRank)!.push(rank);
  }

  // 生成配置内容
  for (const [majorRank, rankList] of groupedRanks) {
    const firstRank = rankList[0];
    const lastRank = rankList[rankList.length - 1];
    content += `# ${majorRank} (${firstRank.minPoints}-${lastRank.maxPoints}分)\n`;
    
    for (const rank of rankList) {
      content += `RANK_${rank.id}=${rank.rankName},${rank.minPoints},${rank.maxPoints},${rank.promotionBonus},${rank.demotionPenalty},${rank.rankOrder},${rank.majorRank},${rank.minorRankType},${rank.minorRankRange[0]},${rank.minorRankRange[1]}\n`;
    }
    content += '\n';
  }

  return content;
}

// 配置管理器类
export class ConfigManager {
  // 初始化配置管理器
  static async initialize(): Promise<void> {
    await loadConfig(true);
    console.log('配置管理器初始化完成');
  }

  // 获取游戏配置
  static getGameConfig(): GameConfig {
    if (!configCache.game || Object.keys(configCache.game).length === 0) {
      throw new Error('游戏配置未加载');
    }
    return configCache.game;
  }

  // 获取段位配置
  static getRanksConfig(): RankConfig[] {
    if (!configCache.ranks || configCache.ranks.length === 0) {
      throw new Error('段位配置未加载');
    }
    return configCache.ranks;
  }

  // 获取所有配置
  static getAllConfig() {
    return {
      game: this.getGameConfig(),
      ranks: this.getRanksConfig()
    };
  }

  // 更新配置
  static async updateConfig(configType: 'game' | 'ranks', config: any): Promise<void> {
    await saveConfig(configType, config);
    await this.reloadConfig();
    // 配置更新后，清空积分缓存
    if (invalidatePointsCache) {
      invalidatePointsCache();
    }
  }

  // 重新加载配置
  static async reloadConfig(): Promise<void> {
    await loadConfig(true);
    // 配置变更后，清空积分缓存
    if (invalidatePointsCache) {
      invalidatePointsCache();
    }
  }

  // 检查并自动重新加载配置（热重载）
  static async checkAndReload(): Promise<boolean> {
    try {
      const gameConfigPath = path.join(CONFIG_DIR, 'game.conf');
      const ranksConfigPath = path.join(CONFIG_DIR, 'ranks.conf');

      const gameModified = isFileModified(gameConfigPath, configCache.lastModified.game || 0);
      const ranksModified = isFileModified(ranksConfigPath, configCache.lastModified.ranks || 0);

      if (gameModified || ranksModified) {
        await loadConfig();
        return true;
      }
      return false;
    } catch (error) {
      console.error('检查配置文件失败:', error);
      return false;
    }
  }
}

// 导出便捷函数
export const getGameConfig = () => ConfigManager.getGameConfig();
export const getRanksConfig = () => ConfigManager.getRanksConfig();
export const getAllConfig = () => ConfigManager.getAllConfig();

// 兼容性导出（用于替换原有的硬编码常量）
export const getUmaPoints = () => ConfigManager.getGameConfig().UMA_POINTS;
export const getBasePoints = () => ConfigManager.getGameConfig().BASE_POINTS;
export const getTotalPoints = () => ConfigManager.getGameConfig().TOTAL_POINTS;
export const getInitialPoints = () => ConfigManager.getGameConfig().INITIAL_POINTS;
export const getNewbieProtectionMaxRank = () => ConfigManager.getGameConfig().NEWBIE_PROTECTION_MAX_RANK;