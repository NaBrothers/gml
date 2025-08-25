import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, Trophy, TrendingUp, ArrowLeft, Clock, Users, Target } from 'lucide-react';
import { userApi } from '../lib/api';
import PointsChart from '../components/PointsChart';
import PositionChart from '../components/PositionChart';
import Avatar from '../components/Avatar';
import { useAuthStore } from '../stores/authStore';
import { rankConfigs, getRankNameByLevel } from '../utils/rankConfigs';

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
      rankBefore: string;
      rankAfter: string;
      gameDate: string;
      opponents: string[];
    };
    opponents: string[];
  }>;
  stats: {
    totalGames: number;
    wins: number;
    averagePosition: string;
    totalPointsChange: number;
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
          <button
            onClick={() => navigate('/ranking')}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            返回排行榜
          </button>
        </div>
      </div>
    );
  }

  const { user, histories, stats } = userHistory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 移动端布局 */}
            <div className="flex items-center justify-between w-full md:hidden">
              <button
                onClick={() => navigate('/ranking')}
                className="flex items-center text-pink-600 hover:text-pink-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                返回
              </button>
              <h1 className="text-lg font-bold text-gray-800">用户详情</h1>
              <div className="w-16"></div>
            </div>
            
            {/* 桌面端布局 */}
            <div className="hidden md:flex items-center justify-between w-full">
              <button
                onClick={() => navigate('/ranking')}
                className="flex items-center text-pink-600 hover:text-pink-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回排行榜
              </button>
              <h1 className="text-2xl font-bold text-gray-800">用户详情</h1>
              <div className="w-32"></div>
            </div>
          </div>
        </div>
      </nav>

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
                <p className={`text-lg sm:text-2xl font-bold ${
                  stats.totalPointsChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.totalPointsChange >= 0 ? '+' : ''}{stats.totalPointsChange}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
          </div>
        </div>

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
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPositionColor(history.gamePlayer.position || 0)}`}>
                          {getPositionText(history.gamePlayer.position || 0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {history.gamePlayer.finalScore?.toLocaleString() || '0'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {(history.gamePlayer.rankPointsChange || 0) >= 0 ? '+' : ''}{history.gamePlayer.rankPointsChange || 0} 积分
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-sm text-gray-600">
                          <p className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {history.game?.createdAt ? formatDate(history.game.createdAt) : '未知时间'}
                          </p>
                          <p className="flex items-center mt-1">
                            <Users className="w-4 h-4 mr-1" />
                            {history.opponents?.join(', ') || '无对手信息'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* 移动端详细信息 */}
                    <div className="block sm:hidden mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">最终得分:</span>
                          <span className="ml-2 font-medium">{history.gamePlayer.finalScore?.toLocaleString() || '0'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">积分变化:</span>
                          <span className={`ml-2 font-medium ${
                            (history.gamePlayer.rankPointsChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(history.gamePlayer.rankPointsChange || 0) >= 0 ? '+' : ''}{history.gamePlayer.rankPointsChange || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;