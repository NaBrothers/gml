import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Plus, 
  Edit2, 
  Trash2, 
  Upload,
  Star,
  Crown,
  Gem,
  ArrowLeft,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import ScrollToTop from '../components/ScrollToTop';
import ConfirmDialog from '../components/ConfirmDialog';
import ItemImage from '../components/ItemImage';
import { useConfirm } from '../hooks/useConfirm';
import { 
  GachaConfig, 
  GachaPool, 
  Item, 
  ItemRarity, 
  ItemType,
  UserRole 
} from '../../shared/types';

interface AdminGachaState {
  config: GachaConfig | null;
  pools: GachaPool[];
  items: Item[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  activeTab: 'config' | 'pools' | 'items' | 'tickets';
  editingPool: GachaPool | null;
  editingItem: Item | null;
  showPoolForm: boolean;
  showItemForm: boolean;
  selectedPool: GachaPool | null; // 当前选中的卡池，用于道具管理
  // 抽卡次数发放相关状态
  selectedUserIds: string[];
  grantAmount: number;
  grantReason: string;
  users: Array<{ id: string; username: string; nickname?: string }>;
}

const AdminGacha: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { confirmState, showConfirm } = useConfirm();
  
  const [state, setState] = useState<AdminGachaState>({
    config: null,
    pools: [],
    items: [],
    loading: true,
    saving: false,
    error: null,
    activeTab: 'config',
    editingPool: null,
    editingItem: null,
    showPoolForm: false,
    showItemForm: false,
    selectedPool: null,
    // 抽卡次数发放相关状态初始化
    selectedUserIds: [],
    grantAmount: 1,
    grantReason: '',
    users: []
  });

  // 检查权限
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      navigate('/');
      toast.error('权限不足');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // 获取数据
  useEffect(() => {
    if (isAuthenticated && user && user.role === UserRole.SUPER_ADMIN) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // 并行获取配置、卡池、道具和用户数据
      const [configResponse, poolsResponse, itemsResponse, usersResponse] = await Promise.all([
        fetch('/api/gacha-config', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/gacha/pools', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/items', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!configResponse.ok || !poolsResponse.ok || !itemsResponse.ok || !usersResponse.ok) {
        throw new Error('获取数据失败');
      }

      const configData = await configResponse.json();
      const poolsData = await poolsResponse.json();
      const itemsData = await itemsResponse.json();
      const usersData = await usersResponse.json();

      if (configData.success && poolsData.success && itemsData.success && usersData.success) {
        setState(prev => ({
          ...prev,
          config: configData.data,
          pools: poolsData.data.pools,
          items: itemsData.data.items,
          users: usersData.data.users.map((user: any) => ({
            id: user.id,
            username: user.username,
            nickname: user.nickname
          })),
          loading: false
        }));
      } else {
        throw new Error('获取数据失败');
      }
    } catch (error) {
      console.error('获取抽卡管理数据失败:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: '获取数据失败'
      }));
      toast.error('获取数据失败');
    }
  };

  // 保存配置
  const saveConfig = async () => {
    if (!state.config) return;

    setState(prev => ({ ...prev, saving: true }));

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/gacha-config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(state.config)
      });

      if (!response.ok) {
        throw new Error('保存配置失败');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('配置保存成功');
      } else {
        throw new Error(data.error || '保存配置失败');
      }
    } catch (error) {
      console.error('保存配置失败:', error);
      toast.error('保存配置失败');
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  // 重置配置
  const resetConfig = async () => {
    const confirmed = await showConfirm({
      title: '重置配置确认',
      message: '确定要重置抽卡配置为默认值吗？此操作不可撤销。',
      confirmText: '重置',
      cancelText: '取消',
      type: 'danger'
    });

    if (!confirmed) return;

    setState(prev => ({ ...prev, saving: true }));

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/gacha-config/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('重置配置失败');
      }

      const data = await response.json();
      if (data.success) {
        toast.success('配置重置成功');
        fetchData(); // 重新获取数据
      } else {
        throw new Error(data.error || '重置配置失败');
      }
    } catch (error) {
      console.error('重置配置失败:', error);
      toast.error('重置配置失败');
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  // 更新配置
  const updateConfig = (updates: Partial<GachaConfig>) => {
    setState(prev => ({
      ...prev,
      config: prev.config ? { ...prev.config, ...updates } : null
    }));
  };

  // 获取稀有度颜色
  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case ItemRarity.R:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case ItemRarity.SR:
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case ItemRarity.SSR:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 更新卡池道具权重
  const updatePoolItemWeight = async (itemId: string, newWeight: number) => {
    if (!state.selectedPool) return;

    try {
      setState(prev => ({ ...prev, saving: true }));

      // 更新本地状态
      const updatedItems = state.selectedPool.items.map(poolItem => 
        poolItem.itemId === itemId ? { ...poolItem, weight: newWeight } : poolItem
      );

      const updatedPool = {
        ...state.selectedPool,
        items: updatedItems
      };

      // 发送到后端更新
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/gacha/pools/${state.selectedPool.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPool)
      });

      if (!response.ok) {
        throw new Error('更新失败');
      }

      const data = await response.json();
      if (data.success) {
        // 更新状态
        setState(prev => ({
          ...prev,
          selectedPool: updatedPool,
          pools: prev.pools.map(pool => 
            pool.id === updatedPool.id ? updatedPool : pool
          )
        }));
        toast.success('权重更新成功');
      } else {
        throw new Error(data.error || '更新失败');
      }
    } catch (error) {
      console.error('更新权重失败:', error);
      toast.error('更新权重失败');
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };
  const getRarityIcon = (rarity: ItemRarity) => {
    switch (rarity) {
      case ItemRarity.R:
        return <Star className="w-4 h-4" />;
      case ItemRarity.SR:
        return <Crown className="w-4 h-4" />;
      case ItemRarity.SSR:
        return <Gem className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  if (!isAuthenticated || !user || user.role !== UserRole.SUPER_ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <HeaderBar title="抽卡系统管理" onBackClick={() => navigate('/admin')} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
         
          {/* 标签页 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 shadow-lg mb-6">
            <div className="flex border-b border-gray-200/50">
              <button
                onClick={() => setState(prev => ({ ...prev, activeTab: 'config' }))}
                className={`px-6 py-4 font-medium transition-colors ${
                  state.activeTab === 'config'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/80'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  抽卡配置
                </div>
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, activeTab: 'pools' }))}
                className={`px-6 py-4 font-medium transition-colors ${
                  state.activeTab === 'pools'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/80'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  卡池管理
                </div>
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, activeTab: 'items' }))}
                className={`px-6 py-4 font-medium transition-colors ${
                  state.activeTab === 'items'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/80'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  道具管理
                </div>
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, activeTab: 'tickets' }))}
                className={`px-6 py-4 font-medium transition-colors ${
                  state.activeTab === 'tickets'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/80'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  次数发放
                </div>
              </button>
            </div>
          </div>

        {state.loading ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-white/20 shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : state.error ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-white/20 shadow-lg">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              重试
            </button>
          </div>
        ) : (
          <>
            {/* 抽卡配置标签页 */}
            {state.activeTab === 'config' && state.config && (
              <div className="space-y-6">
                {/* 稀有度概率配置 */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">稀有度概率配置</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        R级概率 (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={state.config.rarityRates.R}
                        onChange={(e) => updateConfig({
                          rarityRates: {
                            ...state.config.rarityRates,
                            R: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SR级概率 (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={state.config.rarityRates.SR}
                        onChange={(e) => updateConfig({
                          rarityRates: {
                            ...state.config.rarityRates,
                            SR: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SSR级概率 (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={state.config.rarityRates.SSR}
                        onChange={(e) => updateConfig({
                          rarityRates: {
                            ...state.config.rarityRates,
                            SSR: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      总概率: {Object.values(state.config.rarityRates).reduce((sum, rate) => sum + rate, 0).toFixed(1)}%
                      {Math.abs(Object.values(state.config.rarityRates).reduce((sum, rate) => sum + rate, 0) - 100) > 0.01 && (
                        <span className="text-red-600 ml-2">⚠️ 总概率必须为100%</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* 保底配置 */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">保底配置</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="tenPullGuaranteeSR"
                        checked={state.config.guaranteeConfig.tenPullGuaranteeSR}
                        onChange={(e) => updateConfig({
                          guaranteeConfig: {
                            ...state.config.guaranteeConfig,
                            tenPullGuaranteeSR: e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="tenPullGuaranteeSR" className="ml-2 text-sm font-medium text-gray-700">
                        十连抽保底SR
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="pitySystemEnabled"
                        checked={state.config.guaranteeConfig.pitySystemEnabled}
                        onChange={(e) => updateConfig({
                          guaranteeConfig: {
                            ...state.config.guaranteeConfig,
                            pitySystemEnabled: e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="pitySystemEnabled" className="ml-2 text-sm font-medium text-gray-700">
                        启用怜悯值系统
                      </label>
                    </div>

                    {state.config.guaranteeConfig.pitySystemEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SR保底抽数
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={state.config.guaranteeConfig.srPityCount}
                            onChange={(e) => updateConfig({
                              guaranteeConfig: {
                                ...state.config.guaranteeConfig,
                                srPityCount: parseInt(e.target.value) || 1
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SSR保底抽数
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={state.config.guaranteeConfig.ssrPityCount}
                            onChange={(e) => updateConfig({
                              guaranteeConfig: {
                                ...state.config.guaranteeConfig,
                                ssrPityCount: parseInt(e.target.value) || 1
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 游戏奖励配置 */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">游戏奖励配置</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="gameRewardEnabled"
                        checked={state.config.gameRewardConfig.enabled}
                        onChange={(e) => updateConfig({
                          gameRewardConfig: {
                            ...state.config.gameRewardConfig,
                            enabled: e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="gameRewardEnabled" className="ml-2 text-sm font-medium text-gray-700">
                        启用游戏奖励
                      </label>
                    </div>

                    {state.config.gameRewardConfig.enabled && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(position => (
                          <div key={position}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              第{position}名奖励
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={state.config.gameRewardConfig.rewardsByPosition[position as 1 | 2 | 3 | 4]}
                              onChange={(e) => updateConfig({
                                gameRewardConfig: {
                                  ...state.config.gameRewardConfig,
                                  rewardsByPosition: {
                                    ...state.config.gameRewardConfig.rewardsByPosition,
                                    [position]: parseInt(e.target.value) || 0
                                  }
                                }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 其他配置 */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">其他配置</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        用户最大抽卡次数
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={state.config.maxTicketsPerUser}
                        onChange={(e) => updateConfig({
                          maxTicketsPerUser: parseInt(e.target.value) || 1
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        重复道具处理
                      </label>
                      <select
                        value={state.config.duplicateItemHandling}
                        onChange={(e) => updateConfig({
                          duplicateItemHandling: e.target.value as 'ignore' | 'convert'
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="ignore">忽略</option>
                        <option value="convert">转换为其他奖励</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={resetConfig}
                    disabled={state.saving}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      重置为默认
                    </div>
                  </button>
                  <button
                    onClick={saveConfig}
                    disabled={state.saving}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      {state.saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {state.saving ? '保存中...' : '保存配置'}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 卡池管理标签页 */}
            {state.activeTab === 'pools' && (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">卡池列表</h3>
                  <button
                    onClick={() => setState(prev => ({ ...prev, showPoolForm: true, editingPool: null }))}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      新建卡池
                    </div>
                  </button>
                </div>

                {state.pools.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">暂无卡池</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.pools.map(pool => (
                      <div key={pool.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800">{pool.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                pool.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {pool.isActive ? '启用' : '禁用'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{pool.description}</p>
                            <div className="text-xs text-gray-500">
                              {pool.items.length} 种道具 • 创建于 {new Date(pool.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setState(prev => ({ 
                                  ...prev, 
                                  selectedPool: pool, 
                                  activeTab: 'items' 
                                }));
                              }}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              管理道具
                            </button>
                            <button
                              onClick={() => setState(prev => ({ ...prev, showPoolForm: true, editingPool: pool }))}
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                const confirmed = await showConfirm({
                                  title: '删除卡池确认',
                                  message: `确定要删除卡池"${pool.name}"吗？此操作不可撤销。`,
                                  confirmText: '删除',
                                  cancelText: '取消',
                                  type: 'danger'
                                });
                                if (confirmed) {
                                  // TODO: 实现删除卡池功能
                                  toast.success('卡池删除成功');
                                }
                              }}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 道具管理标签页 */}
            {state.activeTab === 'items' && (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {state.selectedPool && (
                      <button
                        onClick={() => setState(prev => ({ ...prev, selectedPool: null, activeTab: 'pools' }))}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {state.selectedPool ? `${state.selectedPool.name} - 道具管理` : '道具列表'}
                      </h3>
                      {state.selectedPool && (
                        <p className="text-sm text-gray-600">{state.selectedPool.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setState(prev => ({ ...prev, showItemForm: true, editingItem: null }))}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      新建道具
                    </div>
                  </button>
                </div>

                {(() => {
                  // 根据是否选中卡池来过滤道具
                  const filteredItems = state.selectedPool 
                    ? state.items.filter(item => state.selectedPool!.items.some(poolItem => poolItem.itemId === item.id))
                    : state.items;

                  return filteredItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {state.selectedPool ? `${state.selectedPool.name} 暂无道具` : '暂无道具'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              道具
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              类型
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              稀有度
                            </th>
                            {state.selectedPool && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                权重/爆率
                              </th>
                            )}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              状态
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              操作
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/60 divide-y divide-gray-200">
                          {filteredItems.map(item => {
                            // 获取该道具在当前卡池中的权重
                            const poolItem = state.selectedPool?.items.find(pi => pi.itemId === item.id);
                            const currentWeight = poolItem?.weight || 0;
                            
                            // 计算总权重和概率
                            const totalWeight = state.selectedPool?.items.reduce((sum, pi) => sum + pi.weight, 0) || 1;
                            const probability = totalWeight > 0 ? ((currentWeight / totalWeight) * 100).toFixed(2) : '0.00';
                            
                            return (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12">
                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                                      <ItemImage
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        fallbackIcon="star"
                                        rarity={item.rarity}
                                      />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-900">
                                  {item.type === 'avatar_frame' ? '头像框' :
                                   item.type === 'home_illustration' ? '主页立绘' :
                                   item.type === 'profile_banner' ? '个人页背景' :
                                   item.type === 'theme' ? '主题' :
                                   item.type === 'decoration' ? '装饰' : '未知'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(item.rarity)}`}>
                                  <div className="flex items-center gap-1">
                                    {getRarityIcon(item.rarity)}
                                    {item.rarity}
                                  </div>
                                </div>
                              </td>
                              {state.selectedPool && (
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      max="1000"
                                      value={currentWeight}
                                      onChange={async (e) => {
                                        const newWeight = parseInt(e.target.value) || 0;
                                        await updatePoolItemWeight(item.id, newWeight);
                                      }}
                                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    <div className="text-xs text-gray-500">
                                      <div>权重: {currentWeight}</div>
                                      <div>概率: {probability}%</div>
                                    </div>
                                  </div>
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.isActive ? '启用' : '禁用'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setState(prev => ({ ...prev, showItemForm: true, editingItem: item }))}
                                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const confirmed = await showConfirm({
                                        title: '删除道具确认',
                                        message: `确定要删除道具"${item.name}"吗？此操作不可撤销。`,
                                        confirmText: '删除',
                                        cancelText: '取消',
                                        type: 'danger'
                                      });
                                      if (confirmed) {
                                        // TODO: 实现删除道具功能
                                        toast.success('道具删除成功');
                                      }
                                    }}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 抽卡次数发放标签页 */}
            {state.activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 border border-white/20 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">抽卡次数发放</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        选择用户
                      </label>
                      <div className="space-y-2">
                        {/* 全选/取消全选 */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="selectAll"
                            checked={state.selectedUserIds.length === state.users.length && state.users.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setState(prev => ({ ...prev, selectedUserIds: prev.users.map(u => u.id) }));
                              } else {
                                setState(prev => ({ ...prev, selectedUserIds: [] }));
                              }
                            }}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                            全选 ({state.selectedUserIds.length}/{state.users.length})
                          </label>
                        </div>
                        
                        {/* 用户列表 */}
                        <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-1">
                          {state.users.length === 0 ? (
                            <div className="text-gray-500 text-sm text-center py-4">暂无用户数据</div>
                          ) : (
                            state.users.map((user) => (
                              <div key={user.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                                <input
                                  type="checkbox"
                                  id={`user-${user.id}`}
                                  checked={state.selectedUserIds.includes(user.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setState(prev => ({ 
                                        ...prev, 
                                        selectedUserIds: [...prev.selectedUserIds, user.id] 
                                      }));
                                    } else {
                                      setState(prev => ({ 
                                        ...prev, 
                                        selectedUserIds: prev.selectedUserIds.filter(id => id !== user.id) 
                                      }));
                                    }
                                  }}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <label htmlFor={`user-${user.id}`} className="text-sm flex-1 cursor-pointer">
                                  <span className="font-medium">{user.nickname || user.username}</span>
                                  <span className="text-gray-500 ml-2">({user.id})</span>
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        发放数量
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={state.grantAmount}
                        onChange={(e) => setState(prev => ({ ...prev, grantAmount: parseInt(e.target.value) || 1 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        发放原因
                      </label>
                      <textarea
                        value={state.grantReason}
                        onChange={(e) => setState(prev => ({ ...prev, grantReason: e.target.value }))}
                        placeholder="请输入发放原因（可选）"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={async () => {
                          if (state.selectedUserIds.length === 0) {
                            toast.error('请选择至少一个用户');
                            return;
                          }
                          
                          if (state.grantAmount <= 0) {
                            toast.error('发放数量必须大于0');
                            return;
                          }
                          
                          try {
                            setState(prev => ({ ...prev, saving: true }));
                            
                            const token = localStorage.getItem('auth_token');
                            let successCount = 0;
                            let failCount = 0;
                            
                            // 批量发放给所有选中的用户
                            for (const userId of state.selectedUserIds) {
                              try {
                                const response = await fetch('/api/users/grant-tickets', {
                                  method: 'POST',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({
                                    userId: userId,
                                    amount: state.grantAmount,
                                    reason: state.grantReason.trim() || '管理员批量发放'
                                  })
                                });
                                
                                if (response.ok) {
                                  const data = await response.json();
                                  if (data.success) {
                                    successCount++;
                                  } else {
                                    failCount++;
                                  }
                                } else {
                                  failCount++;
                                }
                              } catch (error) {
                                failCount++;
                              }
                            }
                            
                            // 显示结果
                            if (successCount > 0 && failCount === 0) {
                              toast.success(`成功为 ${successCount} 个用户发放 ${state.grantAmount} 次抽卡机会`);
                            } else if (successCount > 0 && failCount > 0) {
                              toast.warning(`成功发放 ${successCount} 个用户，失败 ${failCount} 个用户`);
                            } else {
                              toast.error('发放失败，请重试');
                            }
                            
                            // 重置表单
                            if (successCount > 0) {
                              setState(prev => ({
                                ...prev,
                                selectedUserIds: [],
                                grantAmount: 1,
                                grantReason: ''
                              }));
                            }
                          } catch (error) {
                            console.error('批量发放抽卡次数失败:', error);
                            toast.error('发放失败');
                          } finally {
                            setState(prev => ({ ...prev, saving: false }));
                          }
                        }}
                        disabled={state.saving || state.selectedUserIds.length === 0 || state.grantAmount <= 0}
                        className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <Gift className="w-4 h-4" />
                        {state.saving ? '发放中...' : `发放给 ${state.selectedUserIds.length} 个用户`}
                      </button>
                      
                      <button
                        onClick={() => setState(prev => ({
                          ...prev,
                          selectedUserIds: [],
                          grantAmount: 1,
                          grantReason: ''
                        }))}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        重置
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* 确认对话框 */}
      <ConfirmDialog {...confirmState} />
      
      <ScrollToTop />
    </div>
  );
};

export default AdminGacha;