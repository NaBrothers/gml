// 调试段位匹配问题的测试脚本
// 由于ES模块导入问题，我们直接复制相关代码进行测试

// 段位配置数据
const rankConfigs = [
  // 雀之气 1-9段 (0-899分)
  { id: 1, rankName: '雀之气一段', minPoints: 0, maxPoints: 99, promotionBonus: 0, demotionPenalty: 0, rankOrder: 1, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 2, rankName: '雀之气二段', minPoints: 100, maxPoints: 199, promotionBonus: 0, demotionPenalty: 0, rankOrder: 2, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 3, rankName: '雀之气三段', minPoints: 200, maxPoints: 299, promotionBonus: 0, demotionPenalty: 0, rankOrder: 3, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 4, rankName: '雀之气四段', minPoints: 300, maxPoints: 399, promotionBonus: 0, demotionPenalty: 0, rankOrder: 4, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 5, rankName: '雀之气五段', minPoints: 400, maxPoints: 499, promotionBonus: 0, demotionPenalty: 0, rankOrder: 5, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 6, rankName: '雀之气六段', minPoints: 500, maxPoints: 599, promotionBonus: 0, demotionPenalty: 0, rankOrder: 6, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 7, rankName: '雀之气七段', minPoints: 600, maxPoints: 699, promotionBonus: 0, demotionPenalty: 0, rankOrder: 7, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 8, rankName: '雀之气八段', minPoints: 700, maxPoints: 799, promotionBonus: 0, demotionPenalty: 0, rankOrder: 8, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  { id: 9, rankName: '雀之气九段', minPoints: 800, maxPoints: 899, promotionBonus: 0, demotionPenalty: 0, rankOrder: 9, majorRank: '雀之气', minorRankType: 'dan', minorRankRange: [1, 9] },
  
  // 雀者 1-9星 (900-1799分)
  { id: 10, rankName: '一星雀者', minPoints: 900, maxPoints: 999, promotionBonus: 0, demotionPenalty: 0, rankOrder: 10, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 11, rankName: '二星雀者', minPoints: 1000, maxPoints: 1099, promotionBonus: 0, demotionPenalty: 0, rankOrder: 11, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 12, rankName: '三星雀者', minPoints: 1100, maxPoints: 1199, promotionBonus: 0, demotionPenalty: 0, rankOrder: 12, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 13, rankName: '四星雀者', minPoints: 1200, maxPoints: 1299, promotionBonus: 0, demotionPenalty: 0, rankOrder: 13, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 14, rankName: '五星雀者', minPoints: 1300, maxPoints: 1399, promotionBonus: 0, demotionPenalty: 0, rankOrder: 14, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 15, rankName: '六星雀者', minPoints: 1400, maxPoints: 1499, promotionBonus: 0, demotionPenalty: 0, rankOrder: 15, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 16, rankName: '七星雀者', minPoints: 1500, maxPoints: 1599, promotionBonus: 0, demotionPenalty: 0, rankOrder: 16, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 17, rankName: '八星雀者', minPoints: 1600, maxPoints: 1699, promotionBonus: 0, demotionPenalty: 0, rankOrder: 17, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 18, rankName: '九星雀者', minPoints: 1700, maxPoints: 1799, promotionBonus: 0, demotionPenalty: 0, rankOrder: 18, majorRank: '雀者', minorRankType: 'star', minorRankRange: [1, 9] },
  
  // 雀师 1-9星 (1800-2699分)
  { id: 19, rankName: '一星雀师', minPoints: 1800, maxPoints: 1899, promotionBonus: 0, demotionPenalty: 0, rankOrder: 19, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] },
  { id: 20, rankName: '二星雀师', minPoints: 1900, maxPoints: 1999, promotionBonus: 0, demotionPenalty: 0, rankOrder: 20, majorRank: '雀师', minorRankType: 'star', minorRankRange: [1, 9] }
];

// parseRankInfo函数
const parseRankInfo = (points) => {
  console.log(`正在查找积分 ${points} 对应的段位配置...`);
  
  const rankConfig = rankConfigs.find(rank => {
    const matches = points >= rank.minPoints && points <= rank.maxPoints;
    console.log(`检查配置 ${rank.rankName} (${rank.minPoints}-${rank.maxPoints}): ${matches}`);
    return matches;
  });
  
  if (!rankConfig) {
    console.log('未找到匹配的段位配置，返回默认值');
    return {
      majorRank: '雀之气',
      minorRank: 1,
      minorRankType: 'dan',
      displayName: '雀之气一段',
      rankConfig: rankConfigs[0]
    };
  }

  console.log(`找到匹配的段位配置: ${rankConfig.rankName}`);
  
  // 直接从rankName中提取小段位信息
  let minorRank = 1;
  if (rankConfig.minorRankType !== 'none') {
    // 从rankName中提取数字（一星、二星等）
    const rankName = rankConfig.rankName;
    const starMatch = rankName.match(/([一二三四五六七八九])星/);
    const danMatch = rankName.match(/([一二三四五六七八九])段/);
    
    if (starMatch) {
      const starNames = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
      minorRank = starNames.indexOf(starMatch[1]);
    } else if (danMatch) {
      const danNames = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
      minorRank = danNames.indexOf(danMatch[1]);
    }
  }

  return {
    majorRank: rankConfig.majorRank,
    minorRank,
    minorRankType: rankConfig.minorRankType,
    displayName: rankConfig.rankName, // 直接使用配置中的rankName
    rankConfig
  };
};

// getRankByPoints函数
const getRankByPoints = (points) => {
  const rankInfo = parseRankInfo(points);
  return rankInfo.displayName;
};

// 测试1800积分的段位匹配
console.log('=== 调试1800积分段位匹配 ===');

const testPoints = 1800;
console.log(`测试积分: ${testPoints}`);

try {
  const rankInfo = parseRankInfo(testPoints);
  console.log('parseRankInfo结果:', rankInfo);
  
  const displayName = getRankByPoints(testPoints);
  console.log('getRankByPoints结果:', displayName);
  
  // 测试其他积分值
  console.log('\n=== 测试其他积分值 ===');
  const testCases = [0, 100, 900, 1000, 1799, 1800, 1801, 1899, 1900];
  
  testCases.forEach(points => {
    const result = getRankByPoints(points);
    console.log(`${points}积分 -> ${result}`);
  });
  
} catch (error) {
  console.error('测试出错:', error);
}