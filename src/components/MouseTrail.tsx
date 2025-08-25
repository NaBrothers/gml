import React, { useEffect, useState, useCallback } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
  timestamp: number;
}

const MouseTrail: React.FC = () => {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newPoint: TrailPoint = {
      x: e.clientX,
      y: e.clientY,
      id: Date.now(),
      timestamp: Date.now()
    };

    setMousePosition({ x: e.clientX, y: e.clientY });
    
    setTrail(prevTrail => {
      const newTrail = [...prevTrail, newPoint];
      // 保持轨迹点数量在合理范围内，避免性能问题
      return newTrail.slice(-15);
    });
  }, []);

  useEffect(() => {
    // 清理过期的轨迹点
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setTrail(prevTrail => 
        prevTrail.filter(point => now - point.timestamp < 1000)
      );
    }, 50);

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearInterval(cleanupInterval);
    };
  }, [handleMouseMove]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trail.map((point, index) => {
        const age = Date.now() - point.timestamp;
        const opacity = Math.max(0, 1 - age / 1000);
        const scale = Math.max(0.1, 1 - age / 1000);
        
        return (
          <div
            key={point.id}
            className="absolute rounded-full transition-all duration-100 ease-out"
            style={{
              left: point.x - 8,
              top: point.y - 8,
              width: '16px',
              height: '16px',
              background: `radial-gradient(circle, 
                rgba(255, 182, 193, ${opacity * 0.8}) 0%, 
                rgba(255, 192, 203, ${opacity * 0.6}) 30%, 
                rgba(255, 218, 224, ${opacity * 0.4}) 60%, 
                rgba(255, 240, 245, ${opacity * 0.2}) 80%, 
                transparent 100%)`,
              transform: `scale(${scale})`,
              opacity: opacity,
              filter: 'blur(1px)',
            }}
          />
        );
      })}
    </div>
  );
};

export default MouseTrail;