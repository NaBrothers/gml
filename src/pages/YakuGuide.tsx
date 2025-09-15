import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Filter, Star, Crown, Zap } from 'lucide-react';
import { yakuList, yakuByCategory, YakuCategory, searchYaku, getHanText, Yaku } from '../data/yakuData';
import MahjongHand from '../components/MahjongHand';
import HeaderBar from '../components/HeaderBar';
import ScrollToTop from '../components/ScrollToTop';

const YakuGuide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<YakuCategory | 'all'>('all');
  const [expandedYaku, setExpandedYaku] = useState<string | null>(null);

  // 筛选和搜索役种
  const filteredYaku = useMemo(() => {
    let result = searchQuery ? searchYaku(searchQuery) : yakuList;
    
    if (selectedCategory !== 'all') {
      result = result.filter(yaku => yaku.category === selectedCategory);
    }
    
    return result;
  }, [searchQuery, selectedCategory]);

  // 分类统计
  const categoryStats = useMemo(() => {
    return Object.entries(yakuByCategory).map(([category, yakus]) => ({
      category: category as YakuCategory,
      count: yakus.length,
      icon: getCategoryIcon(category as YakuCategory)
    }));
  }, []);

  function getCategoryIcon(category: YakuCategory) {
    switch (category) {
      case YakuCategory.ONE_HAN:
      case YakuCategory.TWO_HAN:
      case YakuCategory.THREE_HAN:
        return <Star className="w-4 h-4" />;
      case YakuCategory.SIX_HAN:
        return <Zap className="w-4 h-4" />;
      case YakuCategory.YAKUMAN:
      case YakuCategory.DOUBLE_YAKUMAN:
        return <Crown className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  }

  function getCategoryColor(category: YakuCategory) {
    switch (category) {
      case YakuCategory.ONE_HAN:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case YakuCategory.TWO_HAN:
        return 'bg-green-100 text-green-800 border-green-200';
      case YakuCategory.THREE_HAN:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case YakuCategory.SIX_HAN:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case YakuCategory.YAKUMAN:
        return 'bg-red-100 text-red-800 border-red-200';
      case YakuCategory.DOUBLE_YAKUMAN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // 获取示例牌型数据
  function getExampleHand(yaku: Yaku) {
    // 完整的示例牌型映射
    const exampleHands: { [key: string]: any } = {
      // 一番役
      'riichi': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 2 }, { type: 'man', value: 3 },
          { type: 'pin', value: 4 }, { type: 'pin', value: 5 }, { type: 'pin', value: 6 },
          { type: 'sou', value: 7 }, { type: 'sou', value: 8 }, { type: 'sou', value: 9 },
          { type: 'honor', value: '东' }, { type: 'honor', value: '东' }, { type: 'honor', value: '东' },
          { type: 'man', value: 5 }
        ],
        winningTile: { type: 'man', value: 6 }
      },
      'tanyao': {
        tiles: [
          { type: 'man', value: 2 }, { type: 'man', value: 3 }, { type: 'man', value: 4 },
          { type: 'pin', value: 5 }, { type: 'pin', value: 6 }, { type: 'pin', value: 7 },
          { type: 'sou', value: 2 }, { type: 'sou', value: 3 }, { type: 'sou', value: 4 },
          { type: 'man', value: 6 }, { type: 'man', value: 6 }, { type: 'man', value: 6 },
          { type: 'pin', value: 8 }
        ],
        winningTile: { type: 'pin', value: 8 }
      },
      'pinfu': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 2 }, { type: 'man', value: 3 },
          { type: 'man', value: 4 }, { type: 'man', value: 5 }, { type: 'man', value: 6 },
          { type: 'man', value: 7 }, { type: 'man', value: 8 }, { type: 'man', value: 9 },
          { type: 'pin', value: 1 }, { type: 'pin', value: 1 },
          { type: 'sou', value: 2 }, { type: 'sou', value: 3 }
        ],
        winningTile: { type: 'sou', value: 4 }
      },
      'iipeikou': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 2 },
          { type: 'man', value: 2 }, { type: 'man', value: 3 }, { type: 'man', value: 3 },
          { type: 'pin', value: 4 }, { type: 'pin', value: 5 }, { type: 'pin', value: 6 },
          { type: 'sou', value: 7 }, { type: 'sou', value: 8 }, { type: 'sou', value: 9 },
          { type: 'honor', value: '白' }
        ],
        winningTile: { type: 'honor', value: '白' }
      },
      'menzen_tsumo': {
        tiles: [
          { type: 'man', value: 2 }, { type: 'man', value: 3 }, { type: 'man', value: 4 },
          { type: 'pin', value: 3 }, { type: 'pin', value: 4 }, { type: 'pin', value: 5 },
          { type: 'sou', value: 6 }, { type: 'sou', value: 7 }, { type: 'sou', value: 8 },
          { type: 'honor', value: '发' }, { type: 'honor', value: '发' }, { type: 'honor', value: '发' },
          { type: 'man', value: 7 }
        ],
        winningTile: { type: 'man', value: 7 }
      },
      'yakuhai_haku': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 2 }, { type: 'man', value: 3 },
          { type: 'pin', value: 4 }, { type: 'pin', value: 5 }, { type: 'pin', value: 6 },
          { type: 'sou', value: 7 }, { type: 'sou', value: 8 }, { type: 'sou', value: 9 },
          { type: 'honor', value: '白' }, { type: 'honor', value: '白' }, { type: 'honor', value: '白' },
          { type: 'man', value: 5 }
        ],
        winningTile: { type: 'man', value: 5 }
      },
      'yakuhai_hatsu': {
        tiles: [
          { type: 'man', value: 2 }, { type: 'man', value: 3 }, { type: 'man', value: 4 },
          { type: 'pin', value: 5 }, { type: 'pin', value: 6 }, { type: 'pin', value: 7 },
          { type: 'sou', value: 1 }, { type: 'sou', value: 2 }, { type: 'sou', value: 3 },
          { type: 'honor', value: '发' }, { type: 'honor', value: '发' }, { type: 'honor', value: '发' },
          { type: 'pin', value: 8 }
        ],
        winningTile: { type: 'pin', value: 8 }
      },
      'yakuhai_chun': {
        tiles: [
          { type: 'man', value: 3 }, { type: 'man', value: 4 }, { type: 'man', value: 5 },
          { type: 'pin', value: 6 }, { type: 'pin', value: 7 }, { type: 'pin', value: 8 },
          { type: 'sou', value: 2 }, { type: 'sou', value: 3 }, { type: 'sou', value: 4 },
          { type: 'honor', value: '中' }, { type: 'honor', value: '中' }, { type: 'honor', value: '中' },
          { type: 'man', value: 9 }
        ],
        winningTile: { type: 'man', value: 9 }
      },
      'yakuhai_ton': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 2 }, { type: 'man', value: 3 },
          { type: 'pin', value: 7 }, { type: 'pin', value: 8 }, { type: 'pin', value: 9 },
          { type: 'sou', value: 4 }, { type: 'sou', value: 5 }, { type: 'sou', value: 6 },
          { type: 'honor', value: '东' }, { type: 'honor', value: '东' }, { type: 'honor', value: '东' },
          { type: 'sou', value: 2 }
        ],
        winningTile: { type: 'sou', value: 2 }
      },

      // 二番役
      'sanshoku_doujun': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 2 }, { type: 'man', value: 3 },
          { type: 'pin', value: 1 }, { type: 'pin', value: 2 }, { type: 'pin', value: 3 },
          { type: 'sou', value: 1 }, { type: 'sou', value: 2 }, { type: 'sou', value: 3 },
          { type: 'honor', value: '白' }, { type: 'honor', value: '白' }, { type: 'honor', value: '白' },
          { type: 'man', value: 4 }
        ],
        winningTile: { type: 'man', value: 4 }
      },
      'ittsu': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 2 }, { type: 'man', value: 3 },
          { type: 'man', value: 4 }, { type: 'man', value: 5 }, { type: 'man', value: 6 },
          { type: 'man', value: 7 }, { type: 'man', value: 8 }, { type: 'man', value: 9 },
          { type: 'pin', value: 2 }, { type: 'pin', value: 3 }, { type: 'pin', value: 4 },
          { type: 'sou', value: 5 }
        ],
        winningTile: { type: 'sou', value: 5 }
      },
      'chanta': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 2 }, { type: 'man', value: 3 },
          { type: 'pin', value: 7 }, { type: 'pin', value: 8 }, { type: 'pin', value: 9 },
          { type: 'sou', value: 1 }, { type: 'sou', value: 1 }, { type: 'sou', value: 1 },
          { type: 'honor', value: '东' }, { type: 'honor', value: '东' }, { type: 'honor', value: '东' },
          { type: 'sou', value: 9 }
        ],
        winningTile: { type: 'sou', value: 9 }
      },
      'chiitoi': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'man', value: 2 }, { type: 'man', value: 2 },
          { type: 'pin', value: 3 }, { type: 'pin', value: 3 },
          { type: 'pin', value: 4 }, { type: 'pin', value: 4 },
          { type: 'sou', value: 5 }, { type: 'sou', value: 5 },
          { type: 'sou', value: 6 }, { type: 'sou', value: 6 },
          { type: 'honor', value: '白' }
        ],
        winningTile: { type: 'honor', value: '白' }
      },
      'toitoi': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'pin', value: 2 }, { type: 'pin', value: 2 }, { type: 'pin', value: 2 },
          { type: 'sou', value: 3 }, { type: 'sou', value: 3 }, { type: 'sou', value: 3 },
          { type: 'honor', value: '白' }, { type: 'honor', value: '白' }, { type: 'honor', value: '白' },
          { type: 'man', value: 4 }
        ],
        winningTile: { type: 'man', value: 4 }
      },
      'sanankou': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'pin', value: 2 }, { type: 'pin', value: 2 }, { type: 'pin', value: 2 },
          { type: 'sou', value: 3 }, { type: 'sou', value: 3 }, { type: 'sou', value: 3 },
          { type: 'man', value: 4 }, { type: 'man', value: 5 }, { type: 'man', value: 6 },
          { type: 'honor', value: '白' }
        ],
        winningTile: { type: 'honor', value: '白' }
      },
      'sanshoku_doukou': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'pin', value: 1 }, { type: 'pin', value: 1 }, { type: 'pin', value: 1 },
          { type: 'sou', value: 1 }, { type: 'sou', value: 1 }, { type: 'sou', value: 1 },
          { type: 'man', value: 2 }, { type: 'man', value: 3 }, { type: 'man', value: 4 },
          { type: 'pin', value: 5 }
        ],
        winningTile: { type: 'pin', value: 5 }
      },

      // 三番役
      'honitsu': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'man', value: 2 }, { type: 'man', value: 2 },
          { type: 'man', value: 3 }, { type: 'man', value: 3 },
          { type: 'man', value: 4 }, { type: 'man', value: 4 },
          { type: 'honor', value: '东' }, { type: 'honor', value: '东' }, { type: 'honor', value: '东' },
          { type: 'honor', value: '南' }, { type: 'honor', value: '南' }
        ],
        winningTile: { type: 'honor', value: '南' }
      },
      'junchan': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 2 }, { type: 'man', value: 3 },
          { type: 'pin', value: 7 }, { type: 'pin', value: 8 }, { type: 'pin', value: 9 },
          { type: 'sou', value: 1 }, { type: 'sou', value: 2 }, { type: 'sou', value: 3 },
          { type: 'man', value: 9 }, { type: 'man', value: 9 }, { type: 'man', value: 9 },
          { type: 'sou', value: 9 }
        ],
        winningTile: { type: 'sou', value: 9 }
      },
      'ryanpeikou': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 2 },
          { type: 'man', value: 2 }, { type: 'man', value: 3 }, { type: 'man', value: 3 },
          { type: 'pin', value: 4 }, { type: 'pin', value: 4 }, { type: 'pin', value: 5 },
          { type: 'pin', value: 5 }, { type: 'pin', value: 6 }, { type: 'pin', value: 6 },
          { type: 'sou', value: 7 }
        ],
        winningTile: { type: 'sou', value: 7 }
      },

      // 六番役
      'chinitsu': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'man', value: 2 }, { type: 'man', value: 2 },
          { type: 'man', value: 3 }, { type: 'man', value: 3 },
          { type: 'man', value: 4 }, { type: 'man', value: 4 },
          { type: 'man', value: 5 }, { type: 'man', value: 5 },
          { type: 'man', value: 6 }, { type: 'man', value: 6 },
          { type: 'man', value: 7 }
        ],
        winningTile: { type: 'man', value: 7 }
      },

      // 役满
      'kokushi': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 9 },
          { type: 'pin', value: 1 }, { type: 'pin', value: 9 },
          { type: 'sou', value: 1 }, { type: 'sou', value: 9 },
          { type: 'honor', value: '东' }, { type: 'honor', value: '南' },
          { type: 'honor', value: '西' }, { type: 'honor', value: '北' },
          { type: 'honor', value: '白' }, { type: 'honor', value: '发' },
          { type: 'honor', value: '中' }
        ],
        winningTile: { type: 'honor', value: '中' }
      },
      'suuankou': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'pin', value: 2 }, { type: 'pin', value: 2 }, { type: 'pin', value: 2 },
          { type: 'sou', value: 3 }, { type: 'sou', value: 3 }, { type: 'sou', value: 3 },
          { type: 'honor', value: '白' }, { type: 'honor', value: '白' }, { type: 'honor', value: '白' },
          { type: 'man', value: 5 }
        ],
        winningTile: { type: 'man', value: 5 }
      },
      'daisangen': {
        tiles: [
          { type: 'honor', value: '白' }, { type: 'honor', value: '白' }, { type: 'honor', value: '白' },
          { type: 'honor', value: '发' }, { type: 'honor', value: '发' }, { type: 'honor', value: '发' },
          { type: 'honor', value: '中' }, { type: 'honor', value: '中' }, { type: 'honor', value: '中' },
          { type: 'man', value: 1 }, { type: 'man', value: 2 }, { type: 'man', value: 3 },
          { type: 'pin', value: 5 }
        ],
        winningTile: { type: 'pin', value: 5 }
      },
      'shousuushii': {
        tiles: [
          { type: 'honor', value: '东' }, { type: 'honor', value: '东' }, { type: 'honor', value: '东' },
          { type: 'honor', value: '南' }, { type: 'honor', value: '南' }, { type: 'honor', value: '南' },
          { type: 'honor', value: '西' }, { type: 'honor', value: '西' }, { type: 'honor', value: '西' },
          { type: 'honor', value: '北' }, { type: 'honor', value: '北' },
          { type: 'man', value: 1 }, { type: 'man', value: 2 }
        ],
        winningTile: { type: 'man', value: 3 }
      },
      'daisuushii': {
        tiles: [
          { type: 'honor', value: '东' }, { type: 'honor', value: '东' }, { type: 'honor', value: '东' },
          { type: 'honor', value: '南' }, { type: 'honor', value: '南' }, { type: 'honor', value: '南' },
          { type: 'honor', value: '西' }, { type: 'honor', value: '西' }, { type: 'honor', value: '西' },
          { type: 'honor', value: '北' }, { type: 'honor', value: '北' }, { type: 'honor', value: '北' },
          { type: 'man', value: 1 }
        ],
        winningTile: { type: 'man', value: 1 }
      },
      'tsuuiisou': {
        tiles: [
          { type: 'honor', value: '东' }, { type: 'honor', value: '东' }, { type: 'honor', value: '东' },
          { type: 'honor', value: '南' }, { type: 'honor', value: '南' }, { type: 'honor', value: '南' },
          { type: 'honor', value: '白' }, { type: 'honor', value: '白' }, { type: 'honor', value: '白' },
          { type: 'honor', value: '发' }, { type: 'honor', value: '发' }, { type: 'honor', value: '发' },
          { type: 'honor', value: '中' }
        ],
        winningTile: { type: 'honor', value: '中' }
      },
      'chinroutou': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'man', value: 9 }, { type: 'man', value: 9 }, { type: 'man', value: 9 },
          { type: 'pin', value: 1 }, { type: 'pin', value: 1 }, { type: 'pin', value: 1 },
          { type: 'pin', value: 9 }, { type: 'pin', value: 9 }, { type: 'pin', value: 9 },
          { type: 'sou', value: 1 }
        ],
        winningTile: { type: 'sou', value: 1 }
      },
      'ryuuiisou': {
        tiles: [
          { type: 'sou', value: 2 }, { type: 'sou', value: 2 }, { type: 'sou', value: 2 },
          { type: 'sou', value: 3 }, { type: 'sou', value: 3 }, { type: 'sou', value: 3 },
          { type: 'sou', value: 4 }, { type: 'sou', value: 4 }, { type: 'sou', value: 4 },
          { type: 'sou', value: 6 }, { type: 'sou', value: 6 }, { type: 'sou', value: 6 },
          { type: 'honor', value: '发' }
        ],
        winningTile: { type: 'honor', value: '发' }
      },
      'sankantsu': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'pin', value: 2 }, { type: 'pin', value: 2 }, { type: 'pin', value: 2 }, { type: 'pin', value: 2 },
          { type: 'sou', value: 3 }, { type: 'sou', value: 3 }, { type: 'sou', value: 3 }, { type: 'sou', value: 3 },
          { type: 'man', value: 4 }
        ],
        winningTile: { type: 'man', value: 5 }
      },
      'suukantsu': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'pin', value: 2 }, { type: 'pin', value: 2 }, { type: 'pin', value: 2 }, { type: 'pin', value: 2 },
          { type: 'sou', value: 3 }, { type: 'sou', value: 3 }, { type: 'sou', value: 3 }, { type: 'sou', value: 3 },
          { type: 'honor', value: '白' }, { type: 'honor', value: '白' }, { type: 'honor', value: '白' }, { type: 'honor', value: '白' }
        ],
        winningTile: { type: 'man', value: 5 }
      },
      'chuurenpoutou': {
        tiles: [
          { type: 'man', value: 1 }, { type: 'man', value: 1 }, { type: 'man', value: 1 },
          { type: 'man', value: 2 }, { type: 'man', value: 3 }, { type: 'man', value: 4 },
          { type: 'man', value: 5 }, { type: 'man', value: 6 }, { type: 'man', value: 7 },
          { type: 'man', value: 8 }, { type: 'man', value: 9 }, { type: 'man', value: 9 },
          { type: 'man', value: 9 }
        ],
        winningTile: { type: 'man', value: 5 }
      }
    };
    
    return exampleHands[yaku.id] || null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <HeaderBar title="日本麻将役种速查" />
      
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
        {/* 搜索和筛选 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索役种名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* 分类筛选 */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as YakuCategory | 'all')}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
              >
                <option value="all">全部分类</option>
                {Object.values(YakuCategory).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 分类统计 */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categoryStats.map(({ category, count, icon }) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? 'all' : category)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                  ${selectedCategory === category 
                    ? getCategoryColor(category) 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                {icon}
                <span>{category}</span>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 役种列表 */}
        <div className="grid gap-6">
          {filteredYaku.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">没有找到匹配的役种</p>
            </div>
          ) : (
            filteredYaku.map((yaku) => (
              <div
                key={yaku.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  {/* 役种标题 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`
                        px-3 py-1 rounded-lg border text-sm font-medium
                        ${getCategoryColor(yaku.category)}
                      `}>
                        {getHanText(yaku)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {yaku.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {yaku.nameJp}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setExpandedYaku(expandedYaku === yaku.id ? null : yaku.id)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      {expandedYaku === yaku.id ? '收起' : '详情'}
                    </button>
                  </div>

                  {/* 役种描述 */}
                  <p className="text-gray-700 mb-4">
                    {yaku.description}
                  </p>

                  {/* 展开的详细信息 */}
                  {expandedYaku === yaku.id && (
                    <div className="border-t pt-4 space-y-4">
                      {/* 成立条件 */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">成立条件：</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {yaku.conditions.map((condition, index) => (
                            <li key={index} className="text-gray-600 text-sm">
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 牌型示例 */}
                      {getExampleHand(yaku) && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">牌型示例：</h4>
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <MahjongHand
                              tiles={getExampleHand(yaku).tiles}
                              winningTile={getExampleHand(yaku).winningTile}
                              size="sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* 特殊标记 */}
                      <div className="flex gap-2">
                        {yaku.menzen && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            门前清限定
                          </span>
                        )}
                        {yaku.isYakuman && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            役满
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 页面底部信息 */}
        <div className="text-center mt-12 text-gray-500">
          <p>共收录 {yakuList.length} 种役种</p>
          <p className="text-sm mt-2">
            数据来源于标准日本麻将规则，仅供参考学习使用
          </p>
        </div>
        
        <ScrollToTop />
        </div>
      </div>
    </div>
  );
};

export default YakuGuide;