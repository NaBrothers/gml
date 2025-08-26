import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { rankingApi } from '../lib/api';
import { Trophy, Medal, Crown, TrendingUp, Users, BarChart3, ArrowLeft } from 'lucide-react';
import { rankConfigs, getRankNameByLevel } from '../utils/rankConfigs';
import Avatar from '../components/Avatar';
import HeaderBar from '../components/HeaderBar';

// 段位配置数据（与后端保持一致）


interface Stats {
  rankStats: { [key: string]: number };
  totalUsers: number;
  totalGames: number;
  averagePoints: number;
}

const Ranking: React.FC = () => {
  const navigate = useNavigate();
  const { rankings, fetchRankings, isLoading } = useUserStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedMajorRank, setSelectedMajorRank] = useState<string>('all');
  const [majorRanks, setMajorRanks] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchRankings(50, selectedMajorRank === 'all' ? undefined : selectedMajorRank);
    loadStats();
  }, [fetchRankings, selectedMajorRank]);

  const loadStats = async () => {
    try {
      const response = await rankingApi.getStats();
      if (response.success && response.data) {
        // 使用API返回的数据结构
        const adaptedStats: Stats = {
          rankStats: response.data.rankStats || {},
          totalUsers: response.data.totalUsers,
          totalGames: response.data.totalGames,
          averagePoints: response.data.averagePoints
        };
        setStats(adaptedStats);
        // 从rankStats中提取段位信息
        setMajorRanks(Object.keys(response.data.rankStats || {}));
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {rank}
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-600';
      default:
        return 'bg-gradient-to-r from-gray-200 to-gray-300';
    }
  };

  // 排行榜数据已经在后端按大段位筛选过了
  const filteredRankings = rankings;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <HeaderBar title="积分排行榜" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-600 truncate">总用户数</p>
                    <p className="text-base md:text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-5 h-5 md:w-8 md:h-8 text-blue-500 flex-shrink-0 ml-2" />
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-600 truncate">总对局数</p>
                    <p className="text-base md:text-2xl font-bold text-gray-900">{stats.totalGames}</p>
                  </div>
                  <BarChart3 className="w-5 h-5 md:w-8 md:h-8 text-green-500 flex-shrink-0 ml-2" />
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-600 truncate">平均积分</p>
                    <p className="text-base md:text-2xl font-bold text-gray-900">{stats.averagePoints}</p>
                  </div>
                  <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-purple-500 flex-shrink-0 ml-2" />
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-gray-600 truncate">最高段位</p>
                    <p className="text-xs md:text-lg font-bold text-gray-900 truncate">
                      {(() => {
                        // 按段位等级排序，找到最高段位
                        const rankOrder = ['雀之气', '雀者', '雀师', '大雀师', '雀灵', '雀王', '雀皇', '雀宗', '雀尊', '雀圣', '雀帝'];
                        const ranks = Object.keys(stats.rankStats);
                        if (ranks.length === 0) return '暂无';
                        
                        // 按段位等级和小段位排序
                        const sortedRanks = ranks.sort((a, b) => {
                          // 提取大段位
                          const getMajorRank = (rank: string) => {
                            for (const major of rankOrder) {
                              if (rank.includes(major)) return major;
                            }
                            return '雀之气';
                          };
                          
                          const majorA = getMajorRank(a);
                          const majorB = getMajorRank(b);
                          const majorOrderA = rankOrder.indexOf(majorA);
                          const majorOrderB = rankOrder.indexOf(majorB);
                          
                          if (majorOrderA !== majorOrderB) {
                            return majorOrderB - majorOrderA; // 降序
                          }
                          
                          // 同大段位，比较小段位
                          const getMinorRank = (rank: string) => {
                            const match = rank.match(/[一二三四五六七八九]/);
                            if (!match) return 0;
                            const nums = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
                            return nums.indexOf(match[0]);
                          };
                          
                          return getMinorRank(b) - getMinorRank(a); // 降序
                        });
                        
                        return sortedRanks[0];
                      })()
                      }
                    </p>
                  </div>
                  <Crown className="w-5 h-5 md:w-8 md:h-8 text-yellow-500 flex-shrink-0 ml-2" />
                </div>
              </div>
            </div>
          )}

          {/* 移动端下拉筛选 */}
          <div className="lg:hidden mb-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/50 transition-colors rounded-2xl"
              >
                <div>
                  <span className="text-sm text-gray-600">段位筛选</span>
                  <div className="font-medium text-gray-800">
                    {selectedMajorRank === 'all' ? `全部段位 (${rankings.length})` : `${selectedMajorRank} (${stats?.rankStats[selectedMajorRank] || 0})`}
                  </div>
                </div>
                <div className={`transform transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}>
                  ▼
                </div>
              </button>
              
              {isDropdownOpen && (
                <div className="border-t border-gray-200 p-2 space-y-1">
                  <button
                    onClick={() => {
                      setSelectedMajorRank('all');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedMajorRank === 'all'
                        ? 'bg-pink-100 text-pink-800 border border-pink-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    全部段位 ({rankings.length})
                  </button>
                  {majorRanks.map((majorRank) => {
                    const count = stats?.rankStats[majorRank] || 0;
                    return (
                      <button
                        key={majorRank}
                        onClick={() => {
                          setSelectedMajorRank(majorRank);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedMajorRank === majorRank
                            ? 'bg-pink-100 text-pink-800 border border-pink-300'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {majorRank} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 桌面端大段位筛选 */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg sticky top-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">段位筛选</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedMajorRank('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedMajorRank === 'all'
                        ? 'bg-pink-100 text-pink-800 border border-pink-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    全部段位 ({rankings.length})
                  </button>
                  {majorRanks.map((majorRank) => {
                    const count = stats?.rankStats[majorRank] || 0;
                    return (
                      <button
                        key={majorRank}
                        onClick={() => setSelectedMajorRank(majorRank)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedMajorRank === majorRank
                            ? 'bg-pink-100 text-pink-800 border border-pink-300'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {majorRank} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* 大段位分布 */}
                {stats && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">段位分布</h4>
                    <div className="space-y-2">
                      {Object.entries(stats.rankStats)
                        .sort(([a], [b]) => {
                          // 按段位顺序排序
                          const order = ['雀之气', '雀者', '雀师', '大雀师', '雀灵', '雀王', '雀皇', '雀宗', '雀尊', '雀圣', '雀帝'];
                          return order.indexOf(a) - order.indexOf(b);
                        })
                        .map(([rank, count]) => {
                          const percentage = ((count / stats.totalUsers) * 100).toFixed(1);
                          return (
                            <div key={rank} className="text-sm">
                              <div className="flex justify-between mb-1">
                                <span className="text-gray-600">{rank}</span>
                                <span className="text-gray-800 font-medium">{count}人</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-pink-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 排行榜列表 */}
            <div className="lg:col-span-3">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedMajorRank === 'all' ? '全部排名' : `${selectedMajorRank} 排名`}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({filteredRankings.length} 人)
                    </span>
                  </h2>
                </div>

                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                  </div>
                ) : filteredRankings.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    暂无数据
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredRankings.map((user, index) => {
                      const actualRank = selectedMajorRank === 'all' ? user.rank : index + 1;
                      return (
                        <div key={user.id} className="p-4 md:p-6 hover:bg-white/50 transition-colors">
                          {/* 移动端布局 */}
                          <div className="flex items-center justify-between md:hidden">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              {/* 用户头像 - 放大并添加排名边框 */}
                              <div className="relative flex-shrink-0">
                                <Avatar 
                                  src={user.avatar}
                                  alt={user.nickname}
                                  size="lg"
                                  className={actualRank <= 3 ? (
                                    actualRank === 1 ? 'border-4 border-yellow-400 shadow-lg shadow-yellow-200' :
                                    actualRank === 2 ? 'border-4 border-gray-400 shadow-lg shadow-gray-200' :
                                    'border-4 border-amber-600 shadow-lg shadow-amber-200'
                                  ) : ''}
                                  onClick={() => navigate(`/profile/${user.id}`)}
                                />
                              </div>
                              
                              {/* 用户信息 - 可伸缩 */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-lg font-bold text-gray-600 mr-1">#{actualRank}</span>
                                  <button
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                    className="font-semibold text-gray-800 hover:text-pink-600 transition-colors cursor-pointer underline-offset-4 hover:underline text-sm truncate"
                                  >
                                    {user.nickname || user.username}
                                  </button>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span className="truncate">{getRankNameByLevel(user.rankLevel)}</span>
                                  <span>•</span>
                                  <span className="whitespace-nowrap">{user.gamesPlayed} 局对局</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* 积分信息 - 固定宽度 */}
                            <div className="text-right flex-shrink-0 ml-3">
                              <div className="text-lg font-bold text-gray-800">
                                {user.totalPoints.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">积分</div>
                            </div>
                          </div>

                          {/* 桌面端布局 */}
                          <div className="hidden md:flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                              {/* 用户头像 - 放大并添加排名边框 */}
                              <div className="relative">
                                <Avatar 
                                  src={user.avatar}
                                  alt={user.nickname}
                                  size="xl"
                                  className={actualRank <= 3 ? (
                                    actualRank === 1 ? 'border-4 border-yellow-400 shadow-lg shadow-yellow-200' :
                                    actualRank === 2 ? 'border-4 border-gray-400 shadow-lg shadow-gray-200' :
                                    'border-4 border-amber-600 shadow-lg shadow-amber-200'
                                  ) : ''}
                                  onClick={() => navigate(`/profile/${user.id}`)}
                                />
                              </div>
                              
                              {/* 用户信息 */}
                              <div>
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl font-bold text-gray-600">#{actualRank}</span>
                                  <button
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                    className="font-semibold text-gray-800 hover:text-pink-600 transition-colors cursor-pointer underline-offset-4 hover:underline text-lg"
                                  >
                                    {user.nickname || user.username}
                                  </button>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                  <span>{getRankNameByLevel(user.rankLevel)}</span>
                                  <span>•</span>
                                  <span>{user.gamesPlayed} 局对局</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* 积分信息 */}
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-800">
                                {user.totalPoints.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">积分</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;