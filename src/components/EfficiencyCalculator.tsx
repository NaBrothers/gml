import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import MahjongTile from './MahjongTile';

interface EfficiencyOption {
  tile: {
    type: 'man' | 'pin' | 'sou' | 'honor';
    value: number | string;
  };
  efficiency: number;
  remainingTiles: number;
  description: string;
  recommendation: 'best' | 'good' | 'fair' | 'poor';
}

const EfficiencyCalculator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<'discard' | 'draw' | 'richi'>('discard');
  const [calculationResult, setCalculationResult] = useState<EfficiencyOption[] | null>(null);

  // 示例效率计算结果
  const mockEfficiencyData: EfficiencyOption[] = [
    {
      tile: { type: 'man', value: 5 },
      efficiency: 0.85,
      remainingTiles: 8,
      description: '两面听牌，进张数多，推荐打出',
      recommendation: 'best'
    },
    {
      tile: { type: 'pin', value: 3 },
      efficiency: 0.72,
      remainingTiles: 6,
      description: '边张听牌，效率较好',
      recommendation: 'good'
    },
    {
      tile: { type: 'sou', value: 7 },
      efficiency: 0.58,
      remainingTiles: 4,
      description: '坎张听牌，效率一般',
      recommendation: 'fair'
    },
    {
      tile: { type: 'honor', value: '白' },
      efficiency: 0.35,
      remainingTiles: 2,
      description: '单钓听牌，效率较低',
      recommendation: 'poor'
    }
  ];

  // 计算效率分析
  const calculateEfficiency = () => {
    // 模拟计算过程
    setTimeout(() => {
      setCalculationResult(mockEfficiencyData);
    }, 500);
  };

  // 获取推荐等级的样式
  const getRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case 'best':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          label: '最佳选择'
        };
      case 'good':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200',
          label: '良好选择'
        };
      case 'fair':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          label: '一般选择'
        };
      case 'poor':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          label: '较差选择'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          label: '未知'
        };
    }
  };

  // 场景选项
  const scenarios = [
    {
      id: 'discard',
      name: '舍牌效率',
      description: '分析当前手牌中各牌的舍牌效率',
      icon: TrendingUp
    },
    {
      id: 'draw',
      name: '摸牌价值',
      description: '计算不同牌型的摸牌价值',
      icon: BarChart3
    },
    {
      id: 'richi',
      name: '立直时机',
      description: '评估立直宣告的最佳时机',
      icon: Calculator
    }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 场景选择 */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            计算场景选择
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            {scenarios.map((scenario) => {
              const Icon = scenario.icon;
              const isActive = selectedScenario === scenario.id;
              
              return (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id as any)}
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
                    <h4 className="font-semibold">{scenario.name}</h4>
                  </div>
                  <p className={`text-sm ${isActive ? 'text-white/80' : 'text-gray-600'}`}>
                    {scenario.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 计算参数设置 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">计算参数</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                当前局数
              </label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="east1">东一局</option>
                <option value="east2">东二局</option>
                <option value="east3">东三局</option>
                <option value="east4">东四局</option>
                <option value="south1">南一局</option>
                <option value="south2">南二局</option>
                <option value="south3">南三局</option>
                <option value="south4">南四局</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自身位置
              </label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="east">东家</option>
                <option value="south">南家</option>
                <option value="west">西家</option>
                <option value="north">北家</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                剩余牌数
              </label>
              <input 
                type="number" 
                min="0" 
                max="70" 
                defaultValue="60"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                立直棒数
              </label>
              <input 
                type="number" 
                min="0" 
                max="4" 
                defaultValue="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={calculateEfficiency}
            className="mt-6 w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            开始计算
          </button>
        </div>

        {/* 计算结果 */}
        {calculationResult && (
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              {currentScenario?.name}分析结果
            </h3>

            <div className="space-y-4">
              {calculationResult.map((option, index) => {
                const style = getRecommendationStyle(option.recommendation);
                
                return (
                  <div 
                    key={index}
                    className={`
                      bg-white rounded-lg border-2 p-4 transition-all duration-300 hover:shadow-md
                      ${style.border}
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <MahjongTile 
                          type={option.tile.type}
                          value={option.tile.value}
                          size="md"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {option.tile.type === 'honor' ? option.tile.value : `${option.tile.value}${option.tile.type === 'man' ? '万' : option.tile.type === 'pin' ? '筒' : '索'}`}
                          </h4>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`
                          px-3 py-1 rounded-full text-sm font-medium mb-2
                          ${style.bg} ${style.text}
                        `}>
                          {style.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          效率: {(option.efficiency * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">剩余牌数:</span>
                        <span className="ml-2 font-medium">{option.remainingTiles}张</span>
                      </div>
                      <div>
                        <span className="text-gray-600">效率指数:</span>
                        <span className="ml-2 font-medium">{option.efficiency.toFixed(3)}</span>
                      </div>
                    </div>

                    {/* 效率条 */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            option.recommendation === 'best' ? 'bg-green-500' :
                            option.recommendation === 'good' ? 'bg-blue-500' :
                            option.recommendation === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${option.efficiency * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 计算说明 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">计算说明：</p>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>舍牌效率</strong>：分析打出不同牌对听牌的影响</li>
                <li>• <strong>摸牌价值</strong>：评估摸到特定牌型的价值</li>
                <li>• <strong>立直时机</strong>：判断何时立直最有利</li>
                <li>• 效率计算基于进张数、剩余牌数、局况等因素</li>
                <li>• 此为演示版本，实际算法需要更复杂的概率计算</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyCalculator;