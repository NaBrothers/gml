import React, { useState, useEffect } from 'react';
import { Sparkles, Ticket, Gift, History, Star, Crown, Gem } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import ScrollToTop from '../components/ScrollToTop';
import ItemImage from '../components/ItemImage';
import { 
  GachaPool, 
  UserGachaTickets, 
  GachaResult, 
  GachaRecord,
  Item,
  ItemRarity 
} from '../../shared/types';

interface GachaState {
  pools: GachaPool[];
  userTickets: UserGachaTickets | null;
  selectedPool: GachaPool | null;
  loading: boolean;
  pulling: boolean;
  error: string | null;
  showResult: boolean;
  lastResult: GachaResult | null;
  lastGachaType: 'single' | 'ten' | null; // 记录最后一次抽卡类型123123
  recentRecords: GachaRecord[];
  // 动画相关状态
  showAnimation: boolean;
  animationPhase: 'cards' | 'shaking' | 'revealing' | 'completed';
  animationCards: number; // 动画中显示的卡牌数量
}

const Gacha: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  
  const [state, setState] = useState<GachaState>({
    pools: [],
    userTickets: null,
    selectedPool: null,
    loading: true,
    pulling: false,
    error: null,
    showResult: false,
    lastResult: null,
    lastGachaType: null,
    recentRecords: [],
    // 动画相关状态初始化
    showAnimation: false,
    animationPhase: 'cards',
    animationCards: 0
  });

  // 检查认证状态
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // 获取数据
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // 并行获取卡池、用户抽卡次数和抽卡记录
      const [poolsResponse, ticketsResponse, recordsResponse] = await Promise.all([
        fetch('/api/gacha/pools?active=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/gacha/tickets/${user!.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/gacha/records/${user!.id}?limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!poolsResponse.ok) {
        throw new Error('获取卡池数据失败');
      }

      const poolsData = await poolsResponse.json();
      const ticketsData = ticketsResponse.ok ? await ticketsResponse.json() : { success: true, data: null };
      const recordsData = recordsResponse.ok ? await recordsResponse.json() : { success: true, data: { records: [] } };

      if (poolsData.success) {
        setState(prev => ({
          ...prev,
          pools: poolsData.data.pools,
          selectedPool: poolsData.data.pools[0] || null,
          userTickets: ticketsData.data,
          recentRecords: recordsData.data?.records || [],
          loading: false
        }));
      } else {
        throw new Error(poolsData.error || '获取数据失败');
      }
    } catch (error) {
      console.error('获取抽卡数据失败:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: '获取抽卡数据失败'
      }));
      toast.error('获取抽卡数据失败');
    }
  };

  // 执行抽卡
  const performGacha = async (count: 1 | 10) => {
    if (!state.selectedPool || state.pulling) return;

    const ticketsNeeded = count;
    const availableTickets = state.userTickets?.tickets || 0;

    if (availableTickets < ticketsNeeded) {
      toast.error('抽卡次数不足');
      return;
    }

    // 开始抽卡动画
    setState(prev => ({ 
      ...prev, 
      pulling: true,
      showAnimation: true,
      animationPhase: 'cards',
      animationCards: count
    }));

    // 显示卡牌背面
    setTimeout(() => {
      setState(prev => ({ ...prev, animationPhase: 'shaking' }));
    }, 500);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/gacha/pull', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          poolId: state.selectedPool.id,
          count
        })
      });

      if (!response.ok) {
        throw new Error('抽卡失败');
      }

      const data = await response.json();
      if (data.success) {
        // 2秒后开始翻牌动画
        setTimeout(() => {
          setState(prev => ({ ...prev, animationPhase: 'revealing' }));
          
          // 再过1秒显示最终结果
          setTimeout(() => {
            setState(prev => ({
              ...prev,
              pulling: false,
              showAnimation: false,
              showResult: true,
              lastResult: data.data,
              lastGachaType: count === 1 ? 'single' : 'ten',
              animationPhase: 'completed',
              userTickets: prev.userTickets ? {
                ...prev.userTickets,
                tickets: data.data.remainingTickets
              } : null
            }));

            // 刷新抽卡记录
            fetchRecentRecords();
          }, 1000);
        }, 2000);
      } else {
        throw new Error(data.error || '抽卡失败');
      }
    } catch (error) {
      console.error('抽卡失败:', error);
      setState(prev => ({ 
        ...prev, 
        pulling: false, 
        showAnimation: false,
        animationPhase: 'completed'
      }));
      toast.error('抽卡失败');
    }
  };

  // 获取最近抽卡记录
  const fetchRecentRecords = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/gacha/records/${user!.id}?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setState(prev => ({
            ...prev,
            recentRecords: data.data.records
          }));
        }
      }
    } catch (error) {
      console.error('获取抽卡记录失败:', error);
    }
  };

  // 获取稀有度颜色
  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case ItemRarity.R:
        return 'from-blue-400 to-blue-600';
      case ItemRarity.SR:
        return 'from-purple-400 to-purple-600';
      case ItemRarity.SSR:
        return 'from-yellow-400 to-yellow-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // 获取稀有度图标
  const getRarityIcon = (rarity: ItemRarity) => {
    switch (rarity) {
      case ItemRarity.R:
        return <Star className="w-5 h-5" />;
      case ItemRarity.SR:
        return <Crown className="w-5 h-5" />;
      case ItemRarity.SSR:
        return <Gem className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  // 关闭结果弹窗
  const closeResult = () => {
    setState(prev => ({ ...prev, showResult: false, lastResult: null, lastGachaType: null }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <HeaderBar title="抽卡系统" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* 抽卡次数显示 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Ticket className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">抽卡次数</h3>
                  <p className="text-sm text-gray-600">通过游戏获得抽卡机会</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">
                  {state.userTickets?.tickets || 0}
                </div>
                <div className="text-sm text-gray-500">
                  总获得: {state.userTickets?.totalEarned || 0}
                </div>
              </div>
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
          ) : state.pools.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-white/20 shadow-lg">
              <Gift className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">暂无可用的卡池</h3>
              <p className="text-gray-500">请等待管理员添加卡池</p>
            </div>
          ) : (
            <>
              {/* 卡池选择 */}
              {state.pools.length > 1 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">选择卡池</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.pools.map(pool => (
                      <button
                        key={pool.id}
                        onClick={() => setState(prev => ({ ...prev, selectedPool: pool }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          state.selectedPool?.id === pool.id
                            ? 'border-purple-500 bg-purple-50/80 backdrop-blur-sm'
                            : 'border-white/20 bg-white/60 backdrop-blur-sm hover:border-purple-300'
                        }`}
                      >
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-800">{pool.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{pool.description}</p>
                          <div className="text-xs text-purple-600 mt-2">
                            {pool.items.length} 种道具
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 当前卡池信息 */}
              {state.selectedPool && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{state.selectedPool.name}</h3>
                      <p className="text-gray-600 mt-1">{state.selectedPool.description}</p>
                    </div>
                    <div className="w-24 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
                      <ItemImage
                        src={state.selectedPool.bannerImageUrl}
                        alt={state.selectedPool.name}
                        className="w-full h-full object-cover"
                        fallbackIcon="image"
                      />
                    </div>
                  </div>

                  {/* 抽卡按钮 */}
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => performGacha(1)}
                      disabled={state.pulling || (state.userTickets?.tickets || 0) < 1}
                      className="flex-1 max-w-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state.pulling ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          抽卡中...
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            单抽
                          </div>
                          <div className="text-sm opacity-90">消耗 1 次</div>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => performGacha(10)}
                      disabled={state.pulling || (state.userTickets?.tickets || 0) < 10}
                      className="flex-1 max-w-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {state.pulling ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          抽卡中...
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-center gap-2">
                            <Gift className="w-5 h-5" />
                            十连抽
                          </div>
                          <div className="text-sm opacity-90">消耗 10 次 • 保底SR</div>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* 最近抽卡记录 */}
              {state.recentRecords.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">最近获得</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
                    {state.recentRecords.slice(0, 10).map(record => (
                      <div
                        key={record.id}
                        className={`relative p-3 rounded-lg bg-gradient-to-br ${getRarityColor(record.rarity)} text-white`}
                      >
                        <div className="text-center">
                          <div className="flex justify-center mb-2">
                            {getRarityIcon(record.rarity)}
                          </div>
                          <div className="text-xs font-medium truncate">
                            {record.item?.name || '未知道具'}
                          </div>
                          <div className="text-xs opacity-80 mt-1">
                            {record.rarity}
                          </div>
                        </div>
                        {record.isGuaranteed && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </>
        )}
        </div>
      </div>

      {/* 抽卡动画 */}
      {state.showAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl flex justify-center">
            {/* 卡牌背面显示 */}
            {state.animationPhase === 'cards' && (
              <div className={`grid ${
                state.animationCards === 1 
                  ? 'grid-cols-1 place-items-center gap-0' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 justify-items-center gap-4 sm:gap-4'
              }`}>
                {Array.from({ length: state.animationCards }).map((_, index) => (
                  <div
                    key={index}
                    className="w-20 h-28 sm:w-32 sm:h-48 md:w-36 md:h-54 lg:w-40 lg:h-60 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg flex items-center justify-center animate-fadeIn"
                  >
                    <div className="text-white text-xl sm:text-2xl md:text-3xl">?</div>
                  </div>
                ))}
              </div>
            )}

            {/* 抖动阶段 */}
            {state.animationPhase === 'shaking' && (
              <div className={`grid ${
                state.animationCards === 1 
                  ? 'grid-cols-1 place-items-center gap-0' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 justify-items-center gap-4 sm:gap-4'
              }`}>
                {Array.from({ length: state.animationCards }).map((_, index) => (
                  <div
                    key={index}
                    className="w-20 h-28 sm:w-32 sm:h-48 md:w-36 md:h-54 lg:w-40 lg:h-60 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg flex items-center justify-center animate-shake"
                  >
                    <div className="text-white text-xl sm:text-2xl md:text-3xl">?</div>
                  </div>
                ))}
              </div>
            )}

            {/* 翻牌阶段 */}
            {state.animationPhase === 'revealing' && state.lastResult && (
              <div className={`grid ${
                state.animationCards === 1 
                  ? 'grid-cols-1 place-items-center gap-0' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 justify-items-center gap-4 sm:gap-4'
              }`}>
                {state.lastResult.items.map((resultItem, index) => (
                  <div
                    key={index}
                    className={`w-20 h-28 sm:w-32 sm:h-48 md:w-36 md:h-54 lg:w-40 lg:h-60 rounded-lg shadow-lg flex flex-col items-center justify-center animate-flip relative ${
                      resultItem.item.rarity === 'SSR' ? 'bg-gradient-to-br from-orange-400 to-red-500 animate-pulse-orange' :
                      resultItem.item.rarity === 'SR' ? 'bg-gradient-to-br from-purple-400 to-purple-600 animate-pulse-purple' :
                      'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}
                  >
                    {/* 光效 */}
                    {resultItem.item.rarity === 'SSR' && (
                      <div className="absolute inset-0 rounded-lg bg-orange-300 opacity-50 animate-ping"></div>
                    )}
                    {resultItem.item.rarity === 'SR' && (
                      <div className="absolute inset-0 rounded-lg bg-purple-300 opacity-50 animate-ping"></div>
                    )}
                    
                    <ItemImage 
                      src={resultItem.item.imageUrl}
                      alt={resultItem.item.name}
                      rarity={resultItem.item.rarity}
                      className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-cover rounded mb-1" 
                    />
                    <div className="text-white text-xs sm:text-sm md:text-base text-center px-1">
                      {resultItem.item.name}
                    </div>
                    <div className={`text-xs sm:text-sm font-bold ${
                      resultItem.item.rarity === 'SSR' ? 'text-orange-200' :
                      resultItem.item.rarity === 'SR' ? 'text-purple-200' :
                      'text-blue-200'
                    }`}>
                      {resultItem.item.rarity}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 抽卡结果弹窗 */}
      {state.showResult && state.lastResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">抽卡结果</h2>
                <p className="text-gray-600">
                  获得 {state.lastResult.items.length} 个道具
                  {state.lastResult.items.some(item => item.isNew) && (
                    <span className="text-green-600 ml-2">
                      • {state.lastResult.items.filter(item => item.isNew).length} 个新道具
                    </span>
                  )}
                </p>
              </div>

              <div className={`${state.lastResult.items.length === 1 ? 'flex justify-center' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5'} gap-4 mb-6`}>
                {state.lastResult.items.map((resultItem, index) => (
                  <div
                    key={index}
                    className={`relative p-4 rounded-lg bg-gradient-to-br ${getRarityColor(resultItem.item.rarity)} text-white transform transition-all duration-500 hover:scale-105 ${state.lastResult.items.length === 1 ? 'w-48' : ''}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden bg-white bg-opacity-20">
                        <ItemImage
                          src={resultItem.item.imageUrl}
                          alt={resultItem.item.name}
                          className="w-full h-full object-cover"
                          fallbackIcon="gift"
                          rarity={resultItem.item.rarity}
                        />
                      </div>
                      <div className="text-sm font-medium mb-1">
                        {resultItem.item.name}
                      </div>
                      <div className="text-xs opacity-90">
                        {resultItem.item.rarity}
                      </div>
                    </div>

                    {/* 新获得标识 */}
                    {resultItem.isNew && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        NEW
                      </div>
                    )}

                    {/* 保底标识 */}
                    {resultItem.isGuaranteed && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        保底
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-center space-y-4">
                {/* 再来一发/10发按钮 - 根据上次抽卡类型显示对应按钮 */}
                <div className="flex gap-4 justify-center">
                  {state.lastGachaType === 'single' && (
                    <button
                      onClick={() => {
                        closeResult();
                        performGacha(1);
                      }}
                      disabled={state.pulling || (state.userTickets?.tickets || 0) < 1}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      再来一发
                    </button>
                  )}
                  
                  {state.lastGachaType === 'ten' && (
                    <button
                      onClick={() => {
                        closeResult();
                        performGacha(10);
                      }}
                      disabled={state.pulling || (state.userTickets?.tickets || 0) < 10}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Gift className="w-4 h-4" />
                      再来十发
                    </button>
                  )}
                </div>

                {/* 确定按钮 */}
                <button
                  onClick={closeResult}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
};

export default Gacha;