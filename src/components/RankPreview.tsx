import React, { useMemo } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Eye, Save, RotateCcw } from 'lucide-react';
import { CurvePoint, RankConfig, ValidationResult } from '../../shared/types';

interface RankPreviewProps {
  originalRanks: RankConfig[];
  curvePoints: CurvePoint[];
  onSave: (updatedRanks: RankConfig[]) => void;
  onReset: () => void;
  isSaving?: boolean;
  className?: string;
}

const RankPreview: React.FC<RankPreviewProps> = ({
  originalRanks,
  curvePoints,
  onSave,
  onReset,
  isSaving = false,
  className = ''
}) => {
  // 将曲线点转换为段位配置
  const updatedRanks = useMemo((): RankConfig[] => {
    if (curvePoints.length === 0) return originalRanks;

    return curvePoints.map((point, index) => {
      const originalRank = originalRanks.find(rank => rank.id === point.rankId);
      if (!originalRank) return null;

      // 计算积分范围
      const minPoints = point.y;
      const nextPoint = curvePoints[index + 1];
      const maxPoints = nextPoint ? nextPoint.y - 1 : minPoints + 99;

      return {
        ...originalRank,
        minPoints,
        maxPoints: Math.max(minPoints, maxPoints)
      };
    }).filter(Boolean) as RankConfig[];
  }, [curvePoints, originalRanks]);

  // 验证配置
  const validation = useMemo((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (updatedRanks.length === 0) {
      errors.push('没有有效的段位配置');
      return { isValid: false, errors, warnings };
    }

    // 检查积分范围
    for (let i = 0; i < updatedRanks.length; i++) {
      const rank = updatedRanks[i];
      
      // 检查积分值有效性
      if (rank.minPoints < 0) {
        errors.push(`${rank.rankName}: 最小积分不能为负数`);
      }
      
      if (rank.minPoints >= rank.maxPoints) {
        errors.push(`${rank.rankName}: 最小积分必须小于最大积分`);
      }

      // 检查与其他段位的重叠
      for (let j = i + 1; j < updatedRanks.length; j++) {
        const otherRank = updatedRanks[j];
        if (!(rank.maxPoints < otherRank.minPoints || rank.minPoints > otherRank.maxPoints)) {
          errors.push(`${rank.rankName} 与 ${otherRank.rankName} 的积分范围重叠`);
        }
      }
    }

    // 检查积分递增
    const sortedRanks = [...updatedRanks].sort((a, b) => a.rankOrder - b.rankOrder);
    for (let i = 1; i < sortedRanks.length; i++) {
      const prevRank = sortedRanks[i - 1];
      const currentRank = sortedRanks[i];
      
      if (currentRank.minPoints <= prevRank.minPoints) {
        warnings.push(`${currentRank.rankName} 的积分应该高于 ${prevRank.rankName}`);
      }
    }

    // 检查积分跨度
    const minPoints = Math.min(...updatedRanks.map(r => r.minPoints));
    const maxPoints = Math.max(...updatedRanks.map(r => r.maxPoints));
    const span = maxPoints - minPoints;
    
    if (span < 1000) {
      warnings.push('积分跨度较小，可能导致段位区分度不够');
    } else if (span > 50000) {
      warnings.push('积分跨度过大，可能导致升段困难');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [updatedRanks]);

  // 计算变更统计
  const changeStats = useMemo(() => {
    let modified = 0;
    let totalChange = 0;

    updatedRanks.forEach(updatedRank => {
      const originalRank = originalRanks.find(r => r.id === updatedRank.id);
      if (originalRank) {
        if (originalRank.minPoints !== updatedRank.minPoints || 
            originalRank.maxPoints !== updatedRank.maxPoints) {
          modified++;
          totalChange += Math.abs(updatedRank.minPoints - originalRank.minPoints);
        }
      }
    });

    return { modified, totalChange };
  }, [updatedRanks, originalRanks]);

  // 按大段位分组显示
  const groupedRanks = useMemo(() => {
    const groups = new Map<string, RankConfig[]>();
    
    updatedRanks.forEach(rank => {
      if (!groups.has(rank.majorRank)) {
        groups.set(rank.majorRank, []);
      }
      groups.get(rank.majorRank)!.push(rank);
    });

    // 按rankOrder排序每个组内的段位
    groups.forEach(rankList => {
      rankList.sort((a, b) => a.rankOrder - b.rankOrder);
    });

    // 转换为数组并按第一个段位的rankOrder排序
    return Array.from(groups.entries())
      .sort(([, a], [, b]) => a[0].rankOrder - b[0].rankOrder);
  }, [updatedRanks]);

  // 获取变更状态
  const getChangeStatus = (rank: RankConfig) => {
    const originalRank = originalRanks.find(r => r.id === rank.id);
    if (!originalRank) return 'new';
    
    if (originalRank.minPoints !== rank.minPoints || originalRank.maxPoints !== rank.maxPoints) {
      return 'modified';
    }
    
    return 'unchanged';
  };

  const handleSave = () => {
    if (validation.isValid) {
      onSave(updatedRanks);
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg ${className}`}>
      {/* 标题和状态 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Eye className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">配置预览</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {validation.isValid ? (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">配置有效</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-600">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">配置无效</span>
            </div>
          )}
        </div>
      </div>

      {/* 验证结果 */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="mb-6 space-y-3">
          {validation.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <h4 className="text-sm font-medium text-red-800">错误 ({validation.errors.length})</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <h4 className="text-sm font-medium text-yellow-800">警告 ({validation.warnings.length})</h4>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 变更统计 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">变更统计</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600">总段位数:</span>
            <span className="ml-2 font-medium">{updatedRanks.length}</span>
          </div>
          <div>
            <span className="text-blue-600">修改段位:</span>
            <span className="ml-2 font-medium">{changeStats.modified}</span>
          </div>
          <div>
            <span className="text-blue-600">积分跨度:</span>
            <span className="ml-2 font-medium">
              {updatedRanks.length > 0 
                ? (Math.max(...updatedRanks.map(r => r.maxPoints)) - Math.min(...updatedRanks.map(r => r.minPoints))).toLocaleString()
                : 0
              }
            </span>
          </div>
          <div>
            <span className="text-blue-600">平均变化:</span>
            <span className="ml-2 font-medium">
              {changeStats.modified > 0 ? Math.round(changeStats.totalChange / changeStats.modified).toLocaleString() : 0}
            </span>
          </div>
        </div>
      </div>

      {/* 段位列表预览 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">段位配置预览</h4>
        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  段位名称
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  积分范围
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  变更
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groupedRanks.map(([majorRank, rankList]) => (
                <React.Fragment key={majorRank}>
                  {/* 大段位标题行 */}
                  <tr className="bg-gray-100">
                    <td colSpan={4} className="px-4 py-2 text-sm font-medium text-gray-800">
                      {majorRank} ({rankList.length} 个小段位)
                    </td>
                  </tr>
                  {/* 小段位行 */}
                  {rankList.map((rank) => {
                    const changeStatus = getChangeStatus(rank);
                    const originalRank = originalRanks.find(r => r.id === rank.id);
                    
                    return (
                      <tr key={rank.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {rank.rankName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {rank.minPoints.toLocaleString()} - {rank.maxPoints.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {changeStatus === 'modified' && originalRank ? (
                            <div className="text-blue-600">
                              <div>原: {originalRank.minPoints.toLocaleString()} - {originalRank.maxPoints.toLocaleString()}</div>
                              <div className="text-xs">
                                变化: {rank.minPoints - originalRank.minPoints >= 0 ? '+' : ''}{(rank.minPoints - originalRank.minPoints).toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">无变更</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {changeStatus === 'modified' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              已修改
                            </span>
                          ) : changeStatus === 'new' ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              新增
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              未变更
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSave}
          disabled={!validation.isValid || isSaving}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? '保存中...' : '保存配置'}</span>
        </button>
        <button
          onClick={onReset}
          disabled={isSaving}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重置更改</span>
        </button>
      </div>
    </div>
  );
};

export default RankPreview;