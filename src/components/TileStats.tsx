import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Info, RefreshCw } from 'lucide-react';
import MahjongTile from './MahjongTile';

interface TileStatData {
  tile: {
    type: 'man' | 'pin' | 'sou' | 'honor';
    value: number | string;
  };
  frequency: number;
  efficiency: number;
  winRate: number;
  avgPoints: number;
}

interface YakuStatData {
  name: string;
  frequency: number;
  avgPoints: number;
  category: string;
}

const TileStats: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'tiles' | 'yaku' | 'patterns'>('tiles');
  const [selectedSuit, setSelectedSuit] = useState<'all' | 'man' | 'pin' | 'sou' | 'honor'>('all');

  // 模拟牌效统计数据
  const tileStatsData: TileStatData[] = [
    { tile: { type: 'man', value: 5 }, frequency: 0.12, efficiency: 0.85, winRate: 0.68, avgPoints: 2400 },
    { tile: { type: 'pin', value: 5 }, frequency: 0.11, efficiency: 0.82, winRate: 0.65, avgPoints: 2200 },
    { tile: { type: 'sou', value: 5 }, frequency: 0.10, efficiency: 0.80, winRate: 0.63, avgPoints: 2100 },
    { tile: { type: 'man', value: 1 }, frequency: 0.08, efficiency: 0.75, winRate: 0.58, avgPoints: 1900 },
    { tile: { type: 'man', value: 9 }, frequency: 0.08, efficiency: 0.74, winRate: 0.57, avgPoints: 1850 },
    { tile: { type: 'honor', value: '白' }, frequency: 0.06, efficiency: 0.65, winRate: 0.52, avgPoints: 1600 },
    { tile: { type: 'honor', value: '发' }, frequency: 0.06, efficiency: 0.64, winRate: 0.51, avgPoints: 1580 },
    { tile: { type: 'honor', value: '中' }, frequency: 0.05, efficiency: 0.63, winRate: 0.50, avgPoints: 1550 },
  ];

  // 模拟役种统计数据
  const yakuStatsData: YakuStatData[] = [
    { name: '立直', frequency: 0.35, avgPoints: 2200, category: '一番' },
    { name: '断幺九', frequency: 0.28, avgPoints: 1800, category: '一番' },
    { name: '平和', frequency: 0.22, avgPoints: 1600, category: '一番' },
    { name: '一盃口', frequency: 0.18, avgPoints: 1900, category: '一番' },
    { name: '三色同顺', frequency: 0.12, avgPoints: 2800, category: '二番' },
    { name: '对对和', frequency: 0.10, avgPoints: 3200, category: '二番' },
    { name: '七对子', frequency: 0.08, avgPoints: 2600, category: '二番' },
    { name: '混一色', frequency: 0.05, avgPoints: 4200, category: '三番' },
  ];

  // 听牌模式统计
  const patternStats = [
    { name: '两面听', frequency: 0.45, efficiency: 0.85, description: '最常见且效率最高的听牌方式' },
    { name: '边张听', frequency: 0.25, efficiency: 0.65, description: '效率中等，需要注意安全性' },
    { name: '坎张听', frequency: 0.18, efficiency: 0.58, description: '进张较少，但有时是唯一选择' },
    { name: '单钓听', frequency: 0.12, efficiency: 0.45, description: '效率最低，但可能获得高分' },
  ];

  // 过滤牌效数据
  const filteredTileStats = tileStatsData.filter(stat => 
    selectedSuit === 'all' || stat.tile.type === selectedSuit
  );

  // 视图选项
  const viewOptions = [
    { id: 'tiles', name: '牌效分析', icon: BarChart3, description: '分析各种牌的出现频率和效率' },
    { id: 'yaku', name: '役种统计', icon: PieChart, description: '统计各种役的出现频率和平均得分' },
    { id: 'patterns', name: '听牌模式', icon: TrendingUp, description: '分析不同听牌模式的效率' },
  ];

  // 花色过滤选项
  const suitOptions = [
    { id: 'all', name: '全部' },
    { id: 'man', name: '万子' },
    { id: 'pin', name: '筒子' },
    { id: 'sou', name: '索子' },
    { id: 'honor', name: '字牌' },
  ];

  const currentView = viewOptions.find(v => v.id === selectedView);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 视图选择 */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            统计视图选择
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {viewOptions.map((view) => {
              const Icon = view.icon;
              const isActive = selectedView === view.id;
              
              return (
                <button
                  key={view.id}
                  onClick={() => setSelectedView(view.id as any)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-300 text-left
                    ${isActive 
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg transform scale-105' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                    <h4 className="font-semibold">{view.name}</h4>
                  </div>
                  <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
                    {view.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 牌效分析视图 */}
        {selectedView === 'tiles' && (
          <div className="space-y-6">
            {/* 筛选控制 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800">花色筛选</h4>
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  刷新数据
                </button>
              </div>
              
              <div className="flex gap-2">
                {suitOptions.map((suit) => (
                  <button
                    key={suit.id}
                    onClick={() => setSelectedSuit(suit.id as any)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${selectedSuit === suit.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    {suit.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 牌效统计表格 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h4 className="font-semibold text-gray-800">牌效详细数据</h4>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">牌型</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">出现频率</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">效率指数</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">胜率</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">平均得分</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTileStats.map((stat, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <MahjongTile 
                              type={stat.tile.type}
                              value={stat.tile.value}
                              size="sm"
                            />
                            <span className="font-medium">
                              {stat.tile.type === 'honor' ? stat.tile.value : `${stat.tile.value}${stat.tile.type === 'man' ? '万' : stat.tile.type === 'pin' ? '筒' : '索'}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${stat.frequency * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{(stat.frequency * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${stat.efficiency * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{(stat.efficiency * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{(stat.winRate * 100).toFixed(1)}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">{stat.avgPoints.toLocaleString()}点</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 役种统计视图 */}
        {selectedView === 'yaku' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">役种出现频率统计</h4>
              
              <div className="grid gap-4">
                {yakuStatsData.map((yaku, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`
                        px-3 py-1 rounded-lg text-sm font-medium
                        ${yaku.category === '一番' ? 'bg-blue-100 text-blue-800' :
                          yaku.category === '二番' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'}
                      `}>
                        {yaku.category}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">{yaku.name}</h5>
                        <p className="text-sm text-gray-600">平均得分: {yaku.avgPoints.toLocaleString()}点</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">
                        {(yaku.frequency * 100).toFixed(1)}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-purple-500 h-2 rounded-full"
                          style={{ width: `${yaku.frequency * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 听牌模式视图 */}
        {selectedView === 'patterns' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-semibold text-gray-800 mb-4">听牌模式效率分析</h4>
              
              <div className="grid md:grid-cols-2 gap-6">
                {patternStats.map((pattern, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-800">{pattern.name}</h5>
                      <span className="text-sm font-medium text-purple-600">
                        {(pattern.frequency * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">出现频率</span>
                        <span>{(pattern.frequency * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${pattern.frequency * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">效率指数</span>
                        <span>{(pattern.efficiency * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${pattern.efficiency * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600">{pattern.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 数据说明 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">数据说明：</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 统计数据基于大量对局记录分析得出</li>
                <li>• 效率指数综合考虑进张数、胜率、得分等因素</li>
                <li>• 出现频率指该牌型在所有和牌中的占比</li>
                <li>• 数据仅供参考，实际对局中需根据具体情况判断</li>
                <li>• 此为演示版本，实际数据需要大量真实对局统计</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TileStats;