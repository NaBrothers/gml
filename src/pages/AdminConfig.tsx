import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Edit3,
  Database,
  Trophy,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { UserRole, RankConfig } from '../../shared/types';
import HeaderBar from '../components/HeaderBar';
import RankManagement from '../components/RankManagement';
import RankCurveEditor from '../components/RankCurveEditor';
import { toast } from 'sonner';

interface ConfigData {
  game: {
    BASE_POINTS: number;
    TOTAL_POINTS: number;
    INITIAL_POINTS: number;
    UMA_POINTS: number[];
    DEFAULT_GAME_TYPE: string;
    MIN_PLAYERS: number;
    MAX_PLAYERS: number;
    NEWBIE_PROTECTION_MAX_RANK: number;
  };
  ranks: Array<{
    id: number;
    rankName: string;
    minPoints: number;
    maxPoints: number;
    promotionBonus: number;
    demotionPenalty: number;
    rankOrder: number;
    majorRank: string;
    minorRankType: 'dan' | 'star' | 'none';
    minorRankRange: [number, number];
  }>;
}

const AdminConfig: React.FC = () => {
  // 所有Hooks必须在组件顶部调用，不能在条件语句之后
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'game' | 'ranks'>('game');
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [rankEditMode, setRankEditMode] = useState<'table' | 'curve'>('table');

  // 获取配置数据
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/config', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setConfig(result.data);
        } else {
          toast.error('获取配置失败: ' + result.error);
        }
      } else {
        toast.error('获取配置失败');
      }
    } catch (error) {
      console.error('获取配置失败:', error);
      toast.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 保存配置
  const saveConfig = async (type: 'game' | 'ranks') => {
    if (!config) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('未找到认证令牌，请重新登录');
        return;
      }
      
      const response = await fetch(`/api/config/${type}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config[type])
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (result.success) {
          toast.success(`${type === 'game' ? '游戏' : '段位'}配置保存成功`);
          // 保存成功后刷新页面
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast.error('保存失败: ' + (result.error || '未知错误'));
        }
      } else {
        if (response.status === 401) {
          toast.error('认证失败，请重新登录');
        } else if (response.status === 403) {
          toast.error('权限不足，需要超级管理员权限');
        } else {
          toast.error(`保存失败 (${response.status}): ${result.error || '未知错误'}`);
        }
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      toast.error('网络错误: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  // 保存段位配置的函数
  const saveRankConfig = async (updatedRanks: RankConfig[]) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('未找到认证令牌，请重新登录');
        return;
      }
      
      const response = await fetch('/api/config/ranks', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedRanks)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (result.success) {
          // 更新本地配置
          setConfig(prev => prev ? { ...prev, ranks: updatedRanks } : null);
          toast.success('段位配置保存成功');
        } else {
          toast.error('保存失败: ' + (result.error || '未知错误'));
          throw new Error(result.error || '保存失败');
        }
      } else {
        if (response.status === 401) {
          toast.error('认证失败，请重新登录');
        } else if (response.status === 403) {
          toast.error('权限不足，需要超级管理员权限');
        } else {
          toast.error(`保存失败 (${response.status}): ${result.error || '未知错误'}`);
        }
        throw new Error(`HTTP ${response.status}: ${result.error || '保存失败'}`);
      }
    } catch (error) {
      console.error('保存段位配置失败:', error);
      throw error; // 重新抛出错误，让调用者处理
    } finally {
      setSaving(false);
    }
  };

  // 重新加载配置
  const reloadConfig = async () => {
    try {
      setReloading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('未找到认证令牌，请重新登录');
        return;
      }
      
      const response = await fetch('/api/config/reload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (result.success) {
          toast.success('配置重新加载成功');
          await fetchConfig();
        } else {
          toast.error('重新加载失败: ' + (result.error || '未知错误'));
        }
      } else {
        if (response.status === 401) {
          toast.error('认证失败，请重新登录');
        } else if (response.status === 403) {
          toast.error('权限不足，需要超级管理员权限');
        } else {
          toast.error(`重新加载失败 (${response.status}): ${result.error || '未知错误'}`);
        }
      }
    } catch (error) {
      console.error('重新加载配置失败:', error);
      toast.error('网络错误: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setReloading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // 权限检查 - 现在在所有Hooks调用之后
  if (!isAuthenticated || !user || user.role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="text-lg text-gray-600 mb-2">权限不足</div>
          <div className="text-sm text-gray-500">只有超级管理员可以访问配置中心</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载配置中...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <div className="text-lg text-gray-600 mb-2">配置加载失败</div>
          <button
            onClick={fetchConfig}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'game' as const, name: '游戏配置', icon: Database, description: '基础游戏参数设置' },
    { id: 'ranks' as const, name: '段位配置', icon: Trophy, description: '段位系统管理' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <HeaderBar title="配置中心" />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* 顶部操作栏 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 border border-white/20 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  previewMode 
                    ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {previewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{previewMode ? '编辑模式' : '预览模式'}</span>
              </button>
              
              <button
                onClick={reloadConfig}
                disabled={reloading}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${reloading ? 'animate-spin' : ''}`} />
                <span>重新加载</span>
              </button>
              
              {/* 只在非段位配置或表格模式下显示保存按钮 */}
              {(activeTab !== 'ranks' || rankEditMode === 'table') && (
                <button
                  onClick={() => saveConfig(activeTab)}
                  disabled={saving || previewMode}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>保存配置</span>
                </button>
              )}
            </div>

            {/* 段位编辑模式切换 - 只在段位配置标签页显示 */}
            {activeTab === 'ranks' && (
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setRankEditMode('table')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    rankEditMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium">表格模式</span>
                </button>
                <button
                  onClick={() => setRankEditMode('curve')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                    rankEditMode === 'curve'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">曲线模式</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl mb-8 border border-white/20 shadow-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 p-6 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 border-b-2 border-indigo-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`w-6 h-6 ${
                      activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500'
                    }`} />
                    <div>
                      <div className={`font-semibold ${
                        activeTab === tab.id ? 'text-indigo-900' : 'text-gray-800'
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
        </div>

        {/* 配置内容区域 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
          {activeTab === 'game' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">游戏基础配置</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">配点</label>
                  <input
                    type="number"
                    value={config.game.BASE_POINTS}
                    onChange={(e) => setConfig({
                      ...config,
                      game: { ...config.game, BASE_POINTS: parseInt(e.target.value) }
                    })}
                    disabled={previewMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">总分</label>
                  <input
                    type="number"
                    value={config.game.TOTAL_POINTS}
                    onChange={(e) => setConfig({
                      ...config,
                      game: { ...config.game, TOTAL_POINTS: parseInt(e.target.value) }
                    })}
                    disabled={previewMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">初始积分</label>
                  <input
                    type="number"
                    value={config.game.INITIAL_POINTS}
                    onChange={(e) => setConfig({
                      ...config,
                      game: { ...config.game, INITIAL_POINTS: parseInt(e.target.value) }
                    })}
                    disabled={previewMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">默认游戏类型</label>
                  <select
                    value={config.game.DEFAULT_GAME_TYPE}
                    onChange={(e) => setConfig({
                      ...config,
                      game: { ...config.game, DEFAULT_GAME_TYPE: e.target.value }
                    })}
                    disabled={previewMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="半庄">半庄</option>
                    <option value="东风">东风</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UMA分配 (1位,2位,3位,4位)</label>
                <div className="grid grid-cols-4 gap-3">
                  {config.game.UMA_POINTS.map((uma, index) => (
                    <input
                      key={index}
                      type="number"
                      value={uma}
                      onChange={(e) => {
                        const newUma = [...config.game.UMA_POINTS];
                        newUma[index] = parseInt(e.target.value);
                        setConfig({
                          ...config,
                          game: { ...config.game, UMA_POINTS: newUma }
                        });
                      }}
                      disabled={previewMode}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                      placeholder={`${index + 1}位`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新手保护段位上限
                  <span className="text-xs text-gray-500 ml-2">
                    (段位等级小于等于此值的玩家不会扣分)
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.game.NEWBIE_PROTECTION_MAX_RANK}
                  onChange={(e) => setConfig({
                    ...config,
                    game: { ...config.game, NEWBIE_PROTECTION_MAX_RANK: parseInt(e.target.value) }
                  })}
                  disabled={previewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                  placeholder="例如: 9 (雀之气九段及以下)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  当前设置: 段位等级 ≤ {config.game.NEWBIE_PROTECTION_MAX_RANK} 的玩家享受新手保护
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ranks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">段位系统配置</h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    共 {config.ranks.length} 个段位
                  </div>
                  <div className="text-sm text-gray-600">
                    当前模式: {rankEditMode === 'table' ? '表格编辑' : '曲线编辑'}
                  </div>
                </div>
              </div>
              
              {rankEditMode === 'table' ? (
                <RankManagement 
                  ranks={config.ranks} 
                  previewMode={previewMode}
                  onRankUpdate={(updatedRank) => {
                    const updatedRanks = config.ranks.map(rank => 
                      rank.id === updatedRank.id ? updatedRank : rank
                    );
                    setConfig({ ...config, ranks: updatedRanks });
                  }}
                />
              ) : (
                <RankCurveEditor
                  ranks={config.ranks}
                  onSave={saveRankConfig}
                  previewMode={previewMode}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;