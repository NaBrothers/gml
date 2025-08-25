import React, { useState, useEffect } from 'react';
import { getRandomQuote } from '../data/mahjongQuotes';

interface QuoteBubbleProps {
  isVisible: boolean;
  onClose?: () => void;
  position?: 'top' | 'bottom';
  className?: string;
  showCloseButton?: boolean;
  autoHide?: boolean;
}

const QuoteBubble: React.FC<QuoteBubbleProps> = ({ 
  isVisible, 
  onClose, 
  position = 'top',
  className = '',
  showCloseButton = true,
  autoHide = true
}) => {
  const [quote, setQuote] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setQuote(getRandomQuote());
      setIsAnimating(true);
      
      // 只有在autoHide为true时才自动隐藏气泡
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsAnimating(false);
          setTimeout(() => {
            onClose?.();
          }, 300); // 等待动画完成
        }, 3000);

        return () => clearTimeout(timer);
      }
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, onClose, autoHide]);

  if (!isVisible) return null;

  const bubbleClasses = `
    absolute z-50 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg
    bg-gradient-to-br from-pink-100 to-purple-100 
    border-2 border-pink-300 rounded-2xl p-4 shadow-2xl
    transform transition-all duration-300 ease-out
    ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
    ${position === 'top' ? 'bottom-full mb-4' : 'top-full mt-4'}
    left-1/2 -translate-x-1/2
    ${className}
  `;

  const arrowClasses = `
    absolute left-1/2 -translate-x-1/2 w-0 h-0
    border-l-[12px] border-r-[12px] border-transparent
    ${position === 'top' 
      ? 'top-full border-t-[12px] border-t-pink-300' 
      : 'bottom-full border-b-[12px] border-b-pink-300'
    }
  `;

  const innerArrowClasses = `
    absolute left-1/2 -translate-x-1/2 w-0 h-0
    border-l-[10px] border-r-[10px] border-transparent
    ${position === 'top' 
      ? 'top-full -mt-[1px] border-t-[10px] border-t-pink-100' 
      : 'bottom-full -mb-[1px] border-b-[10px] border-b-pink-100'
    }
  `;

  return (
    <div className={bubbleClasses}>
      {/* 气泡箭头 */}
      <div className={arrowClasses}></div>
      <div className={innerArrowClasses}></div>
      
      {/* 气泡内容 */}
      <div className="relative">
        {/* 装饰性元素 */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full opacity-60"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-400 rounded-full opacity-40"></div>
        
        {/* 语录文本 */}
        <p className="text-gray-800 text-sm sm:text-base font-medium leading-relaxed text-center">
          {quote}
        </p>
        
        {/* 关闭按钮 - 只有在showCloseButton为true时才显示 */}
        {showCloseButton && (
          <button
            onClick={() => {
              setIsAnimating(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 hover:bg-pink-500 
                       text-white rounded-full text-xs font-bold
                       transition-colors duration-200 flex items-center justify-center
                       shadow-lg hover:shadow-xl"
            aria-label="关闭"
          >
            ×
          </button>
        )}
      </div>
      
      {/* 闪烁效果 */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent 
                      opacity-0 animate-pulse pointer-events-none"></div>
    </div>
  );
};

export default QuoteBubble;