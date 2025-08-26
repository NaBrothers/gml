import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Trophy, Users, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { GameDetail } from '../../shared/types';
import { gamesApi } from '../lib/api';
import HeaderBar from '../components/HeaderBar';
import ScrollToTop from '../components/ScrollToTop';

interface MatchHistoryState {
  games: GameDetail[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  sortOrder: 'desc' | 'asc';
}

const ITEMS_PER_PAGE = 10;

const MatchHistory: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<MatchHistoryState>({
    games: [],
    loading: true,
    error: null,
    currentPage: 1,
    totalPages: 1,
    sortOrder: 'desc'
  });

  // 获取比赛记录数据
  const fetchGames = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await gamesApi.getAll();
      if (response.success && response.data) {
        const sortedGames = [...response.data].sort((a, b) => {
          const dateA = new Date(a.game.createdAt).getTime();
          const dateB = new Date(b.game.createdAt).getTime();
          return state.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
        
        const totalPages = Math.ceil(sortedGames.length / ITEMS_PER_PAGE);
        
        setState(prev => ({
          ...prev,
          games: sortedGames,
          loading: false,
          totalPages
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || '获取比赛记录失败'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: '网络请求失败'
      }));
    }
  };

  useEffect(() => {
    fetchGames();
  }, [state.sortOrder]);

  // 格式化时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取名次显示文本
  const getPositionText = (position: number) => {
    const positions = ['一位', '二位', '三位', '四位'];
    return positions[position - 1] || `${position}位`;
  };

  // 获取名次颜色
  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-orange-600 bg-orange-50';
      case 4: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // 获取积分变化颜色
  const getPointsChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // 切换排序
  const toggleSort = () => {
    setState(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc',
      currentPage: 1
    }));
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // 获取当前页数据
  const getCurrentPageGames = () => {
    const startIndex = (state.currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return state.games.slice(startIndex, endIndex);
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载比赛记录中...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={fetchGames}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const currentPageGames = getCurrentPageGames();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <HeaderBar title="比赛记录" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 工具栏 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 md:mb-6 border border-white/20 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="text-sm md:text-base text-gray-700 font-medium">
                  共 {state.games.length} 场比赛
                </span>
              </div>
              
              <button
                onClick={toggleSort}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm"
              >
                <Clock className="w-4 h-4" />
                <span>按时间排序 ({state.sortOrder === 'desc' ? '最新' : '最旧'})</span>
              </button>
            </div>
          </div>

          {/* 比赛记录列表 */}
          {currentPageGames.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-8 md:p-12 text-center border border-white/20 shadow-lg">
              <Trophy className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">暂无比赛记录</h3>
              <p className="text-gray-500">还没有进行过任何比赛</p>
            </div>
          ) : (
            <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20 shadow-lg overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                  比赛记录
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({state.games.length} 场)
                  </span>
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {currentPageGames.map((gameDetail) => {
                  // 按名次排序玩家
                  const sortedPlayers = [...gameDetail.players].sort((a, b) => a.position - b.position);
                  
                  return (
                    <div
                      key={gameDetail.game.id}
                      className="p-4 md:p-6 hover:bg-white/50 transition-colors"
                    >
                      {/* 移动端布局 */}
                      <div className="md:hidden">
                        {/* 对局信息头部 */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-indigo-600" />
                            <span className="font-medium text-gray-800">{gameDetail.game.gameType}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{formatDate(gameDetail.game.createdAt)}</span>
                          </div>
                        </div>

                        {/* 玩家结果 - 紧凑布局 */}
                        <div className="space-y-2">
                          {sortedPlayers.map((player) => (
                            <div
                              key={player.id}
                              className="flex items-center justify-between py-2 px-3 bg-gray-50/50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPositionColor(player.position)}`}>
                                  {getPositionText(player.position)}
                                </span>
                                <Link
                                  to={`/profile/${player.userId}`}
                                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors truncate"
                                >
                                  {player.user?.nickname || player.user?.username || '未知玩家'}
                                </Link>
                              </div>
                              <div className="text-right flex-shrink-0 ml-2">
                                <div className="text-sm font-semibold text-gray-900">
                                  {player.finalScore.toLocaleString()}
                                </div>
                                <div className={`text-xs font-medium ${getPointsChangeColor(player.rankPointsChange)}`}>
                                  {player.rankPointsChange > 0 ? '+' : ''}{player.rankPointsChange}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 桌面端布局 */}
                      <div className="hidden md:block">
                        {/* 对局信息头部 */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-indigo-600" />
                            <span className="font-semibold text-lg text-gray-800">{gameDetail.game.gameType}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{formatDate(gameDetail.game.createdAt)}</span>
                          </div>
                        </div>

                        {/* 玩家结果 - 表格式布局 */}
                        <div className="grid grid-cols-4 gap-4">
                          {sortedPlayers.map((player) => (
                            <div
                              key={player.id}
                              className="bg-gray-50/50 rounded-lg p-4 hover:bg-gray-100/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPositionColor(player.position)}`}>
                                  {getPositionText(player.position)}
                                </span>
                                <span className="text-xs text-gray-500">#{player.position}</span>
                              </div>

                              <div className="mb-3">
                                <Link
                                  to={`/profile/${player.userId}`}
                                  className="font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer block truncate"
                                >
                                  {player.user?.nickname || player.user?.username || '未知玩家'}
                                </Link>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600">得分:</span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {player.finalScore.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600">积分:</span>
                                  <span className={`text-sm font-semibold ${getPointsChangeColor(player.rankPointsChange)}`}>
                                    {player.rankPointsChange > 0 ? '+' : ''}{player.rankPointsChange}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 分页控件 */}
          {state.totalPages > 1 && (
            <div className="mt-6 md:mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一页
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: state.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg shadow-lg ${
                      page === state.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white/60 backdrop-blur-sm border border-white/20 hover:bg-white/80 hover:text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage === state.totalPages}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white/60 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/80 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                下一页
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      <ScrollToTop />
    </div>
  );
};

export default MatchHistory;