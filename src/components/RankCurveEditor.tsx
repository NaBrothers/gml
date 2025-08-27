import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Settings, Eye, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { RankConfig, CurvePoint, CurveConfig, EditMode } from '../../shared/types';
import CurveChart from './CurveChart';
import FunctionGenerator from './FunctionGenerator';
import RankPreview from './RankPreview';
import { toast } from 'sonner';

interface RankCurveEditorProps {
  ranks: RankConfig[];
  onSave: (updatedRanks: RankConfig[]) => void;
  previewMode?: boolean;
  className?: string;
}

const RankCurveEditor: React.FC<RankCurveEditorProps> = ({
  ranks,
  onSave,
  previewMode = false,
  className = ''
}) => {
  const [curveConfig, setCurveConfig] = useState<CurveConfig>({
    points: [],
    originalRanks: [],
    modifiedRanks: [],
    isDirty: false
  });
  
  const [editMode, setEditMode] = useState<EditMode>('drag');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'function' | 'preview'>('chart');

  // 初始化曲线配置
  useEffect(() => {
    if (ranks.length > 0) {
      const sortedRanks = [...ranks].sort((a, b) => a.rankOrder - b.rankOrder);
      const points: CurvePoint[] = sortedRanks.map(rank => ({
        x: rank.rankOrder,
        y: rank.minPoints,
        rankId: rank.id,
        rankName: rank.rankName
      }));

      setCurveConfig({
        points,
        originalRanks: sortedRanks,
        modifiedRanks: sortedRanks,
        isDirty: false,
        lastSaved: new Date().toISOString()
      });
    }
  }, [ranks]);

  // 将曲线点转换为段位配置
  const convertPointsToRanks = useCallback((points: CurvePoint[]): RankConfig[] => {
    return points.map((point, index) => {
      const originalRank = curveConfig.originalRanks.find(rank => rank.id === point.rankId);
      if (!originalRank) return null;

      // 计算积分范围
      const minPoints = point.y;
      const nextPoint = points[index + 1];
      const maxPoints = nextPoint ? nextPoint.y - 1 : minPoints + 99;

      return {
        ...originalRank,
        minPoints,
        maxPoints: Math.max(minPoints, maxPoints)
      };
    }).filter(Boolean) as RankConfig[];
  }, [curveConfig.originalRanks]);

  // 处理曲线点更新
  const handlePointUpdate = useCallback((updatedPoints: CurvePoint[]) => {
    const modifiedRanks = convertPointsToRanks(updatedPoints);
    
    setCurveConfig(prev => ({
      ...prev,
      points: updatedPoints,
      modifiedRanks,
      isDirty: true
    }));
  }, [convertPointsToRanks]);

  // 处理函数生成
  const handleFunctionGenerate = useCallback((generatedPoints: CurvePoint[]) => {
    handlePointUpdate(generatedPoints);
    setActiveTab('chart');
    toast.success('函数曲线已生成');
  }, [handlePointUpdate]);

  // 处理函数预览
  const handleFunctionPreview = useCallback((previewPoints: CurvePoint[]) => {
    // 预览不修改实际配置，只用于显示
  }, []);

  // 保存配置
  const handleSave = useCallback(async (updatedRanks: RankConfig[]) => {
    if (previewMode) {
      toast.error('预览模式下无法保存');
      return;
    }

    setIsSaving(true);
    
    try {
      await onSave(updatedRanks);
      
      setCurveConfig(prev => ({
        ...prev,
        originalRanks: updatedRanks,
        isDirty: false,
        lastSaved: new Date().toISOString()
      }));
      
      toast.success('段位配置已保存');
    } catch (error) {
      console.error('保存配置失败:', error);
      toast.error('保存配置失败');
    } finally {
      setIsSaving(false);
    }
  }, [previewMode, onSave]);

  // 重置配置
  const handleReset = useCallback(() => {
    const points: CurvePoint[] = curveConfig.originalRanks.map(rank => ({
      x: rank.rankOrder,
      y: rank.minPoints,
      rankId: rank.id,
      rankName: rank.rankName
    }));

    setCurveConfig(prev => ({
      ...prev,
      points,
      modifiedRanks: prev.originalRanks,
      isDirty: false
    }));
    
    toast.success('配置已重置');
  }, [curveConfig.originalRanks]);

  // 标签页配置
  const tabs = [
    {
      id: 'chart' as const,
      name: '曲线编辑',
      icon: TrendingUp,
      description: '调整积分点'
    },
    {
      id: 'function' as const,
      name: '函数生成',
      icon: Settings,
      description: '使用数学函数生成曲线'
    },
    {
      id: 'preview' as const,
      name: '预览保存',
      icon: Eye,
      description: '预览并保存配置'
    }
  ];

  if (ranks.length === 0) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-lg font-medium mb-2">暂无段位数据</p>
          <p className="text-sm">请先加载段位配置数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>


      {/* 标签页导航 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-4 text-left transition-colors duration-200 ${
                  isActive
                    ? 'bg-indigo-50 border-b-2 border-indigo-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className={`w-5 h-5 ${
                    isActive ? 'text-indigo-600' : 'text-gray-500'
                  }`} />
                  <div>
                    <div className={`font-medium ${
                      isActive ? 'text-indigo-900' : 'text-gray-800'
                    }`}>
                      {tab.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {tab.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 标签页内容 */}
        <div className="p-6">
          {activeTab === 'chart' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">交互式积分曲线</h3>
                <p className="text-sm text-gray-600 mb-6">
                  点击并编辑图表上的点来调整各段位的积分值，曲线会实时更新
                </p>
              </div>
              
              <div className="flex justify-center">
                <CurveChart
                  points={curveConfig.points}
                  onPointUpdate={handlePointUpdate}
                  width={800}
                  height={500}
                  readonly={previewMode}
                />
              </div>
              
              {!previewMode && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setActiveTab('preview')}
                    disabled={!curveConfig.isDirty}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>预览配置</span>
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={!curveConfig.isDirty}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>重置</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'function' && (
            <FunctionGenerator
              ranks={curveConfig.originalRanks}
              onGenerate={handleFunctionGenerate}
              onPreview={handleFunctionPreview}
            />
          )}

          {activeTab === 'preview' && (
            <RankPreview
              originalRanks={curveConfig.originalRanks}
              curvePoints={curveConfig.points}
              onSave={handleSave}
              onReset={handleReset}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>

      {/* 快捷操作栏 */}
      {!previewMode && curveConfig.isDirty && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">您有未保存的更改</span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab('preview')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>保存更改</span>
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                放弃更改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankCurveEditor;