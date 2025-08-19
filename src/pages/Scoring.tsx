import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { useGameStore, validateScores, getScoreDifference } from '../stores/gameStore';
import { User } from '../../shared/types';
import { Calculator, Users, Trophy, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
const getRankNameByLevel = (rankLevel: number): string => {
  const rankConfig = rankConfigs.find(config => config.rankOrder === rankLevel);
  return rankConfig ? rankConfig.rankName : '雀之气一段';
};

const Scoring: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { users, fetchUsers } = useUserStore();
  const { selectedPlayers, scores, setSelectedPlayers, setScores, createGame, isLoading, error, resetGameForm } = useGameStore();
  
  const [gameType, setGameType] = useState('半庄');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, navigate, fetchUsers]);

  const handlePlayerSelect = (user: User) => {
    if (selectedPlayers.find(p => p.id === user.id)) {
      // 取消选择
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== user.id));
    } else if (selectedPlayers.length < 4) {
      // 添加选择
      setSelectedPlayers([...selectedPlayers, user]);
    }
  };

  const handleScoreChange = (index: number, value: string) => {
    const newScores = [...scores];
    
    // 允许空字符串和中间输入状态（如"-"、"-1"等）
    if (value === '' || value === '-') {
      newScores[index] = value; // 保持原始值，不转换为0
    } else {
      const numValue = parseInt(value);
      newScores[index] = isNaN(numValue) ? '' : numValue;
    }
    
    setScores(newScores);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPlayers.length !== 4) {
      alert('请选择4名玩家');
      return;
    }
    
    if (!validateScores(numericScores)) {
      alert('四人总分必须为100000点');
      return;
    }

    const gameData = {
      players: selectedPlayers.map(p => p.id),
      scores: numericScores,
      gameType
    };

    const success = await createGame(gameData);
    if (success) {
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        navigate('/');
      }, 3000);
    }
  };

  const handleReset = () => {
    resetGameForm();
    setGameType('半庄');
  };

  // 转换scores为数字进行计算，处理字符串状态
  const numericScores = scores.map(score => {
    if (typeof score === 'string') {
      if (score === '' || score === '-') return 0;
      const num = parseInt(score);
      return isNaN(num) ? 0 : num;
    }
    return score;
  });
  
  const scoreDifference = getScoreDifference(numericScores);
  const isValidTotal = validateScores(numericScores);

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">对局记录成功！</h2>
          <p className="text-gray-600 mb-4">积分已更新，正在返回首页...</p>
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-pink-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 移动端布局 */}
            <div className="flex items-center justify-between w-full md:hidden">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 transition-colors p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-800 absolute left-1/2 transform -translate-x-1/2">对局记分</h1>
              <div className="w-9"></div>
            </div>
            
            {/* 桌面端布局 */}
            <div className="hidden md:flex items-center justify-between w-full">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← 返回首页
              </button>
              <h1 className="text-xl font-bold text-gray-800">对局记分</h1>
              <div></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 对局类型选择 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                对局类型
              </h2>
              <div className="flex space-x-4">
                {['东风', '半庄'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="gameType"
                      value={type}
                      checked={gameType === type}
                      onChange={(e) => setGameType(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 玩家选择 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                选择玩家 ({selectedPlayers.length}/4)
              </h2>
              
              {/* 已选择的玩家 */}
              {selectedPlayers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">已选择的玩家：</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{player.nickname}</span>
                        <button
                          type="button"
                          onClick={() => handlePlayerSelect(player)}
                          className="ml-2 text-pink-600 hover:text-pink-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 用户列表 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {users.map((user) => {
                  const isSelected = selectedPlayers.find(p => p.id === user.id);
                  const canSelect = !isSelected && selectedPlayers.length < 4;
                  
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handlePlayerSelect(user)}
                      disabled={!canSelect && !isSelected}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-pink-100 border-pink-300 text-pink-800'
                          : canSelect
                          ? 'bg-white border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-medium">{user.nickname}</div>
                      <div className="text-sm text-gray-500">
                        {getRankNameByLevel(user.rankLevel)} · {user.totalPoints}分
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 分数输入 */}
            {selectedPlayers.length === 4 && (
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  输入分数
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {selectedPlayers.map((player, index) => (
                    <div key={player.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {player.nickname}
                      </label>
                      <input
                        type="number"
                        value={scores[index] ?? ''}
                        onChange={(e) => handleScoreChange(index, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="输入分数"
                        min="-50000"
                        max="100000"
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* 分数验证 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">总分：</span>
                    <span className={`font-bold ${
                      isValidTotal ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {numericScores.reduce((sum, score) => sum + score, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">差值：</span>
                    <span className={`font-bold ${
                      scoreDifference === 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {scoreDifference > 0 ? '+' : ''}{scoreDifference}
                    </span>
                  </div>
                  {!isValidTotal && (
                    <div className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      四人总分必须为100000点
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                重置
              </button>
              <button
                type="submit"
                disabled={selectedPlayers.length !== 4 || !isValidTotal || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    提交中...
                  </div>
                ) : (
                  '提交对局'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Scoring;