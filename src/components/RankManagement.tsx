import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Edit3, Save, X, AlertTriangle } from 'lucide-react';
import { RankConfig } from '../../shared/types';
import { toast } from 'sonner';

interface RankManagementProps {
  ranks: RankConfig[];
  previewMode: boolean;
  onRankUpdate: (updatedRank: RankConfig) => void;
}

interface EditingRank {
  id: number;
  rankName: string;
  minPoints: number;
  maxPoints: number;
}

const RankManagement: React.FC<RankManagementProps> = ({ ranks, previewMode, onRankUpdate }) => {
  const [expandedMajorRanks, setExpandedMajorRanks] = useState<Set<string>>(new Set());
  const [editingRank, setEditingRank] = useState<EditingRank | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 按大段位分组
  const groupedRanks = useMemo(() => {
    const groups = new Map<string, RankConfig[]>();
    
    ranks.forEach(rank => {
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
  }, [ranks]);

  const toggleMajorRank = (majorRank: string) => {
    const newExpanded = new Set(expandedMajorRanks);
    if (newExpanded.has(majorRank)) {
      newExpanded.delete(majorRank);
    } else {
      newExpanded.add(majorRank);
    }
    setExpandedMajorRanks(newExpanded);
  };

  const startEditing = (rank: RankConfig) => {
    if (previewMode) return;
    
    setEditingRank({
      id: rank.id,
      rankName: rank.rankName,
      minPoints: rank.minPoints,
      maxPoints: rank.maxPoints
    });
  };

  const cancelEditing = () => {
    setEditingRank(null);
  };

  const validateRankData = (editData: EditingRank): string | null => {
    if (!editData.rankName.trim()) {
      return '段位名称不能为空';
    }
    
    if (editData.minPoints >= editData.maxPoints) {
      return '最小积分必须小于最大积分';
    }
    
    if (editData.minPoints < 0) {
      return '最小积分不能为负数';
    }
    
    // 检查与其他段位的积分重叠
    const otherRanks = ranks.filter(rank => rank.id !== editData.id);
    for (const rank of otherRanks) {
      if (!(editData.maxPoints < rank.minPoints || editData.minPoints > rank.maxPoints)) {
        return `积分范围与段位"${rank.rankName}"(${rank.minPoints}-${rank.maxPoints})重叠`;
      }
    }
    
    return null;
  };

  const saveRank = async () => {
    if (!editingRank) return;
    
    const validationError = validateRankData(editingRank);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('未找到认证令牌');
        return;
      }
      
      const response = await fetch(`/api/config/ranks/${editingRank.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingRank)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('段位更新成功');
        onRankUpdate(result.data);
        setEditingRank(null);
      } else {
        toast.error(result.error || '更新失败');
      }
    } catch (error) {
      console.error('更新段位失败:', error);
      toast.error('更新段位失败');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRankTypeDisplay = (minorRankType: string) => {
    switch (minorRankType) {
      case 'dan': return '段';
      case 'star': return '星';
      default: return '无';
    }
  };

  return (
    <div className="space-y-4">
      {groupedRanks.map(([majorRank, rankList]) => {
        const isExpanded = expandedMajorRanks.has(majorRank);
        const minPoints = Math.min(...rankList.map(r => r.minPoints));
        const maxPoints = Math.max(...rankList.map(r => r.maxPoints));
        
        return (
          <div key={majorRank} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* 大段位标题 */}
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleMajorRank(majorRank)}
            >
              <div className="flex items-center space-x-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{majorRank}</h4>
                  <p className="text-sm text-gray-500">
                    {minPoints} - {maxPoints} 分 · {rankList.length} 个小段位
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {getRankTypeDisplay(rankList[0].minorRankType)}
              </div>
            </div>
            
            {/* 小段位列表 */}
            {isExpanded && (
              <div className="border-t border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          段位名称
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          积分范围
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          排序
                        </th>
                        {!previewMode && (
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rankList.map((rank) => (
                        <tr key={rank.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4">
                            {editingRank?.id === rank.id ? (
                              <input
                                type="text"
                                value={editingRank.rankName}
                                onChange={(e) => setEditingRank({
                                  ...editingRank,
                                  rankName: e.target.value
                                })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="段位名称"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-900 block truncate">
                                {rank.rankName}
                              </span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            {editingRank?.id === rank.id ? (
                              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                                <input
                                  type="number"
                                  value={editingRank.minPoints}
                                  onChange={(e) => setEditingRank({
                                    ...editingRank,
                                    minPoints: parseInt(e.target.value) || 0
                                  })}
                                  className="w-16 sm:w-20 px-1 sm:px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="最小"
                                />
                                <span className="text-gray-500 hidden sm:inline">-</span>
                                <input
                                  type="number"
                                  value={editingRank.maxPoints}
                                  onChange={(e) => setEditingRank({
                                    ...editingRank,
                                    maxPoints: parseInt(e.target.value) || 0
                                  })}
                                  className="w-16 sm:w-20 px-1 sm:px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="最大"
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 block truncate">
                                {rank.minPoints} - {rank.maxPoints}
                              </span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                            {rank.rankOrder}
                          </td>
                          {!previewMode && (
                            <td className="px-3 sm:px-6 py-4 text-sm font-medium">
                              {editingRank?.id === rank.id ? (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                                  <button
                                    onClick={saveRank}
                                    disabled={isUpdating}
                                    className="flex items-center space-x-1 text-green-600 hover:text-green-900 disabled:opacity-50 text-xs sm:text-sm"
                                  >
                                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>保存</span>
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    disabled={isUpdating}
                                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 text-xs sm:text-sm"
                                  >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>取消</span>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => startEditing(rank)}
                                  className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-900 text-xs sm:text-sm"
                                >
                                  <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span>编辑</span>
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {/* 提示信息 */}
      {!previewMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">段位编辑说明：</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>点击大段位可展开查看详细的小段位列表</li>
                <li>点击"编辑"按钮可修改段位名称和积分范围</li>
                <li>积分范围不能与其他段位重叠</li>
                <li>最小积分必须小于最大积分</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankManagement;