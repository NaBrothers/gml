import React, { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';

interface ScrollToTopProps {
  /** 显示按钮的滚动阈值，默认300px */
  threshold?: number;
  /** 是否只在移动端显示，默认true */
  mobileOnly?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ 
  threshold = 300, 
  mobileOnly = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;

    const toggleVisibility = () => {
      const scrolled = document.documentElement.scrollTop;
      
      if (scrolled > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // 检测滚动状态，用于动画效果
      setIsScrolling(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      clearTimeout(scrollTimer);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 如果设置为仅移动端显示，在桌面端隐藏
  const shouldShow = mobileOnly ? isVisible : isVisible;
  const mobileOnlyClass = mobileOnly ? 'lg:hidden' : '';

  if (!shouldShow) return null;

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-50
        w-12 h-12 
        bg-white/60 backdrop-blur-sm
        hover:bg-white/80
        text-purple-600 hover:text-purple-700
        rounded-full
        border border-white/20 hover:border-purple-300/50
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        transform hover:scale-110 active:scale-95
        ${isScrolling ? 'animate-pulse' : ''}
        ${mobileOnlyClass}
        ${className}
      `}
      aria-label="回到顶部"
    >
      <Rocket 
        className={`
          w-6 h-6 mx-auto
          transition-transform duration-300
          ${isScrolling ? 'rotate-12' : 'rotate-0'}
        `} 
      />
    </button>
  );
};

export default ScrollToTop;