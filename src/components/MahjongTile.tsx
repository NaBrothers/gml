import React from 'react';

export interface MahjongTileProps {
  type: 'man' | 'pin' | 'sou' | 'honor'; // 万子、筒子、索子、字牌
  value: number | string; // 1-9 或 东南西北白发中
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MahjongTile: React.FC<MahjongTileProps> = ({ 
  type, 
  value, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-6 sm:w-6 sm:h-8',
    md: 'w-6 h-8 sm:w-8 sm:h-10',
    lg: 'w-8 h-10 sm:w-10 sm:h-12'
  };

  const getDisplayText = () => {
    if (type === 'honor') {
      const honorMap: { [key: string]: string } = {
        '东': '東',
        '南': '南',
        '西': '西',
        '北': '北',
        '白': '白',
        '发': '發',
        '中': '中'
      };
      return honorMap[value as string] || value;
    }
    return value;
  };

  const getSuitSymbol = () => {
    switch (type) {
      case 'man': return '万';
      case 'pin': return '筒';
      case 'sou': return '索';
      default: return '';
    }
  };

  const getTileColor = () => {
    switch (type) {
      case 'man': return 'text-red-600';
      case 'pin': return 'text-blue-600';
      case 'sou': return 'text-green-600';
      case 'honor': 
        if (['白', '发', '中'].includes(value as string)) {
          return value === '白' ? 'text-gray-600' : 
                 value === '发' ? 'text-green-600' : 'text-red-600';
        }
        return 'text-purple-600';
      default: return 'text-gray-800';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-xs sm:text-sm';
      case 'lg': return 'text-sm sm:text-lg';
      default: return 'text-xs sm:text-sm';
    }
  };

  const getSymbolSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-xs';
      case 'lg': return 'text-xs sm:text-sm';
      default: return 'text-xs';
    }
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${className}
      bg-white 
      border 
      border-gray-300 
      rounded 
      shadow-sm 
      flex 
      flex-col 
      items-center 
      justify-center 
      font-bold 
      relative
      hover:shadow-md 
      transition-shadow
      min-w-0
    `}>
      {/* 主要数字/字符 */}
      <div className={`
        ${getTextSize()}
        ${getTileColor()} 
        leading-none
      `}>
        {getDisplayText()}
      </div>
      
      {/* 花色符号 */}
      {type !== 'honor' && (
        <div className={`
          ${getSymbolSize()}
          ${getTileColor()} 
          leading-none 
          mt-0.5
        `}>
          {getSuitSymbol()}
        </div>
      )}
    </div>
  );
};

export default MahjongTile;