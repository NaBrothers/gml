import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, Trophy, TrendingUp, ArrowLeft, Clock, Users, Target, Award } from 'lucide-react';
import { userApi } from '../lib/api';
import PointsChart from '../components/PointsChart';
import PositionChart from '../components/PositionChart';
import PointsDisplay from '../components/PointsDisplay';
import Avatar from '../components/Avatar';
import AchievementBadge, { AchievementBadgeList, AchievementStats } from '../components/AchievementBadge';
import { useAuthStore } from '../stores/authStore';
import { rankConfigs, getRankNameByLevel } from '../utils/rankConfigs';
import HeaderBar from '../components/HeaderBar';
import ScrollToTop from '../components/ScrollToTop';
import { AchievementEarned, UserAchievementStats } from '../../shared/types';

// 更新接口定义以适配新的数据结构
interface UserHistory {
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    stats: {
      totalPoints: number;
      rankLevel: number;
      rankPoints: number;
      gamesPlayed: number;
      wins: number;
      averagePosition: number;
      currentRank: string;
    };
  };
  histories: Array<{
    game: {
      id: string;
      gameType: string;
      createdAt: string;
    };
    gamePlayer: {
      id: string;
      userId: string;
      finalScore: number;
      rawPoints: number;
      umaPoints: number;
      rankPointsChange: number;
      originalRankPointsChange?: number; // 原始积分变化（未应用新手保护）
      position: number;
    };
    allPlayers: Array<{
      id: string;
      userId: string;
      finalScore: number;
      position: number;
      user?: {
        id: string;
        nickname: string;
        username: string;
      };
    }>;
    pointHistory?: {
      gameId: string;
      pointsBefore: number;
      pointsAfter: number;
      pointsChange: number;
      originalPointsChange?: number; // 原始积分变化（未应用新手保护）
      rankBefore: string;
      rankAfter: string;
      gameDate: string;
      opponents: string[];
      achievements?: AchievementEarned[]; // 本局获得的成就
    };
    opponents: string[];
  }>;
  stats: {
    totalGames: number;
    wins: number;
    averagePosition: string;
    totalPointsChange: number;
    originalTotalPointsChange?: number; // 原始积分变化（未应用新手保护）
    currentPoints: number;
    currentRank: number;
  };
  chartData: {
    pointsHistory: Array<{
      date: string;
      pointsBefore: number;
      pointsAfter: number;
      pointsChange: number;
      rankBefore: string;
      rankAfter: string;
    }>;
    gameResults: Array<{
      date: string;
      position: number;
      pointsChange: number;
      finalScore: number;
    }>;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// 计算用户成就统计
const calculateUserAchievementStats = (histories: any[]): UserAchievementStats => {
  const achievementCounts: { [achievementName: string]: number } = {};
  let totalBonusPoints = 0;

  histories.forEach(history => {
    if (history.pointHistory?.achievements) {
      history.pointHistory.achievements.forEach((achievement: AchievementEarned) => {
        achievementCounts[achievement.achievementName] = 
          (achievementCounts[achievement.achievementName] || 0) + 1;
        totalBonusPoints += achievement.bonusPoints;
      });
    }
  });

  return {
    totalAchievements: Object.values(achievementCounts).reduce((sum, count) => sum + count, 0),
    achievementCounts,
    totalBonusPoints
  };
};

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userHistory, setUserHistory] = useState<UserHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserHistory(userId);
    }
  }, [userId]);

  const fetchUserHistory = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await userApi.getUserHistory(id);
      if (response.success && response.data) {
        setUserHistory(response.data);
      } else {
        setError(response.error || '获取用户历史记录失败');
      }
    } catch (err) {
      console.error('获取用户历史记录失败:', err);
      setError('获取用户历史记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-green-600 bg-green-100';
      case 4: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPositionText = (position: number) => {
    switch (position) {
      case 1: return '1位';
      case 2: return '2位';
      case 3: return '3位';
      case 4: return '4位';
      default: return `${position}位`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !userHistory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  const { user, histories, stats } = userHistory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <HeaderBar title="用户详情" />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* 用户信息卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 border border-white/20 shadow-lg">
          {/* 移动端布局 */}
          <div className="block sm:hidden">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar
                src={user.avatar}
                alt={user.nickname}
                size="lg"
                className="w-16 h-16"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{user.nickname}</h2>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center">
                    <Trophy className="w-4 h-4 mb-1 text-yellow-500" />
                    <span className="text-gray-600">{getRankNameByLevel(user.stats.rankLevel)}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Target className="w-4 h-4 mb-1 text-blue-500" />
                    <span className="text-gray-600">{user.stats.totalPoints?.toLocaleString() || '0'}</span>
                    <span className="text-xs text-gray-500">积分</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Users className="w-4 h-4 mb-1 text-green-500" />
                    <span className="text-gray-600">{user.stats.gamesPlayed || 0}</span>
                    <span className="text-xs text-gray-500">局对局</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 桌面端布局 */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar
                src={user.avatar}
                alt={user.nickname}
                size="xl"
                className="w-20 h-20"
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.nickname}</h2>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className="flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    {getRankNameByLevel(user.stats.rankLevel)}
                  </span>
                  <span className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {user.stats.totalPoints?.toLocaleString() || '0'} 积分
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {user.stats.gamesPlayed || 0} 局对局
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 统计数据卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">总对局</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalGames}</p>
              </div>
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">胜利次数</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.wins}</p>
              </div>
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">平均排名</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.averagePosition}</p>
              </div>
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">积分变化</p>
                <p className="text-lg sm:text-2xl font-bold">
                  <PointsDisplay 
                    pointsChange={stats.totalPointsChange}
                    originalPointsChange={stats.originalTotalPointsChange}
                    showSign={true}
                  />
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* 成就展示区域 */}
        {(() => {
          const achievementStats = calculateUserAchievementStats(histories);
          return (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-800">成就统计</h3>
              </div>
              
              {achievementStats.totalAchievements > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 成就统计 */}
                  <div>
                    <AchievementStats
                      achievementCounts={achievementStats.achievementCounts}
                      totalBonusPoints={achievementStats.totalBonusPoints}
                    />
                  </div>
                  
                  {/* 最近获得的成就 */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-3">最近获得的成就</h4>
                    <div className="space-y-2">
                      {histories
                        .filter(h => h.pointHistory?.achievements?.length > 0)
                        .slice(0, 3)
                        .map((history, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <AchievementBadgeList
                              achievements={history.pointHistory.achievements}
                              size="sm"
                              maxDisplay={2}
                            />
                            <span className="text-xs text-gray-500">
                              {new Date(history.game.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">🏆</div>
                  <p className="text-gray-500">暂无成就，继续努力吧！</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* 积分变化图表 */}
        <div className="mb-8">
          <PointsChart chartData={userHistory.chartData} />
        </div>

        {/* 名次分布图表 */}
        <div className="mb-8">
          <PositionChart gameResults={userHistory.chartData.gameResults} />
        </div>

        {/* 对局历史 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-6">对局历史</h3>
          
          {histories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎯</div>
              <p className="text-gray-500">暂无对局记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {histories.map((history, index) => {
                // 添加空值检查
                if (!history || !history.gamePlayer) {
                  return null;
                }
                
                return (
                  <div
                    key={history.game?.id || index}
                    className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50/50 transition-colors"
                  >
                    {/* 移动端布局 */}
                    <div className="block sm:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            history.gamePlayer.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                            history.gamePlayer.position === 2 ? 'bg-gray-100 text-gray-800' :
                            history.gamePlayer.position === 3 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {history.gamePlayer.position === 1 ? '一位' :
                             history.gamePlayer.position === 2 ? '二位' :
                             history.gamePlayer.position === 3 ? '三位' : '四位'}
                          </span>
                          <span className="text-sm font-medium text-gray-800">{history.game?.gameType}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">
                            {history.game?.createdAt ? new Date(history.game.createdAt).toLocaleDateString() : '未知日期'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">得分:</span>
                          <span className="font-semibold">{history.gamePlayer.finalScore?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">积分变化:</span>
                          <PointsDisplay 
                            pointsChange={history.pointHistory?.originalPointsChange || history.gamePlayer.originalRankPointsChange || 0}
                            originalPointsChange={history.gamePlayer.originalRankPointsChange}
                            showSign={true}
                          />
                        </div>
                        {history.pointHistory && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">段位:</span>
                            <span className="text-sm">
                              {history.pointHistory.rankBefore === history.pointHistory.rankAfter ? (
                                <span className="text-gray-700">{history.pointHistory.rankBefore}</span>
                              ) : (
                                <span className="text-blue-600">
                                  {history.pointHistory.rankBefore} → {history.pointHistory.rankAfter}
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        
                        {/* 成就展示 */}
                        {history.pointHistory?.achievements && history.pointHistory.achievements.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <AchievementBadgeList
                              achievements={history.pointHistory.achievements}
                              size="sm"
                              maxDisplay={3}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 桌面端布局 */}
                    <div className="hidden sm:block">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            history.gamePlayer.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                            history.gamePlayer.position === 2 ? 'bg-gray-100 text-gray-800' :
                            history.gamePlayer.position === 3 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {history.gamePlayer.position === 1 ? '一位' :
                             history.gamePlayer.position === 2 ? '二位' :
                             history.gamePlayer.position === 3 ? '三位' : '四位'}
                          </span>
                          <span className="font-medium text-gray-800">{history.game?.gameType}</span>
                          <span className="text-sm text-gray-500">
                            得分: {history.gamePlayer.finalScore?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <PointsDisplay 
                            pointsChange={history.pointHistory?.originalPointsChange || history.gamePlayer.originalRankPointsChange || 0}
                            originalPointsChange={history.gamePlayer.originalRankPointsChange}
                            showSign={true}
                          />
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {history.game?.createdAt ? new Date(history.game.createdAt).toLocaleDateString() : '未知日期'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {history.pointHistory && (
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                          <span>
                            段位: {history.pointHistory.rankBefore === history.pointHistory.rankAfter ? (
                              <span className="text-gray-700">{history.pointHistory.rankBefore}</span>
                            ) : (
                              <span className="text-blue-600">
                                {history.pointHistory.rankBefore} → {history.pointHistory.rankAfter}
                              </span>
                            )}
                          </span>
                          <span>对手: {history.opponents?.join(', ') || '未知'}</span>
                        </div>
                      )}

                      {/* 成就展示 */}
                      {history.pointHistory?.achievements && history.pointHistory.achievements.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <AchievementBadgeList
                            achievements={history.pointHistory.achievements}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          )}
        </div>
      </div>
      
      <ScrollToTop />
    </div>
  );
};

export default Profile;