// 成就检测引擎
import { 
  Achievement, 
  AchievementEarned, 
  AchievementConfig,
  GameRecord,
  GamePlayerRecord,
  MahjongCalculation
} from '../../shared/types.js';
import { getAchievementsConfig } from './configManager.js';

// 玩家历史记录接口（用于连胜/连败检测）
interface PlayerGameHistory {
  gameId: string;
  position: number;
  finalScore: number;
  gameDate: string;
}

// 成就检测引擎类
export class AchievementEngine {
  private config: AchievementConfig;

  constructor() {
    try {
      this.config = getAchievementsConfig();
      console.log(`[成就引擎] 初始化完成，成就系统启用状态: ${this.config.enabled}, 成就数量: ${this.config.achievements.length}`);
    } catch (error) {
      console.error(`[成就引擎] 初始化失败:`, error);
      // 提供默认配置
      this.config = {
        achievements: [],
        winStreakExtraBonusPerGame: 5,
        loseStreakExtraBonusPerGame: 3,
        enabled: false
      };
    }
  }

  // 更新配置
  updateConfig(): void {
    try {
      this.config = getAchievementsConfig();
      console.log(`[成就引擎] 配置更新完成，成就系统启用状态: ${this.config.enabled}, 成就数量: ${this.config.achievements.length}`);
    } catch (error) {
      console.error(`[成就引擎] 配置更新失败:`, error);
    }
  }

  // 检测单局成就
  detectSingleGameAchievements(
    playerScore: number,
    playerPosition: number,
    allScores: number[]
  ): AchievementEarned[] {
    console.log(`[成就检测] 开始检测单局成就，成就系统启用状态: ${this.config.enabled}`);
    
    if (!this.config.enabled) {
      console.log(`[成就检测] 成就系统未启用，跳过检测`);
      return [];
    }

    const achievements: AchievementEarned[] = [];
    const singleGameAchievements = this.config.achievements.filter(
      a => a.category === 'single_game_glory'
    );

    console.log(`[成就检测] 找到 ${singleGameAchievements.length} 个单局成就配置`);

    for (const achievement of singleGameAchievements) {
      if (this.checkSingleGameCondition(achievement, playerScore, playerPosition)) {
        achievements.push({
          achievementId: achievement.id,
          achievementName: achievement.name,
          bonusPoints: achievement.bonusPoints,
          description: achievement.description,
          category: achievement.category
        });
      }
    }

    return achievements;
  }

  // 检测连胜/连败成就
  detectStreakAchievements(
    playerHistory: PlayerGameHistory[],
    currentGamePosition: number
  ): AchievementEarned[] {
    if (!this.config.enabled) {
      return [];
    }

    const achievements: AchievementEarned[] = [];
    
    // 将当前游戏添加到历史记录中进行检测
    const fullHistory = [...playerHistory, {
      gameId: 'current',
      position: currentGamePosition,
      finalScore: 0, // 这里不需要具体分数
      gameDate: new Date().toISOString()
    }];

    // 按时间排序（最新的在后）
    fullHistory.sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());

    // 检测连胜
    const winStreak = this.calculateWinStreak(fullHistory);
    if (winStreak >= 2) {
      const winAchievement = this.getStreakAchievement('win_streak', winStreak);
      if (winAchievement) {
        const earned: AchievementEarned = {
          achievementId: winAchievement.id,
          achievementName: winAchievement.name,
          bonusPoints: winAchievement.bonusPoints,
          description: winAchievement.description,
          category: winAchievement.category,
          streakCount: winStreak
        };

        // 计算额外奖励（5连胜+的额外奖励）
        if (winStreak >= 5) {
          const extraGames = winStreak - 5;
          earned.extraBonusPoints = extraGames * this.config.winStreakExtraBonusPerGame;
          earned.bonusPoints += earned.extraBonusPoints;
        }

        achievements.push(earned);
      }
    }

    // 检测连败
    const loseStreak = this.calculateLoseStreak(fullHistory);
    if (loseStreak >= 2) {
      const loseAchievement = this.getStreakAchievement('lose_streak', loseStreak);
      if (loseAchievement) {
        const earned: AchievementEarned = {
          achievementId: loseAchievement.id,
          achievementName: loseAchievement.name,
          bonusPoints: loseAchievement.bonusPoints,
          description: loseAchievement.description,
          category: loseAchievement.category,
          streakCount: loseStreak
        };

        // 计算额外奖励（5连败+的额外奖励）
        if (loseStreak >= 5) {
          const extraGames = loseStreak - 5;
          earned.extraBonusPoints = extraGames * this.config.loseStreakExtraBonusPerGame;
          earned.bonusPoints += earned.extraBonusPoints;
        }

        achievements.push(earned);
      }
    }

