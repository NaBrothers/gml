import React, { useState, useEffect } from 'react';
import { Package, Star, Crown, Gem, Filter, Grid, List, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import ScrollToTop from '../components/ScrollToTop';
import ItemImage from '../components/ItemImage';
import { Item, UserItem, ItemType, ItemRarity, GachaPool } from '../../shared/types';

interface CollectionState {
  allItems: (Item & { pools: GachaPool[] })[];
  userItems: UserItem[];
  allPools: GachaPool[];
  loading: boolean;
  error: string | null;
  filter: {
    type: ItemType | 'all';
    rarity: ItemRarity | 'all';
    owned: 'all' | 'owned' | 'not_owned';
    pool: string | 'all';
    search: string;
  };
  viewMode: 'grid' | 'list';
}

const Collection: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  
  // 检测是否为移动设备
  const isMobile = window.innerWidth < 768;
  
  const [state, setState] = useState<CollectionState>({
    allItems: [],
    userItems: [],
    allPools: [],
    loading: true,
    error: null,
    filter: {
      type: 'all',
      rarity: 'all',
      owned: 'all',
      pool: 'all',
      search: ''
    },
    viewMode: isMobile ? 'list' : 'grid' // 手机模式下默认使用列表模式
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
      
      // 并行获取所有道具（包含卡池信息）和用户道具
      const [allItemsResponse, userItemsResponse] = await Promise.all([
        fetch('/api/items/with-pools/all?active=true', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`/api/items/user/${user!.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!allItemsResponse.ok || !userItemsResponse.ok) {
        throw new Error('获取数据失败');
      }

      const allItemsData = await allItemsResponse.json();
      const userItemsData = await userItemsResponse.json();

      if (allItemsData.success && userItemsData.success) {
        setState(prev => ({
          ...prev,
          allItems: allItemsData.data.items,
          userItems: userItemsData.data.userItems,
          allPools: allItemsData.data.pools,
          loading: false
        }));
      } else {
        throw new Error(allItemsData.error || userItemsData.error || '获取数据失败');
      }
    } catch (error) {
      console.error('获取收藏数据失败:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: '获取收藏数据失败'
      }));
      toast.error('获取收藏数据失败');
    }
  };

  // 装备/卸载道具
  const toggleEquip = async (itemId: string, currentEquipped: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/items/user/${user!.id}/equip/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isEquipped: !currentEquipped })
      });

      if (!response.ok) {
        throw new Error('操作失败');
      }

      const data = await response.json();
      if (data.success) {
        // 更新本地状态
        setState(prev => ({
          ...prev,
          userItems: prev.userItems.map(ui => 
            ui.itemId === itemId ? { ...ui, isEquipped: !currentEquipped } : ui
          )
        }));
        toast.success(data.message);
      } else {
        throw new Error(data.error || '操作失败');
      }
    } catch (error) {
      console.error('装备操作失败:', error);
      toast.error('装备操作失败');
    }
  };

  // 过滤道具
  const filteredItems = state.allItems.filter(item => {
    const userItem = state.userItems.find(ui => ui.itemId === item.id);
    const isOwned = !!userItem;

    // 类型过滤
    if (state.filter.type !== 'all' && item.type !== state.filter.type) {
      return false;
    }

    // 稀有度过滤
    if (state.filter.rarity !== 'all' && item.rarity !== state.filter.rarity) {
      return false;
    }

    // 拥有状态过滤
    if (state.filter.owned === 'owned' && !isOwned) {
      return false;
    }
    if (state.filter.owned === 'not_owned' && isOwned) {
      return false;
    }

    // 卡池过滤
    if (state.filter.pool !== 'all' && !item.pools.some(pool => pool.id === state.filter.pool)) {
      return false;
    }

    // 搜索过滤
    if (state.filter.search && !item.name.toLowerCase().includes(state.filter.search.toLowerCase())) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // 排序：已拥有的道具排在前面
    const userItemA = state.userItems.find(ui => ui.itemId === a.id);
    const userItemB = state.userItems.find(ui => ui.itemId === b.id);
    const isOwnedA = !!userItemA;
    const isOwnedB = !!userItemB;
    
    // 如果拥有状态不同，已拥有的排在前面
    if (isOwnedA && !isOwnedB) return -1;
    if (!isOwnedA && isOwnedB) return 1;
    
    // 如果拥有状态相同，按稀有度排序（SSR > SR > R）
    const rarityOrder = { 'SSR': 3, 'SR': 2, 'R': 1 };
    const rarityDiff = (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    if (rarityDiff !== 0) return rarityDiff;
    
    // 最后按名称排序
    return a.name.localeCompare(b.name);
  });

  // 获取稀有度颜色
  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case ItemRarity.R:
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case ItemRarity.SR:
        return 'text-purple-500 bg-purple-50 border-purple-200';
      case ItemRarity.SSR:
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  // 获取稀有度图标
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

  // 获取道具类型名称
  const getItemTypeName = (type: ItemType) => {
    switch (type) {
      case ItemType.AVATAR_FRAME:
        return '头像框';
      case ItemType.HOME_ILLUSTRATION:
        return '主页立绘';
      case ItemType.PROFILE_BANNER:
        return '个人页背景';
      case ItemType.THEME:
        return '主题';
      case ItemType.DECORATION:
        return '装饰';
      default:
        return '未知';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <HeaderBar title="道具收藏" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">

          {/* 统计信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 shadow-lg">
              <div className="text-xl md:text-2xl font-bold text-purple-600">{state.userItems.length}</div>
              <div className="text-xs md:text-sm text-gray-600">已拥有</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 shadow-lg">
              <div className="text-xl md:text-2xl font-bold text-gray-600">{state.allItems.length}</div>
              <div className="text-xs md:text-sm text-gray-600">总道具</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 shadow-lg">
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {state.userItems.filter(ui => ui.isEquipped).length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">已装备</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 shadow-lg">
              <div className="text-xl md:text-2xl font-bold text-blue-600">
                {Math.round((state.userItems.length / Math.max(state.allItems.length, 1)) * 100)}%
              </div>
              <div className="text-xs md:text-sm text-gray-600">收集率</div>
            </div>
          </div>

          {/* 过滤器和视图切换 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20 shadow-lg mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 搜索 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜索道具名称..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={state.filter.search}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      filter: { ...prev.filter, search: e.target.value }
                    }))}
                  />
                </div>
              </div>

              {/* 过滤器 */}
              <div className="flex flex-wrap gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={state.filter.type}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    filter: { ...prev.filter, type: e.target.value as ItemType | 'all' }
                  }))}
                >
                  <option value="all">所有类型</option>
                  <option value={ItemType.AVATAR_FRAME}>头像框</option>
                  <option value={ItemType.HOME_ILLUSTRATION}>主页立绘</option>
                  <option value={ItemType.PROFILE_BANNER}>个人页背景</option>
                  <option value={ItemType.THEME}>主题</option>
                  <option value={ItemType.DECORATION}>装饰</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={state.filter.rarity}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    filter: { ...prev.filter, rarity: e.target.value as ItemRarity | 'all' }
                  }))}
                >
                  <option value="all">所有稀有度</option>
                  <option value={ItemRarity.R}>R</option>
                  <option value={ItemRarity.SR}>SR</option>
                  <option value={ItemRarity.SSR}>SSR</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={state.filter.owned}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    filter: { ...prev.filter, owned: e.target.value as 'all' | 'owned' | 'not_owned' }
                  }))}
                >
                  <option value="all">全部</option>
                  <option value="owned">已拥有</option>
                  <option value="not_owned">未拥有</option>
                </select>

                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={state.filter.pool}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    filter: { ...prev.filter, pool: e.target.value }
                  }))}
                >
                  <option value="all">所有卡包</option>
                  {state.allPools.map(pool => (
                    <option key={pool.id} value={pool.id}>{pool.name}</option>
                  ))}
                </select>
            </div>

            {/* 视图切换 */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                className={`px-3 py-2 ${state.viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                className={`px-3 py-2 ${state.viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 道具列表 */}
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
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-white/20 shadow-lg">
            <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">没有找到符合条件的道具</h3>
            <p className="text-gray-500">尝试调整筛选条件</p>
          </div>
        ) : (
          <div className={state.viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
            : 'space-y-4'
          }>
            {filteredItems.map(item => {
              const userItem = state.userItems.find(ui => ui.itemId === item.id);
              const isOwned = !!userItem;
              const isEquipped = userItem?.isEquipped || false;

              return (
                <div
                  key={item.id}
                  className={`bg-white/60 backdrop-blur-sm rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                    isOwned ? 'border-purple-200/50' : 'border-gray-200/50 opacity-60'
                  } ${state.viewMode === 'list' ? 'flex items-center p-4' : 'p-4'}`}
                >
                  {state.viewMode === 'grid' ? (
                    <>
                      {/* 道具图片 */}
                      <div className="relative mb-3">
                        <div className={`aspect-square rounded-lg overflow-hidden ${
                          isOwned ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'bg-gray-100'
                        }`}>
                          <ItemImage
                            src={item.imageUrl}
                            alt={item.name}
                            className={`w-full h-full object-cover ${!isOwned ? 'grayscale' : ''}`}
                            rarity={item.rarity}
                            isOwned={isOwned}
                          />
                        </div>
                        
                        {/* 稀有度标识 */}
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(item.rarity)}`}>
                          <div className="flex items-center gap-1">
                            {getRarityIcon(item.rarity)}
                            {item.rarity}
                          </div>
                        </div>

                        {/* 装备状态 */}
                        {isEquipped && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            已装备
                          </div>
                        )}
                      </div>

                      {/* 道具信息 */}
                      <div className="space-y-2">
                        <h3 className={`font-medium ${isOwned ? 'text-gray-800' : 'text-gray-500'}`}>
                          {item.name}
                        </h3>
                        <p className={`text-sm ${isOwned ? 'text-gray-600' : 'text-gray-400'}`}>
                          {getItemTypeName(item.type)}
                        </p>
                        <p className={`text-xs ${isOwned ? 'text-gray-500' : 'text-gray-400'}`}>
                          {item.description}
                        </p>
                        
                        {/* 所属卡包信息 */}
                        {item.pools.length > 0 && (
                          <div className="space-y-1">
                            <p className={`text-xs font-medium ${isOwned ? 'text-gray-600' : 'text-gray-400'}`}>
                              所属卡包:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {item.pools.map(pool => (
                                <span
                                  key={pool.id}
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    isOwned 
                                      ? 'bg-blue-100 text-blue-700' 
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {pool.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 操作按钮 */}
                        {isOwned && (
                          <button
                            onClick={() => toggleEquip(item.id, isEquipped)}
                            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                              isEquipped
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            {isEquipped ? '卸载' : '装备'}
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* 列表视图 */}
                      <div className={`w-16 h-16 rounded-lg overflow-hidden mr-4 ${
                        isOwned ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'bg-gray-100'
                      }`}>
                        <ItemImage
                          src={item.imageUrl}
                          alt={item.name}
                          className={`w-full h-full object-cover ${!isOwned ? 'grayscale' : ''}`}
                          rarity={item.rarity}
                          isOwned={isOwned}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 mr-4">
                            <h3 className={`font-medium ${isOwned ? 'text-gray-800' : 'text-gray-500'}`}>
                              {item.name}
                            </h3>
                            <p className={`text-sm ${isOwned ? 'text-gray-600' : 'text-gray-400'}`}>
                              {getItemTypeName(item.type)} • {item.description}
                            </p>
                            
                            {/* 所属卡包信息 */}
                            {item.pools.length > 0 && (
                              <div className="mt-1">
                                <span className={`text-xs ${isOwned ? 'text-gray-500' : 'text-gray-400'}`}>
                                  卡包: {item.pools.map(pool => pool.name).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(item.rarity)}`}>
                              <div className="flex items-center gap-1">
                                {getRarityIcon(item.rarity)}
                                {item.rarity}
                              </div>
                            </div>
                            
                            {isEquipped && (
                              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                已装备
                              </div>
                            )}
                            
                            {isOwned && (
                              <button
                                onClick={() => toggleEquip(item.id, isEquipped)}
                                className={`py-1 px-3 rounded-lg text-sm font-medium transition-colors ${
                                  isEquipped
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                              >
                                {isEquipped ? '卸载' : '装备'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default Collection;