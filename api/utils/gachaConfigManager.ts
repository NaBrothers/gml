// 抽卡系统配置管理器
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GachaConfig, ItemRarity } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置文件路径
const CONFIG_DIR = path.join(__dirname, '../../config');
const GACHA_CONFIG_FILE = path.join(CONFIG_DIR, 'gacha.conf');

// 配置缓存
interface ConfigCache {
  gacha: GachaConfig;
  lastModified: number;
}

let configCache: ConfigCache = {
  gacha: {} as GachaConfig,
  lastModified: 0
};

// 默认抽卡配置
const DEFAULT_GACHA_CONFIG: GachaConfig = {
  rarityRates: {
    [ItemRarity.R]: 85,    // 85%
    [ItemRarity.SR]: 13,   // 13%
    [ItemRarity.SSR]: 2    // 2%
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
      1: 4,  // 第一名4次
      2: 3,  // 第二名3次
      3: 2,  // 第三名2次
      4: 1   // 第四名1次
    }
  },
  maxTicketsPerUser: 999,
  duplicateItemHandling: 'ignore'
};

// 解析.conf文件
function parseGachaConfig(filePath: string): GachaConfig {
  if (!fs.existsSync(filePath)) {
    console.log('抽卡配置文件不存在，使用默认配置');
    return DEFAULT_GACHA_CONFIG;
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
    } else if (!isNaN(Number(value)) && value !== '') {
      config[key] = Number(value);
    } else {
      config[key] = value;
    }
  }

  // 构建GachaConfig对象
  const gachaConfig: GachaConfig = {
    rarityRates: {
      [ItemRarity.R]: config.RARITY_RATE_R || DEFAULT_GACHA_CONFIG.rarityRates[ItemRarity.R],
      [ItemRarity.SR]: config.RARITY_RATE_SR || DEFAULT_GACHA_CONFIG.rarityRates[ItemRarity.SR],
      [ItemRarity.SSR]: config.RARITY_RATE_SSR || DEFAULT_GACHA_CONFIG.rarityRates[ItemRarity.SSR]
    },
    guaranteeConfig: {
      tenPullGuaranteeSR: config.TEN_PULL_GUARANTEE_SR !== undefined ? config.TEN_PULL_GUARANTEE_SR : DEFAULT_GACHA_CONFIG.guaranteeConfig.tenPullGuaranteeSR,
      pitySystemEnabled: config.PITY_SYSTEM_ENABLED !== undefined ? config.PITY_SYSTEM_ENABLED : DEFAULT_GACHA_CONFIG.guaranteeConfig.pitySystemEnabled,
      srPityCount: config.SR_PITY_COUNT || DEFAULT_GACHA_CONFIG.guaranteeConfig.srPityCount,
      ssrPityCount: config.SSR_PITY_COUNT || DEFAULT_GACHA_CONFIG.guaranteeConfig.ssrPityCount
    },
    gameRewardConfig: {
      enabled: config.GAME_REWARD_ENABLED !== undefined ? config.GAME_REWARD_ENABLED : DEFAULT_GACHA_CONFIG.gameRewardConfig.enabled,
      rewardsByPosition: {
        1: config.REWARD_POSITION_1 || DEFAULT_GACHA_CONFIG.gameRewardConfig.rewardsByPosition[1],
        2: config.REWARD_POSITION_2 || DEFAULT_GACHA_CONFIG.gameRewardConfig.rewardsByPosition[2],
        3: config.REWARD_POSITION_3 || DEFAULT_GACHA_CONFIG.gameRewardConfig.rewardsByPosition[3],
        4: config.REWARD_POSITION_4 || DEFAULT_GACHA_CONFIG.gameRewardConfig.rewardsByPosition[4]
      }
    },
    maxTicketsPerUser: config.MAX_TICKETS_PER_USER || DEFAULT_GACHA_CONFIG.maxTicketsPerUser,
    duplicateItemHandling: config.DUPLICATE_ITEM_HANDLING || DEFAULT_GACHA_CONFIG.duplicateItemHandling
  };

  return gachaConfig;
}

