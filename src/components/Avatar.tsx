import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  /** 头像图片URL */
  src?: string | null;
  /** 用户昵称，用于alt属性 */
  alt?: string;
  /** 头像大小 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 是否显示边框 */
  showBorder?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 点击事件 */
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '用户头像',
  size = 'md',
  showBorder = false,
  className = '',
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const borderClass = showBorder ? 'border-2 border-white shadow-lg' : '';
  const cursorClass = onClick ? 'cursor-pointer hover:opacity-80' : '';
  
  const avatarUrl = src ? `http://localhost:3001${src}` : null;

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${borderClass} ${cursorClass} transition-opacity ${className}`}
      onClick={onClick}
    >
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            // 如果图片加载失败，隐藏img元素，显示默认头像
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <User className={`${iconSizes[size]} text-white`} />
        </div>
      )}
    </div>
  );
};

export default Avatar;