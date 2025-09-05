import React from 'react';
import MahjongTile from './MahjongTile';

export interface MahjongHandProps {
  tiles: Array<{
    type: 'man' | 'pin' | 'sou' | 'honor';
    value: number | string;
  }>;
  winningTile?: {
    type: 'man' | 'pin' | 'sou' | 'honor';
    value: number | string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MahjongHand: React.FC<MahjongHandProps> = ({ 
  tiles, 
  winningTile, 
  size = 'sm', 
  className = '' 
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-0.5 ${className}`}>
      {/* 手牌 - 紧密排列 */}
      {tiles.map((tile, index) => (
        <MahjongTile
          key={index}
          type={tile.type}
          value={tile.value}
          size={size}
          className="flex-shrink-0"
        />
      ))}
      
      {/* 和牌标记 */}
      {winningTile && (
        <>
          <div className="text-red-500 font-bold text-xs mx-1">+</div>
          <MahjongTile
            type={winningTile.type}
            value={winningTile.value}
            size={size}
            className="ring-1 ring-red-400 ring-opacity-50 flex-shrink-0"
          />
        </>
      )}
    </div>
  );
};

export default MahjongHand;