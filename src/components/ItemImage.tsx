import React, { useState } from 'react';
import { Package, Star, Crown, Gem, Gift, Image } from 'lucide-react';
import { ItemRarity } from '../../shared/types';

interface ItemImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackIcon?: 'package' | 'gift' | 'star' | 'image';
  rarity?: ItemRarity;
  isOwned?: boolean;
}

const ItemImage: React.FC<ItemImageProps> = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  fallbackIcon = 'package',
  rarity,
  isOwned = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // 获取稀有度对应的图标
  const getRarityIcon = (rarity: ItemRarity) => {
    switch (rarity) {
      case ItemRarity.R:
        return <Star className="w-8 h-8" />;
      case ItemRarity.SR:
        return <Crown className="w-8 h-8" />;
      case ItemRarity.SSR:
        return <Gem className="w-8 h-8" />;
      default:
        return <Star className="w-8 h-8" />;
    }
  };

  // 获取默认图标
  const getDefaultIcon = () => {
    if (rarity) {
      return getRarityIcon(rarity);
    }
    
    switch (fallbackIcon) {
      case 'gift':
        return <Gift className="w-8 h-8" />;
      case 'star':
        return <Star className="w-8 h-8" />;
      case 'image':
        return <Image className="w-8 h-8" />;
      case 'package':
      default:
        return <Package className="w-8 h-8" />;
    }
  };

  // 获取图标颜色
  const getIconColor = () => {
    if (fallbackIcon === 'gift') {
      return 'text-white'; // 抽卡结果页面使用白色图标
    }
    
    if (rarity) {
      switch (rarity) {
        case ItemRarity.R:
          return isOwned ? 'text-blue-400' : 'text-gray-400';
        case ItemRarity.SR:
          return isOwned ? 'text-purple-400' : 'text-gray-400';
        case ItemRarity.SSR:
          return isOwned ? 'text-yellow-400' : 'text-gray-400';
        default:
          return isOwned ? 'text-purple-400' : 'text-gray-400';
      }
    }
    return isOwned ? 'text-purple-400' : 'text-gray-400';
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  // 如果没有图片URL或图片加载失败，显示默认图标
  if (!src || imageError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className={getIconColor()}>
          {getDefaultIcon()}
        </div>
      </div>
    );
  }

  return (
    <>
      {imageLoading && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse">
            <div className={getIconColor()}>
              {getDefaultIcon()}
            </div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoading ? 'hidden' : ''}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </>
  );
};

export default ItemImage;