// 生成抽卡配置文件内容
function generateGachaConfigContent(config: GachaConfig): string {
  return `# 抽卡系统配置文件
# 格式: key=value
# 注释以#开头

# 稀有度概率配置（百分比）
RARITY_RATE_R=${config.rarityRates[ItemRarity.R]}
RARITY_RATE_SR=${config.rarityRates[ItemRarity.SR]}
RARITY_RATE_SSR=${config.rarityRates[ItemRarity.SSR]}

# 保底配置
TEN_PULL_GUARANTEE_SR=${config.guaranteeConfig.tenPullGuaranteeSR}
PITY_SYSTEM_ENABLED=${config.guaranteeConfig.pitySystemEnabled}
SR_PITY_COUNT=${config.guaranteeConfig.srPityCount}
SSR_PITY_COUNT=${config.guaranteeConfig.ssrPityCount}

# 游戏奖励配置
GAME_REWARD_ENABLED=${config.gameRewardConfig.enabled}
REWARD_POSITION_1=${config.gameRewardConfig.rewardsByPosition[1]}
REWARD_POSITION_2=${config.gameRewardConfig.rewardsByPosition[2]}
REWARD_POSITION_3=${config.gameRewardConfig.rewardsByPosition[3]}
REWARD_POSITION_4=${config.gameRewardConfig.rewardsByPosition[4]}

# 其他配置
MAX_TICKETS_PER_USER=${config.maxTicketsPerUser}
DUPLICATE_ITEM_HANDLING=${config.duplicateItemHandling}`;
}

// 加载配置
async function loadConfig(force: boolean = false): Promise<void> {
  try {
    // 确保配置目录存在
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    // 检查文件修改时间
    let gachaModified = 0;
    if (fs.existsSync(GACHA_CONFIG_FILE)) {
      const gachaStats = fs.statSync(GACHA_CONFIG_FILE);
      gachaModified = gachaStats.mtime.getTime();
    }

    // 加载抽卡配置
    if (force || configCache.lastModified !== gachaModified) {
      configCache.gacha = parseGachaConfig(GACHA_CONFIG_FILE);
      configCache.lastModified = gachaModified;
      console.log('抽卡配置加载完成');
    }

  } catch (error) {
    console.error('加载抽卡配置失败:', error);
    // 使用默认配置
    configCache.gacha = DEFAULT_GACHA_CONFIG;
    configCache.lastModified = 0;
  }
}

// 保存配置
async function saveConfig(config: GachaConfig): Promise<void> {
  try {
    // 确保配置目录存在
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    const content = generateGachaConfigContent(config);
    fs.writeFileSync(GACHA_CONFIG_FILE, content, 'utf-8');
    
    console.log('抽卡配置保存成功');
  } catch (error) {
    console.error('保存抽卡配置失败:', error);
    throw error;
  }
}

// 抽卡配置管理器类
export class GachaConfigManager {
  // 初始化配置管理器
  static async initialize(): Promise<void> {
    await loadConfig(true);
    console.log('抽卡配置管理器初始化完成');
  }

  // 获取抽卡配置
  static getGachaConfig(): GachaConfig {
    if (!configCache.gacha || Object.keys(configCache.gacha).length === 0) {
      console.warn('抽卡配置未加载，使用默认配置');
      return DEFAULT_GACHA_CONFIG;
    }
    return configCache.gacha;
  }

  // 更新配置
  static async updateConfig(config: GachaConfig): Promise<void> {
    await saveConfig(config);
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
export const getGachaConfig = () => GachaConfigManager.getGachaConfig();
export const updateGachaConfig = (config: GachaConfig) => GachaConfigManager.updateConfig(config);
export const reloadGachaConfig = () => GachaConfigManager.reloadConfig();

// 初始化配置管理器
GachaConfigManager.initialize().catch(console.error);