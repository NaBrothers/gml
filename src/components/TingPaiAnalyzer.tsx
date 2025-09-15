import React, { useState } from 'react';
import { Plus, Minus, Target, RotateCcw, AlertCircle } from 'lucide-react';
import MahjongTile from './MahjongTile';
import MahjongHand from './MahjongHand';

interface Tile {
  type: 'man' | 'pin' | 'sou' | 'honor';
  value: number | string;
}

interface TingPaiAnalysis {
  tingType: 'ryanmen' | 'penchan' | 'kanchan' | 'tanki' | 'complex';
  waitingTiles: Tile[];
  remainingCount: number;
  efficiency: number;
  description: string;
}

const TingPaiAnalyzer: React.FC = () => {
  const [handTiles, setHandTiles] = useState<Tile[]>([]);
  const [tingPaiResult, setTingPaiResult] = useState<TingPaiAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 可用牌型定义
  const availableTiles = [
    // 万子
    ...Array.from({ length: 9 }, (_, i) => ({ type: 'man' as const, value: i + 1 })),
    // 筒子
    ...Array.from({ length: 9 }, (_, i) => ({ type: 'pin' as const, value: i + 1 })),
    // 索子
    ...Array.from({ length: 9 }, (_, i) => ({ type: 'sou' as const, value: i + 1 })),
    // 字牌
    { type: 'honor' as const, value: '东' },
    { type: 'honor' as const, value: '南' },
    { type: 'honor' as const, value: '西' },
    { type: 'honor' as const, value: '北' },
    { type: 'honor' as const, value: '白' },
    { type: 'honor' as const, value: '发' },
    { type: 'honor' as const, value: '中' },
  ];

  // 添加牌到手牌
  const addTile = (tile: Tile) => {
    if (handTiles.length < 13) {
      setHandTiles([...handTiles, tile]);
      setTingPaiResult(null);
    }
  };

  // 移除手牌中的最后一张牌
  const removeLastTile = () => {
    if (handTiles.length > 0) {
      setHandTiles(handTiles.slice(0, -1));
      setTingPaiResult(null);
    }
  };

  // 清空手牌
  const clearHand = () => {
    setHandTiles([]);
    setTingPaiResult(null);
  };

  // 分析听牌
  const analyzeTingPai = async () => {
    if (handTiles.length !== 13) {
      alert('请输入13张手牌');
      return;
    }

    setIsAnalyzing(true);
    
    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 简单的听牌分析逻辑（这里是示例，实际需要复杂的麻将算法）
    const analysis: TingPaiAnalysis = {
      tingType: 'ryanmen',
      waitingTiles: [
        { type: 'man', value: 4 },
        { type: 'man', value: 7 }
      ],
      remainingCount: 8,
      efficiency: 0.85,
      description: '两面听牌，进张数较多，胜率较高'
    };

    setTingPaiResult(analysis);
    setIsAnalyzing(false);
  };

  // 获取听牌类型的中文名称
  const getTingTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'ryanmen': '两面听',
      'penchan': '边张听',
      'kanchan': '坎张听',
      'tanki': '单钓听',
      'complex': '复合听'
    };
    return typeMap[type] || '未知';
  };

  // 获取效率评级
  const getEfficiencyRating = (efficiency: number) => {
    if (efficiency >= 0.8) return { text: '优秀', color: 'text-green-600', bg: 'bg-green-100' };
    if (efficiency >= 0.6) return { text: '良好', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (efficiency >= 0.4) return { text: '一般', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: '较差', color: 'text-red-600', bg: 'bg-red-100' };
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 手牌输入区域 */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            手牌输入 ({handTiles.length}/13)
          </h3>
          
          {/* 当前手牌显示 */}
          <div className="bg-white rounded-lg p-4 mb-4 min-h-[80px] border-2 border-dashed border-gray-200">
            {handTiles.length > 0 ? (
              <MahjongHand tiles={handTiles} size="sm" />
            ) : (
              <div className="flex items-center justify-center h-16 text-gray-400">
                点击下方牌型添加到手牌中
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={removeLastTile}
              disabled={handTiles.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
              撤销
            </button>
            <button
              onClick={clearHand}
              disabled={handTiles.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              清空
            </button>
            <button
              onClick={analyzeTingPai}
              disabled={handTiles.length !== 13 || isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-auto"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  分析听牌
                </>
              )}
            </button>
          </div>
        </div>

        {/* 牌型选择区域 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">选择牌型</h3>
          
          {/* 万子 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">万子</h4>
            <div className="flex flex-wrap gap-2">
              {availableTiles.filter(tile => tile.type === 'man').map((tile, index) => (
                <button
                  key={`man-${index}`}
                  onClick={() => addTile(tile)}
                  disabled={handTiles.length >= 13}
                  className="transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MahjongTile type={tile.type} value={tile.value} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* 筒子 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">筒子</h4>
            <div className="flex flex-wrap gap-2">
              {availableTiles.filter(tile => tile.type === 'pin').map((tile, index) => (
                <button
                  key={`pin-${index}`}
                  onClick={() => addTile(tile)}
                  disabled={handTiles.length >= 13}
                  className="transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MahjongTile type={tile.type} value={tile.value} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* 索子 */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 mb-2">索子</h4>
            <div className="flex flex-wrap gap-2">
              {availableTiles.filter(tile => tile.type === 'sou').map((tile, index) => (
                <button
                  key={`sou-${index}`}
                  onClick={() => addTile(tile)}
                  disabled={handTiles.length >= 13}
                  className="transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MahjongTile type={tile.type} value={tile.value} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* 字牌 */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">字牌</h4>
            <div className="flex flex-wrap gap-2">
              {availableTiles.filter(tile => tile.type === 'honor').map((tile, index) => (
                <button
                  key={`honor-${index}`}
                  onClick={() => addTile(tile)}
                  disabled={handTiles.length >= 13}
                  className="transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MahjongTile type={tile.type} value={tile.value} size="sm" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 分析结果显示 */}
        {tingPaiResult && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              听牌分析结果
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">听牌类型</h4>
                  <p className="text-lg font-bold text-purple-600">
                    {getTingTypeText(tingPaiResult.tingType)}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">进张数量</h4>
                  <p className="text-lg font-bold text-blue-600">
                    {tingPaiResult.remainingCount} 张
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">效率评级</h4>
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium 
                      ${getEfficiencyRating(tingPaiResult.efficiency).bg} 
                      ${getEfficiencyRating(tingPaiResult.efficiency).color}
                    `}>
                      {getEfficiencyRating(tingPaiResult.efficiency).text}
                    </span>
                    <span className="text-gray-600">
                      ({(tingPaiResult.efficiency * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* 等待牌显示 */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">等待牌型</h4>
                  <div className="flex gap-2">
                    {tingPaiResult.waitingTiles.map((tile, index) => (
                      <MahjongTile 
                        key={index}
                        type={tile.type} 
                        value={tile.value} 
                        size="md" 
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">分析说明</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {tingPaiResult.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 帮助说明 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">使用说明：</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 点击下方牌型添加到手牌中，需要输入13张牌</li>
                <li>• 点击"分析听牌"按钮获取详细的听牌分析</li>
                <li>• 分析结果包含听牌类型、进张数量和效率评估</li>
                <li>• 此为演示版本，实际分析算法需要进一步完善</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TingPaiAnalyzer;