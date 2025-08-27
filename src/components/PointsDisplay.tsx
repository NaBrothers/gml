import React from 'react';

interface PointsDisplayProps {
  pointsChange: number;
  originalPointsChange?: number;
  isNewbieProtected?: boolean;
  className?: string;
  showSign?: boolean; // 是否显示正负号
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({
  pointsChange,
  originalPointsChange,
  isNewbieProtected = false,
  className = '',
  showSign = true
}) => {
  // 获取积分变化颜色
  const getPointsChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // 判断是否应用了新手保护：原始积分为负但实际积分为0
  const isProtectionApplied = originalPointsChange !== undefined && 
                              originalPointsChange < 0 && 
                              pointsChange === 0;

  // 如果应用了新手保护
  if (isProtectionApplied) {
    return (
      <span className={`inline-flex items-center space-x-1 ${className}`}>
        {/* 显示删除线的原始积分 */}
        <span className="text-red-600 line-through text-sm opacity-75">
          {showSign ? '' : ''}{originalPointsChange}
        </span>
        {/* 显示保护后的积分（0） */}
        <span className="text-red-600 font-medium">
          0
        </span>
      </span>
    );
  }

  // 正常显示积分变化
  return (
    <span className={`${getPointsChangeColor(pointsChange)} ${className}`}>
      {showSign && pointsChange >= 0 ? '+' : ''}{pointsChange}
    </span>
  );
};

export default PointsDisplay;