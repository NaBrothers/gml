import React from 'react';
import { Trophy, Target, Users, Star, Award, Zap, Shield, Crown } from 'lucide-react';
import { AchievementEarned } from '../../shared/types';

interface AchievementBadgeProps {
  achievement: AchievementEarned;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

// 成就图标映射
const getAchievementIcon = (achievementName: string) => {
  switch (achievementName) {
    case '大富翁':
      return Crown;
    case '碾压局':
      return Zap;
    case '逆转运':
      return Shield;
    case '被击飞':
      return Target;
    case '完美避四':
      return Star;
    case '2连胜':
    case '3连胜':
    case '4连胜':
    case '5连胜+':
      return Trophy;
    case '2连败':
    case '3连败':
    case '4连败':
    case '5连败+':
      return Award;
    default:
      return Trophy;
  }
};

// 成就颜色映射
const getAchievementColor = (achievementName: string, category: string) => {
  if (category === 'single_game_glory') {
    switch (achievementName) {
      case '大富翁':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case '碾压局':
        return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
      case '逆转运':
        return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
      case '被击飞':
        return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
      case '完美避四':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  } else if (category === 'win_streak') {
    return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
  } else if (category === 'lose_streak') {
    return 'bg-gradient-to-r from-indigo-400 to-indigo-600 text-white';
  }
  return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
};

// 获取尺寸样式
const getSizeStyles = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return {
        container: 'px-2 py-1 text-xs',
        icon: 'w-3 h-3',
        text: 'text-xs'
      };
    case 'lg':
      return {
        container: 'px-4 py-2 text-base',
        icon: 'w-5 h-5',
        text: 'text-base'
      };
    default: // md
      return {
        container: 'px-3 py-1.5 text-sm',
        icon: 'w-4 h-4',
        text: 'text-sm'
      };
  }
};

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showTooltip = true,
  className = ''
}) => {
  const Icon = getAchievementIcon(achievement.achievementName);
  const colorClass = getAchievementColor(achievement.achievementName, achievement.category);
  const sizeStyles = getSizeStyles(size);

  const tooltipContent = `${achievement.description}${achievement.bonusPoints > 0 ? ` (+${achievement.bonusPoints}PT)` : ''}${
    achievement.extraBonusPoints ? ` (额外+${achievement.extraBonusPoints}PT)` : ''
  }${achievement.streakCount ? ` (${achievement.streakCount}连)` : ''}`;

  return (
    <div className="relative inline-block group">
      <div
        className={`
          inline-flex items-center space-x-1 rounded-full font-medium
          shadow-sm border border-white/20 backdrop-blur-sm
          transition-all duration-200 hover:scale-105 hover:shadow-md
          ${colorClass}
          ${sizeStyles.container}
          ${className}
        `}
      >
        <Icon className={`${sizeStyles.icon} flex-shrink-0`} />
        <span className={`${sizeStyles.text} font-semibold truncate`}>
          {achievement.achievementName}
        </span>
        {achievement.bonusPoints > 0 && (
          <span className={`${sizeStyles.text} font-bold opacity-90`}>
            +{achievement.bonusPoints}
          </span>
        )}
      </div>

      {/* 工具提示 */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {tooltipContent}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// 成就徽章列表组件
interface AchievementBadgeListProps {
  achievements: AchievementEarned[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  showTooltip?: boolean;
  className?: string;
}

export const AchievementBadgeList: React.FC<AchievementBadgeListProps> = ({
  achievements,
  size = 'md',
  maxDisplay,
  showTooltip = true,
  className = ''
}) => {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  const displayAchievements = maxDisplay ? achievements.slice(0, maxDisplay) : achievements;
  const remainingCount = maxDisplay && achievements.length > maxDisplay ? achievements.length - maxDisplay : 0;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayAchievements.map((achievement, index) => (
        <AchievementBadge
          key={`${achievement.achievementId}-${index}`}
          achievement={achievement}
          size={size}
          showTooltip={showTooltip}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            inline-flex items-center justify-center rounded-full font-medium
            bg-gray-200 text-gray-600 border border-gray-300
            ${getSizeStyles(size).container}
          `}
        >
          <span className={getSizeStyles(size).text}>
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};

// 成就统计组件
interface AchievementStatsProps {
  achievementCounts: { [achievementName: string]: number };
  totalBonusPoints: number;
  className?: string;
}

export const AchievementStats: React.FC<AchievementStatsProps> = ({
  achievementCounts,
  totalBonusPoints,
  className = ''
}) => {
  const totalAchievements = Object.values(achievementCounts).reduce((sum, count) => sum + count, 0);

  if (totalAchievements === 0) {
    return (
      <div className={`text-center py-4 ${className}`}>
        <div className="text-gray-400 text-4xl mb-2">🏆</div>
        <p className="text-gray-500 text-sm">暂无成就</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">成就总数</span>
        <span className="text-lg font-bold text-gray-800">{totalAchievements}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">成就奖励积分</span>
        <span className="text-lg font-bold text-green-600">+{totalBonusPoints}</span>
      </div>

      <div className="space-y-2">
        {Object.entries(achievementCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([achievementName, count]) => (
            <div key={achievementName} className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{achievementName}</span>
              <span className="font-semibold text-gray-800">×{count}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AchievementBadge;