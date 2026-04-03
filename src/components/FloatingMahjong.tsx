import React, { useEffect, useState } from 'react';
import MahjongTile, { MahjongTileProps } from './MahjongTile';

interface FloatingTile extends MahjongTileProps {
  id: number;
  left: string;
  top: string;
  delay: string;
  duration: string;
  rotation: string;
  scale: number;
  opacity: number;
}

const FloatingMahjong: React.FC<{ count?: number }> = ({ count = 8 }) => {
  const [tiles, setTiles] = useState<FloatingTile[]>([]);

  useEffect(() => {
    const tileTypes: ('man' | 'pin' | 'sou' | 'honor')[] = ['man', 'pin', 'sou', 'honor'];
    const honorValues = ['东', '南', '西', '北', '白', '发', '中'];
    
    const newTiles: FloatingTile[] = Array.from({ length: count }).map((_, i) => {
      const type = tileTypes[Math.floor(Math.random() * tileTypes.length)];
      const value = type === 'honor' 
        ? honorValues[Math.floor(Math.random() * honorValues.length)]
        : Math.floor(Math.random() * 9) + 1;

      return {
        id: i,
        type,
        value,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${15 + Math.random() * 20}s`,
        rotation: `${Math.random() * 360}deg`,
        scale: 0.5 + Math.random() * 0.8,
        opacity: 0.1 + Math.random() * 0.3,
      };
    });

    setTiles(newTiles);
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className="absolute animate-float-slow"
          style={{
            left: tile.left,
            top: tile.top,
            animationDelay: tile.delay,
            animationDuration: tile.duration,
            opacity: tile.opacity,
            transform: `rotate(${tile.rotation}) scale(${tile.scale})`,
          }}
        >
          <MahjongTile 
            type={tile.type} 
            value={tile.value} 
            size="lg" 
            className="shadow-2xl border-white/20"
          />
        </div>
      ))}
      <style>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-50px) translateX(20px) rotate(120deg);
          }
          66% {
            transform: translateY(20px) translateX(-30px) rotate(240deg);
          }
        }
        .animate-float-slow {
          animation: float-slow linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FloatingMahjong;