    return achievements;
  }

  // 检测所有成就（单局 + 连胜/连败）
  detectAllAchievements(
    playerScore: number,
    playerPosition: number,
    allScores: number[],
    playerHistory: PlayerGameHistory[]
  ): AchievementEarned[] {
    const singleGameAchievements = this.detectSingleGameAchievements(
      playerScore, 
      playerPosition, 
      allScores
    );
    
    const streakAchievements = this.detectStreakAchievements(
      playerHistory, 
      playerPosition
    );

    return [...singleGameAchievements, ...streakAchievements];
  }

  // 计算成就总奖励积分
  calculateTotalBonusPoints(achievements: AchievementEarned[]): number {
    return achievements.reduce((total, achievement) => total + achievement.bonusPoints, 0);
  }

  // 私有方法：检查单局成就条件
  private checkSingleGameCondition(
    achievement: Achievement,
    playerScore: number,
    playerPosition: number
  ): boolean {
    console.log(`[成就检测] 检查成就 "${achievement.name}", 条件类型: ${achievement.conditionType}, 条件值: ${achievement.conditionValue}, 玩家得分: ${playerScore}, 玩家位置: ${playerPosition}`);
    
    switch (achievement.conditionType) {
      case 'final_score_gte':
        const result = playerScore >= Number(achievement.conditionValue);
        console.log(`[成就检测] ${achievement.name}: ${playerScore} >= ${achievement.conditionValue} = ${result}`);
        return result;
      
      case 'final_score_lte':
        return playerScore <= Number(achievement.conditionValue);
      
      case 'position_eq':
        return playerPosition === Number(achievement.conditionValue);
      
      case 'position_and_score':
        // 格式: "position:score" 例如 "1:40000" 或 "4:10000"
        const [posStr, scoreStr] = String(achievement.conditionValue).split(':');
        const requiredPosition = Number(posStr);
        const requiredScore = Number(scoreStr);
        
        if (achievement.name === '逆转运') {
          // 逆转运：积分小于10000且名次不是第四位
          return playerPosition !== requiredPosition && playerScore < requiredScore;
        } else if (achievement.name === '完美避四') {
          // 完美避四：三位且得点>30,000
          return playerPosition === requiredPosition && playerScore > requiredScore;
        } else {
          // 碾压局：一位且得点≥40,000
          return playerPosition === requiredPosition && playerScore >= requiredScore;
        }
      
      default:
        return false;
    }
  }

  // 私有方法：计算连胜次数
  private calculateWinStreak(history: PlayerGameHistory[]): number {
    let streak = 0;
    
    // 从最新的游戏开始往前计算
    for (let i = history.length - 1; i >= 0; i--) {
      const game = history[i];
      if (game.position <= 2) { // 一位或二位算胜利
        streak++;
      } else {
        break; // 遇到非胜利就停止
      }
    }
    
    return streak;
  }

  // 私有方法：计算连败次数
  private calculateLoseStreak(history: PlayerGameHistory[]): number {
    let streak = 0;
    
    // 从最新的游戏开始往前计算
    for (let i = history.length - 1; i >= 0; i--) {
      const game = history[i];
      if (game.position === 4) { // 四位算失败
        streak++;
      } else {
        break; // 遇到非失败就停止
      }
    }
    
    return streak;
  }

  // 私有方法：获取连胜/连败成就
  private getStreakAchievement(
    type: 'win_streak' | 'lose_streak',
    streakCount: number
  ): Achievement | null {
    const streakAchievements = this.config.achievements.filter(
      a => a.category === type
    ).sort((a, b) => Number(b.conditionValue) - Number(a.conditionValue)); // 按要求次数降序排列

    // 找到符合条件的最高级成就
    for (const achievement of streakAchievements) {
      const requiredStreak = Number(achievement.conditionValue);
      if (streakCount >= requiredStreak) {
        return achievement;
      }
    }

    return null;
  }
}

// 导出单例实例 - 延迟初始化
let achievementEngineInstance: AchievementEngine | null = null;

export const achievementEngine = {
  get instance(): AchievementEngine {
    if (!achievementEngineInstance) {
      achievementEngineInstance = new AchievementEngine();
    }
    return achievementEngineInstance;
  }
};

// 便捷函数：检测单局成就
export function detectSingleGameAchievements(
  playerScore: number,
  playerPosition: number,
  allScores: number[]
): AchievementEarned[] {
  return achievementEngine.instance.detectSingleGameAchievements(playerScore, playerPosition, allScores);
}

// 便捷函数：检测连胜/连败成就
export function detectStreakAchievements(
  playerHistory: PlayerGameHistory[],
  currentGamePosition: number
): AchievementEarned[] {
  return achievementEngine.instance.detectStreakAchievements(playerHistory, currentGamePosition);
}

// 便捷函数：检测所有成就
export function detectAllAchievements(
  playerScore: number,
  playerPosition: number,
  allScores: number[],
  playerHistory: PlayerGameHistory[]
): AchievementEarned[] {
  return achievementEngine.instance.detectAllAchievements(
    playerScore, 
    playerPosition, 
    allScores, 
    playerHistory
  );
}

// 便捷函数：计算成就总奖励积分
export function calculateAchievementBonusPoints(achievements: AchievementEarned[]): number {
  return achievementEngine.instance.calculateTotalBonusPoints(achievements);
}

// 便捷函数：更新成就配置
export function updateAchievementConfig(): void {
  achievementEngine.instance.updateConfig();
}