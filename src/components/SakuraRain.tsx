import React, { useEffect, useState } from 'react';

interface SakuraPetal {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  animationDuration: number;
  animationDelay: number;
  opacity: number;
}

interface SakuraRainProps {
  petalCount?: number;
  className?: string;
}

const SakuraRain: React.FC<SakuraRainProps> = ({ 
  petalCount = 15, 
  className = '' 
}) => {
  const [petals, setPetals] = useState<SakuraPetal[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 检测移动设备
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // 根据设备类型调整花瓣数量
    const actualPetalCount = isMobile ? Math.floor(petalCount * 0.4) : petalCount;
    
    const generatePetals = (): SakuraPetal[] => {
      return Array.from({ length: actualPetalCount }, (_, index) => ({
        id: index,
        x: Math.random() * 100, // 百分比位置
        y: -10, // 从屏幕上方开始
        size: 0.6 + Math.random() * 0.4, // 0.6-1.0倍大小，减小尺寸
        rotation: Math.random() * 360,
        animationDuration: 10 + Math.random() * 8, // 10-18秒，放慢速度
        animationDelay: Math.random() * 8, // 0-8秒延迟，增加随机性
        opacity: 0.2 + Math.random() * 0.3, // 0.2-0.5透明度，降低透明度
      }));
    };

    setPetals(generatePetals());
  }, [petalCount, isMobile]);

  // SVG樱花花瓣组件
  const SakuraPetalSVG: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => (
    <svg
      width={20 * size}
      height={20 * size}
      viewBox="0 0 20 20"
      className="sakura-petal"
      style={{ opacity }}
    >
      <defs>
        <radialGradient id={`sakura-gradient-${Math.random()}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB7C5" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFC9D4" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FF9FB0" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      
      {/* 樱花花瓣形状 */}
      <path
        d="M10,2 C12,4 14,6 12,10 C14,12 12,16 10,14 C8,16 6,12 8,10 C6,6 8,4 10,2 Z"
        fill={`url(#sakura-gradient-${Math.random()})`}
        stroke="#FF9FB0"
        strokeWidth="0.5"
        opacity="0.8"
      />
      
      {/* 花瓣中心点 */}
      <circle
        cx="10"
        cy="10"
        r="1"
        fill="#FFD700"
        opacity="0.6"
      />
    </svg>
  );

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute sakura-fall"
          style={{
            left: `${petal.x}%`,
            top: `${petal.y}%`,
            transform: `rotate(${petal.rotation}deg)`,
            animationDuration: `${petal.animationDuration}s`,
            animationDelay: `${petal.animationDelay}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            willChange: 'transform, opacity',
          }}
        >
          <SakuraPetalSVG size={petal.size} opacity={petal.opacity} />
        </div>
      ))}
    </div>
  );
};

export default SakuraRain;