// 段位配置数据 - 已迁移到后端配置文件
// 前端通过API获取段位配置，这里保留简化版本用于向后兼容
// 实际配置从 /api/config/public/ranks 接口获取（公开接口，无需认证）

import { RankConfig } from '../../shared/types';

// 缓存的段位配置
let cachedRankConfigs: RankConfig[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 从API获取段位配置
async function fetchRankConfigs(): Promise<RankConfig[]> {
  try {
    // 优先使用公开API（无需认证）
    let response = await fetch('/api/config/public/ranks');
    
    // 如果公开API失败，尝试使用认证API
    if (!response.ok) {
      const token = localStorage.getItem('auth_token'); // 修复：使用正确的token key
      if (token) {
        response = await fetch('/api/config/ranks', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    }
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        cachedRankConfigs = result.data;
        lastFetchTime = Date.now();
        console.log('段位配置获取成功，共', result.data.length, '个段位');
        return result.data;
      }
    } else {
      console.warn('段位配置API调用失败:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('获取段位配置失败:', error);
  }
  
  // 如果API调用失败，返回缓存的配置或默认配置
  const fallbackConfig = cachedRankConfigs.length > 0 ? cachedRankConfigs : getDefaultRankConfigs();
  console.log('使用后备段位配置，共', fallbackConfig.length, '个段位');
  return fallbackConfig;
}

// 获取段位配置（带缓存）
export async function getRankConfigs(): Promise<RankConfig[]> {
  const now = Date.now();
  
  // 如果缓存有效，直接返回缓存
  if (cachedRankConfigs.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRankConfigs;
  }
  
  // 否则从API获取
  return await fetchRankConfigs();
}

// 同步获取段位配置（使用缓存）
export function getRankConfigsSync(): RankConfig[] {
  // 如果缓存为空，先尝试异步获取（不等待结果）
  if (cachedRankConfigs.length === 0) {
    console.warn('段位配置缓存为空，尝试异步获取配置');
    fetchRankConfigs().catch(console.error);
    // 返回默认配置作为临时方案
    return getDefaultRankConfigs();
  }
  return cachedRankConfigs;
}

// 默认段位配置（作为后备）
function getDefaultRankConfigs(): RankConfig[] {
  return [
    // 这里只保留几个基础段位作为后备
    { id: 1, rankName: '雀之气一段', minPoints: 0, maxPoints: 99, promotionBonus: 0, demotionPenalty: 0, rankOrder: 1, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
    { id: 19, rankName: '雀师一段', minPoints: 1800, maxPoints: 1899, promotionBonus: 0, demotionPenalty: 0, rankOrder: 19, majorRank: '雀师', minorRankType: 'dan', minorRankRange: [1, 9] },
    { id: 91, rankName: '雀帝', minPoints: 9000, maxPoints: 9999999, promotionBonus: 0, demotionPenalty: 0, rankOrder: 91, majorRank: '雀帝', minorRankType: 'none', minorRankRange: [0, 0] }
  ];
}

// 兼容性导出 - 为了向后兼容，导出一个同步的rankConfigs
export const rankConfigs = getDefaultRankConfigs();

// 兼容性函数 - 根据段位等级获取段位名称
export const getRankNameByLevel = (rankLevel: number): string => {
  const configs = getRankConfigsSync();
  const config = configs.find(c => c.rankOrder === rankLevel);
  return config ? config.rankName : '未知段位';
};

// 初始化段位配置缓存
export async function initializeRankConfigs(): Promise<void> {
  await fetchRankConfigs();
}