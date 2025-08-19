import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, Trophy, TrendingUp, ArrowLeft, Clock, Users, Target } from 'lucide-react';
import { userApi } from '../lib/api';
import PointsChart from '../components/PointsChart';
import PositionChart from '../components/PositionChart';

// 段位配置数据（与后端保持一致）
const rankConfigs = [
  { id: 1, rankName: '雀之气一段', rankOrder: 1 },
  { id: 2, rankName: '雀之气二段', rankOrder: 2 },
  { id: 3, rankName: '雀之气三段', rankOrder: 3 },
  { id: 4, rankName: '雀之气四段', rankOrder: 4 },
  { id: 5, rankName: '雀之气五段', rankOrder: 5 },
  { id: 6, rankName: '雀之气六段', rankOrder: 6 },
  { id: 7, rankName: '雀之气七段', rankOrder: 7 },
  { id: 8, rankName: '雀之气八段', rankOrder: 8 },
  { id: 9, rankName: '雀之气九段', rankOrder: 9 },
  { id: 10, rankName: '一星雀者', rankOrder: 10 },
  { id: 11, rankName: '二星雀者', rankOrder: 11 },
  { id: 12, rankName: '三星雀者', rankOrder: 12 },
  { id: 13, rankName: '四星雀者', rankOrder: 13 },
  { id: 14, rankName: '五星雀者', rankOrder: 14 },
  { id: 15, rankName: '六星雀者', rankOrder: 15 },
  { id: 16, rankName: '七星雀者', rankOrder: 16 },
  { id: 17, rankName: '八星雀者', rankOrder: 17 },
  { id: 18, rankName: '九星雀者', rankOrder: 18 },
];

// 根据rankLevel获取段位名称
const getRankNameByLevel = (rankLevel: number | string): string => {
  const level = typeof rankLevel === 'string' ? parseInt(rankLevel, 10) : rankLevel;
  const rankConfig = rankConfigs.find(config => config.rankOrder === level);
  return rankConfig ? rankConfig.rankName : '雀之气一段';
};

interface UserHistory {
  user: {
    id: string;
    username: string;
    nickname: string;
    avatar: string;
    totalPoints: number;
    rankLevel: string;
    gamesPlayed: number;
  };
  histories: Array<{
    game: {
      id: string;
      gameType: string;
      createdAt: string;
      status: string;
    };
    gamePlayer: {
      id: string;
      gameId: string;
      userId: string;
      finalScore: number;
      rawPoints: number;
      umaPoints: number;
      rankPointsChange: number;
      position: number;
    };
    allPlayers: Array<{
      id: string;
      gameId: string;
      userId: string;
      finalScore: number;
      position: number;
      user?: {
        id: string;
        nickname: string;
        username: string;
      };
    }>;
    pointHistory: {
      id: string;
      userId: string;
      gameId: string;
      pointsBefore: number;
      pointsAfter: number;
      pointsChange: number;
      rankBefore: string;
      rankAfter: string;
      createdAt: string;
    };
    opponents: string[];
  }>;
  stats: {
    totalGames: number;
    wins: number;
    averagePosition: string;
    totalPointsChange: number;
    currentPoints: number;
    currentRank: string;
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
                className="text-gray-600 hover:text-gray-800 transition-colors p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-800 flex items-center absolute left-1/2 transform -translate-x-1/2">
                <User className="w-5 h-5 mr-2 text-pink-500" />
                个人历史
              </h1>
              <div className="w-9"></div>
            </div>
            
            {/* 桌面端布局 */}
            <div className="hidden md:flex items-center justify-between w-full">
              <button
                onClick={() => navigate('/ranking')}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回排行榜
              </button>
              <h1 className="text-xl font-bold text-gray-800 flex items-center">
                <User className="w-5 h-5 mr-2 text-pink-500" />
                个人历史
              </h1>
              <div></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 用户信息卡片 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20 shadow-lg mb-8">
            {/* 移动端布局 */}
            <div className="block sm:hidden">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user.nickname.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">{user.nickname}</h2>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex flex-col items-center">
                      <Trophy className="w-4 h-4 mb-1 text-yellow-500" />
                      <span className="text-gray-600">{getRankNameByLevel(user.rankLevel)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Target className="w-4 h-4 mb-1 text-blue-500" />
                      <span className="text-gray-600">{user.totalPoints.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">积分</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Users className="w-4 h-4 mb-1 text-green-500" />
                      <span className="text-gray-600">{user.gamesPlayed}</span>
                      <span className="text-xs text-gray-500">局对局</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 桌面端布局 */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-blue-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.nickname.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.nickname}</h2>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span className="flex items-center">
                      <Trophy className="w-4 h-4 mr-1" />
                      {getRankNameByLevel(user.rankLevel)}
                    </span>
                    <span className="flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      {user.totalPoints.toLocaleString()} 积分
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {user.gamesPlayed} 局对局
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">总对局数</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalGames}</p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
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

          {/* 历史比赛记录 */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                历史比赛记录
                <span className="text-sm font-normal text-gray-500 ml-2">({histories.length} 局)</span>
              </h3>
            </div>

            {histories.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                暂无比赛记录
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {histories.map((history, index) => (
                  <div key={history.game.id} className="p-4 sm:p-6 hover:bg-white/50 transition-colors">
                    {/* 移动端布局 */}
                    <div className="block sm:hidden">
                      <div className="flex items-start space-x-3 mb-3">
                        {/* 排名标识 - 移动端较小 */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                          getPositionColor(history.gamePlayer.position)
                        }`}>
                          {getPositionText(history.gamePlayer.position)}
                        </div>
                        
                        {/* 对局信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-800 text-sm">{history.game.gameType}</span>
                          </div>
                          <div className="text-xs text-gray-600 flex items-center mb-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(history.game.createdAt)}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            对手: {history.opponents.join(', ')}
                          </div>
                        </div>
                      </div>
                      
                      {/* 分数和积分变化 - 移动端单独一行 */}
                      <div className="flex items-center justify-between bg-gray-50/50 rounded-lg p-3">
                        <div>
                          <div className="text-base font-bold text-gray-800">
                            {history.gamePlayer.finalScore.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">最终分数</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            history.pointHistory.pointsChange >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {history.pointHistory.pointsChange >= 0 ? '+' : ''}{history.pointHistory.pointsChange} 积分
                          </div>
                          {history.pointHistory.rankBefore !== history.pointHistory.rankAfter && (
                            <div className="text-xs text-blue-600 mt-1">
                              {history.pointHistory.rankBefore} → {history.pointHistory.rankAfter}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 桌面端布局 */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* 排名标识 */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${
                          getPositionColor(history.gamePlayer.position)
                        }`}>
                          {getPositionText(history.gamePlayer.position)}
                        </div>
                        
                        {/* 对局信息 */}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-800">{history.game.gameType}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatDate(history.game.createdAt)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            对手: {history.opponents.join(', ')}
                          </div>
                        </div>
                      </div>
                      
                      {/* 分数和积分变化 */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">
                          {history.gamePlayer.finalScore.toLocaleString()}
                        </div>
                        <div className={`text-sm font-medium ${
                          history.pointHistory.pointsChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {history.pointHistory.pointsChange >= 0 ? '+' : ''}{history.pointHistory.pointsChange} 积分
                        </div>
                        {history.pointHistory.rankBefore !== history.pointHistory.rankAfter && (
                          <div className="text-xs text-blue-600 mt-1">
                            {history.pointHistory.rankBefore} → {history.pointHistory.rankAfter}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;