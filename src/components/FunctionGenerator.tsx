import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Code, AlertCircle, Plus, Trash2, Edit3, Copy } from 'lucide-react';
import { FunctionType, FunctionParams, CurvePoint, RankConfig, CustomFunctionParam, RankRangeConfig } from '../../shared/types';

interface FunctionGeneratorProps {
  ranks: RankConfig[];
  onGenerate: (points: CurvePoint[]) => void;
  onPreview: (points: CurvePoint[]) => void;
  className?: string;
}

const FunctionGenerator: React.FC<FunctionGeneratorProps> = ({
  ranks,
  onGenerate,
  onPreview,
  className = ''
}) => {
  const [params, setParams] = useState<FunctionParams>({
    type: 'custom',
    startPoints: 0,
    endPoints: 9000,
    startRank: 1,
    endRank: ranks.length || 91,
    customExpression: 'a * x + b',
    customParams: [
      { name: 'a', value: 1, description: '斜率' },
      { name: 'b', value: 0, description: '截距' }
    ],
    rangeConfigs: [
      {
          id: '1',
          name: '初级段位',
          startRank: 1,
          endRank: 30,
          startPoints: 0, // 保留字段但不再使用
          endPoints: 0, // 保留字段但不再使用
          expression: 'a * x + b',
          params: [
            { name: 'a', value: 100, description: '斜率' },
            { name: 'b', value: 0, description: '截距' }
          ],
          enabled: true
        },
        {
          id: '2',
          name: '高级段位',
          startRank: 31,
          endRank: ranks.length || 91,
          startPoints: 0, // 保留字段但不再使用
          endPoints: 0, // 保留字段但不再使用
          expression: 'a * x^2 + b * x + c',
          params: [
            { name: 'a', value: 2, description: '二次项系数' },
            { name: 'b', value: 50, description: '一次项系数' },
            { name: 'c', value: 1000, description: '常数项' }
          ],
          enabled: true
        }
    ]
  });
  const [previewPoints, setPreviewPoints] = useState<CurvePoint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeRangeId, setActiveRangeId] = useState<string>('1');

  // 解析自定义函数表达式中的参数
  const parseCustomExpression = useCallback((expression: string): CustomFunctionParam[] => {
    if (!expression) return [];
    
    // 匹配所有字母参数
    const paramMatches = expression.match(/\b[a-zA-Z]+\b/g) || [];
    const uniqueParams = [...new Set(paramMatches)];
    
    // 过滤掉x（自变量）、数学常数和函数名
    const mathConstants = ['x', 'e', 'pi', 'ln', 'log', 'sin', 'cos', 'tan', 'abs', 'sqrt', 'pow', 'exp'];
    const validParams = uniqueParams.filter(param => 
      !mathConstants.includes(param.toLowerCase())
    );
    
    return validParams.map(param => ({
      name: param,
      value: 1,
      description: `参数 ${param}`
    }));
  }, []);

  // 验证自定义函数表达式
  const validateCustomExpression = useCallback((expression: string): string => {
    if (!expression.trim()) {
      return '表达式不能为空';
    }
    
    // 检查是否包含x变量
    if (!/\bx\b/.test(expression)) {
      return '表达式必须包含变量 x';
    }
    
    // 检查基本语法（简单验证）
    const invalidChars = /[^a-zA-Z0-9+\-*/().\s^]/;
    if (invalidChars.test(expression.replace(/\b(ln|log|sin|cos|tan|abs|sqrt|pow|exp|pi|e)\b/g, ''))) {
      return '表达式包含无效字符';
    }
    
    // 检查括号匹配
    const openBrackets = (expression.match(/\(/g) || []).length;
    const closeBrackets = (expression.match(/\)/g) || []).length;
    if (openBrackets !== closeBrackets) {
      return '括号不匹配';
    }
    
    return '';
  }, []);

  // 计算自定义函数值
  const evaluateCustomExpression = useCallback((x: number, expression: string, customParams: CustomFunctionParam[]): number => {
    try {
      let expr = expression;
      
      // 替换参数值
      customParams.forEach(param => {
        const regex = new RegExp(`\\b${param.name}\\b`, 'g');
        expr = expr.replace(regex, param.value.toString());
      });
      
      // 替换x值
      expr = expr.replace(/\bx\b/g, x.toString());
      
      // 替换数学函数和常数
      expr = expr.replace(/\bln\(/g, 'Math.log(');
      expr = expr.replace(/\blog\(/g, 'Math.log10(');
      expr = expr.replace(/\bsin\(/g, 'Math.sin(');
      expr = expr.replace(/\bcos\(/g, 'Math.cos(');
      expr = expr.replace(/\btan\(/g, 'Math.tan(');
      expr = expr.replace(/\babs\(/g, 'Math.abs(');
      expr = expr.replace(/\bsqrt\(/g, 'Math.sqrt(');
      expr = expr.replace(/\bpow\(/g, 'Math.pow(');
      expr = expr.replace(/\bexp\(/g, 'Math.exp(');
      expr = expr.replace(/\bpi\b/g, 'Math.PI');
      expr = expr.replace(/\be\b/g, 'Math.E');
      expr = expr.replace(/\^/g, '**'); // 幂运算
      
      // 使用Function构造器安全地计算表达式
      const result = new Function('Math', `return ${expr}`)(Math);
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('计算结果无效');
      }
      
      return result;
    } catch (error) {
      console.warn('自定义函数计算错误:', error);
      return 0;
    }
  }, []);

  // 生成曲线点
  const generatePoints = useCallback((): CurvePoint[] => {
    if (ranks.length === 0) return [];

    const sortedRanks = [...ranks].sort((a, b) => a.rankOrder - b.rankOrder);
    const points: CurvePoint[] = [];
    
    sortedRanks.forEach((rank) => {
      const x = rank.rankOrder; // x是段位序号（自变量）
      let y = 0;
      
      // 查找适用的范围配置
      const applicableRange = params.rangeConfigs.find(range => 
        range.enabled && x >= range.startRank && x <= range.endRank
      );
      
      if (applicableRange) {
        // 使用范围配置的公式计算，x的范围是起始段位到结束段位
        y = evaluateCustomExpression(x, applicableRange.expression, applicableRange.params);
      } else {
        // 使用全局配置（向后兼容）
        if (params.customExpression && params.customParams) {
          y = evaluateCustomExpression(x, params.customExpression, params.customParams);
        }
      }
      
      // 确保积分为正整数
      y = Math.max(0, Math.round(y));
      
      points.push({
        x: rank.rankOrder,
        y,
        rankId: rank.id,
        rankName: rank.rankName
      });
    });
    
    return points;
  }, [ranks, params, evaluateCustomExpression]);

  // 更新预览
  useEffect(() => {
    if (ranks.length > 0) {
      const points = generatePoints();
      setPreviewPoints(points);
      onPreview(points);
    }
  }, [params, ranks, generatePoints, onPreview]);

  // 添加新的段位范围
  const addRangeConfig = () => {
    const newId = Date.now().toString();
    const lastRange = params.rangeConfigs[params.rangeConfigs.length - 1];
    const startRank = lastRange ? lastRange.endRank + 1 : 1;
    const endRank = Math.min(startRank + 20, ranks.length);
    
    const newRange: RankRangeConfig = {
      id: newId,
      name: `段位范围 ${params.rangeConfigs.length + 1}`,
      startRank,
      endRank,
      startPoints: 0, // 保留字段但不再使用
      endPoints: 0, // 保留字段但不再使用
      expression: 'a * x + b',
      params: [
        { name: 'a', value: 100, description: '斜率' },
        { name: 'b', value: 0, description: '截距' }
      ],
      enabled: true
    };
    
    setParams(prev => ({
      ...prev,
      rangeConfigs: [...prev.rangeConfigs, newRange]
    }));
    setActiveRangeId(newId);
  };

  // 删除段位范围
  const removeRangeConfig = (id: string) => {
    if (params.rangeConfigs.length <= 1) return; // 至少保留一个范围
    
    setParams(prev => ({
      ...prev,
      rangeConfigs: prev.rangeConfigs.filter(range => range.id !== id)
    }));
    
    if (activeRangeId === id) {
      setActiveRangeId(params.rangeConfigs[0].id);
    }
  };

  // 复制段位范围
  const duplicateRangeConfig = (id: string) => {
    const sourceRange = params.rangeConfigs.find(range => range.id === id);
    if (!sourceRange) return;
    
    const newId = Date.now().toString();
    const newRange: RankRangeConfig = {
      ...sourceRange,
      id: newId,
      name: `${sourceRange.name} (副本)`,
      enabled: false // 默认禁用副本
    };
    
    setParams(prev => ({
      ...prev,
      rangeConfigs: [...prev.rangeConfigs, newRange]
    }));
    setActiveRangeId(newId);
  };

  // 更新段位范围配置
  const updateRangeConfig = (id: string, updates: Partial<RankRangeConfig>) => {
    setParams(prev => ({
      ...prev,
      rangeConfigs: prev.rangeConfigs.map(range =>
        range.id === id ? { ...range, ...updates } : range
      )
    }));
  };

  // 处理表达式更改
  const handleExpressionChange = (id: string, expression: string) => {
    const error = validateCustomExpression(expression);
    const customParams = parseCustomExpression(expression);
    
    updateRangeConfig(id, {
      expression,
      params: customParams
    });
  };

  // 处理参数值更改
  const handleParamChange = (rangeId: string, paramName: string, value: number) => {
    setParams(prev => ({
      ...prev,
      rangeConfigs: prev.rangeConfigs.map(range =>
        range.id === rangeId
          ? {
              ...range,
              params: range.params.map(param =>
                param.name === paramName ? { ...param, value } : param
              )
            }
          : range
      )
    }));
  };

  // 应用生成的曲线
  const handleApply = async () => {
    setIsGenerating(true);
    try {
      const points = generatePoints();
      onGenerate(points);
    } finally {
      setIsGenerating(false);
    }
  };

  // 重置参数
  const handleReset = () => {
    setParams({
      type: 'custom',
      startPoints: 0,
      endPoints: 9000,
      startRank: 1,
      endRank: ranks.length || 91,
      customExpression: 'a * x + b',
      customParams: [
        { name: 'a', value: 1, description: '斜率' },
        { name: 'b', value: 0, description: '截距' }
      ],
      rangeConfigs: [
        {
          id: '1',
          name: '初级段位',
          startRank: 1,
          endRank: 30,
          startPoints: 0, // 保留字段但不再使用
          endPoints: 0, // 保留字段但不再使用
          expression: 'a * x + b',
          params: [
            { name: 'a', value: 100, description: '斜率' },
            { name: 'b', value: 0, description: '截距' }
          ],
          enabled: true
        }
      ]
    });
    setActiveRangeId('1');
  };

  const activeRange = params.rangeConfigs.find(range => range.id === activeRangeId);

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg ${className}`}>
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">多段式函数生成器</h3>
      </div>

      {/* 段位范围管理 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">段位范围配置</h4>
          <button
            onClick={addRangeConfig}
            className="flex items-center space-x-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>添加范围</span>
          </button>
        </div>

        {/* 范围列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {params.rangeConfigs.map((range) => (
            <div
              key={range.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                activeRangeId === range.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setActiveRangeId(range.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={range.enabled}
                    onChange={(e) => updateRangeConfig(range.id, { enabled: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-800">{range.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateRangeConfig(range.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="复制"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {params.rangeConfigs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRangeConfig(range.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                段位: {range.startRank} - {range.endRank}
              </div>
              <div className="text-xs text-gray-400 mt-1 font-mono">
                {range.expression}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 当前范围配置 */}
      {activeRange && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            编辑范围: {activeRange.name}
          </h4>

          {/* 范围基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">范围名称</label>
              <input
                type="text"
                value={activeRange.name}
                onChange={(e) => updateRangeConfig(activeRange.id, { name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`enabled-${activeRange.id}`}
                checked={activeRange.enabled}
                onChange={(e) => updateRangeConfig(activeRange.id, { enabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor={`enabled-${activeRange.id}`} className="text-sm text-gray-700">
                启用此范围
              </label>
            </div>
          </div>

          {/* 段位范围 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">起始段位</label>
              <input
                type="number"
                value={activeRange.startRank}
                onChange={(e) => updateRangeConfig(activeRange.id, { startRank: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
                max={ranks.length}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">结束段位</label>
              <input
                type="number"
                value={activeRange.endRank}
                onChange={(e) => updateRangeConfig(activeRange.id, { endRank: parseInt(e.target.value) || ranks.length })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
                max={ranks.length}
              />
            </div>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>说明：</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• x 是自变量，表示段位序号（从起始段位到结束段位）</li>
                <li>• 函数表达式中除了 x 以外的字母都会被识别为参数</li>
                <li>• 积分值通过函数表达式自动计算，无需手动设置</li>
              </ul>
            </div>
          </div>

          {/* 函数表达式 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              函数表达式 <span className="text-gray-500">(格式: y = 关于x的函数，x为段位序号)</span>
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={activeRange.expression}
                onChange={(e) => handleExpressionChange(activeRange.id, e.target.value)}
                placeholder="例如: a * x + b + c 或 a * x^2 + b * x + c"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="text-xs text-gray-500">
                支持的函数: +, -, *, /, ^(幂), ln, log, sin, cos, tan, abs, sqrt, exp, pi, e
              </div>
            </div>
          </div>

          {/* 函数参数 */}
          {activeRange.params.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">函数参数</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {activeRange.params.map((param) => (
                  <div key={param.name}>
                    <label className="block text-xs text-gray-600 mb-1">
                      参数 {param.name.toUpperCase()}
                      {param.description && (
                        <span className="text-gray-400 ml-1">({param.description})</span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={param.value}
                      onChange={(e) => handleParamChange(activeRange.id, param.name, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 预览信息 */}
      {previewPoints.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">预览信息</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">最低积分:</span>
              <span className="ml-2 font-medium">{Math.min(...previewPoints.map(p => p.y)).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">最高积分:</span>
              <span className="ml-2 font-medium">{Math.max(...previewPoints.map(p => p.y)).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">积分跨度:</span>
              <span className="ml-2 font-medium">
                {(Math.max(...previewPoints.map(p => p.y)) - Math.min(...previewPoints.map(p => p.y))).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">启用范围:</span>
              <span className="ml-2 font-medium">{params.rangeConfigs.filter(r => r.enabled).length}</span>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleApply}
          disabled={isGenerating || previewPoints.length === 0}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          {isGenerating ? '生成中...' : '应用曲线'}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
        >
          重置配置
        </button>
      </div>
    </div>
  );
};

export default FunctionGenerator;