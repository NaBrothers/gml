import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { Trophy, Users, GamepadIcon, TrendingUp, LogIn, UserPlus, Crown, Sword, Menu, X, Star, Zap, User, Settings, LogOut, ChevronDown } from 'lucide-react';

// 段位配置数据（与后端保持一致）
import { rankConfigs, getRankNameByLevel } from '../utils/rankConfigs';



const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { rankings, fetchRankings } = useUserStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRankings(10); // 获取前10名
  }, [fetchRankings]);

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // 处理用户菜单选项点击
  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
      setIsUserMenuOpen(false);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsUserMenuOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 二次元主背景 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20traditional%20Japanese%20temple%20with%20cherry%20blossoms%2C%20mahjong%20tiles%20floating%2C%20vibrant%20colors%2C%20sunset%20sky%2C%20detailed%20illustration%2C%20kawaii%20aesthetic%2C%20high%20contrast&image_size=landscape_16_9')`
        }}
      />
      
      {/* 渐变遮罩层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-600/30 to-blue-600/40" />
      
      {/* 动态装饰元素 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-400 rounded-full blur-lg animate-pulse opacity-60" />
        <div className="absolute top-32 right-20 w-12 h-12 bg-pink-400 rounded-full blur-md animate-bounce opacity-50" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-purple-400 rounded-full blur-xl animate-pulse opacity-40" style={{animationDelay: '2s'}} />
        <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-blue-400 rounded-full blur-sm animate-bounce opacity-70" style={{animationDelay: '0.5s'}} />
        <div className="absolute top-1/2 left-1/6 w-6 h-6 bg-orange-400 rounded-full blur-sm animate-pulse opacity-50" style={{animationDelay: '3s'}} />
      </div>
      {/* 右侧二次元风格菜单栏 - 桌面端显示，移动端隐藏 */}
      <div className="hidden md:flex fixed top-0 right-0 h-full w-20 md:w-24 z-50 flex-col">
        {/* 菜单背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/90 via-pink-600/90 to-blue-600/90 backdrop-blur-lg border-l-4 border-yellow-400/50 shadow-2xl" />
        
        {/* 菜单内容 */}
        <div className="relative z-10 flex flex-col h-full py-6">
          {/* Logo区域 */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300">
              <Crown className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="hidden md:block mt-2 text-xs font-bold text-white text-center leading-tight">
              雀魂<br/>记分
            </div>
          </div>
          
          {/* 菜单项 */}
          <div className="flex-1 flex flex-col space-y-4 px-2">
            <Link 
              to="/" 
              className="group flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105"
            >
              <GamepadIcon className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors" />
              <span className="text-xs text-white/80 group-hover:text-white mt-1 font-medium">首页</span>
            </Link>
            
            <Link 
              to="/ranking" 
              className="group flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105"
            >
              <Trophy className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors" />
              <span className="text-xs text-white/80 group-hover:text-white mt-1 font-medium">排行</span>
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/scoring" 
                  className="group flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105"
                >
                  <Sword className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors" />
                  <span className="text-xs text-white/80 group-hover:text-white mt-1 font-medium">记分</span>
                </Link>
                
                <Link 
                  to="/users" 
                  className="group flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105"
                >
                  <Users className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors" />
                  <span className="text-xs text-white/80 group-hover:text-white mt-1 font-medium">用户</span>
                </Link>
              </>
            )}
          </div>
          
          {/* 用户区域 */}
          <div className="mt-auto px-2">
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="group flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-green-400/20 to-blue-400/20 hover:from-green-400/30 hover:to-blue-400/30 border border-green-400/30 hover:border-green-300/50 transition-all duration-300 transform hover:scale-105 w-full"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <span className="text-white text-sm font-bold">
                      {user.nickname.charAt(0)}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-white/90 font-medium text-center truncate">{user.nickname}</span>
                    <ChevronDown className={`w-3 h-3 text-white/70 ml-1 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* 下拉菜单 */}
                {isUserMenuOpen && (
                  <div className="absolute bottom-0 right-full mr-3 w-48 bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-blue-900/95 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl overflow-hidden animate-in slide-in-from-right-2 duration-200">
                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center px-4 py-3 text-white hover:bg-white/10 transition-colors group"
                    >
                      <User className="w-4 h-4 mr-3 text-blue-400 group-hover:text-blue-300" />
                      <span className="text-sm font-medium">比赛记录</span>
                    </button>
                    <button
                      onClick={handleSettingsClick}
                      className="w-full flex items-center px-4 py-3 text-white hover:bg-white/10 transition-colors group"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-300" />
                      <span className="text-sm font-medium">设置</span>
                    </button>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center px-4 py-3 text-white hover:bg-white/10 hover:bg-red-500/20 transition-colors group border-t border-white/10"
                    >
                      <LogOut className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-300" />
                      <span className="text-sm font-medium">登出</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="group flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-400/30 hover:border-pink-300/50 transition-all duration-300 transform hover:scale-105"
              >
                <LogIn className="w-6 h-6 text-white group-hover:text-pink-300 transition-colors" />
                <span className="text-xs text-white/80 group-hover:text-white mt-1 font-medium">登录</span>
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* 移动端汉堡菜单按钮 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg text-white hover:scale-110 transition-all duration-300"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      
      {/* 移动端全屏菜单 */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gradient-to-br from-purple-600/95 via-pink-600/95 to-blue-600/95 backdrop-blur-lg">
          <div className="flex flex-col items-center justify-center h-full space-y-8 px-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-4">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">雀魂记分系统</h2>
            </div>
            
            <div className="space-y-4 w-full max-w-xs">
              <Link 
                to="/" 
                className="flex items-center justify-center space-x-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <GamepadIcon className="w-6 h-6" />
                <span className="text-lg font-medium">首页</span>
              </Link>
              
              <Link 
                to="/ranking" 
                className="flex items-center justify-center space-x-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Trophy className="w-6 h-6" />
                <span className="text-lg font-medium">排行榜</span>
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link 
                    to="/scoring" 
                    className="flex items-center justify-center space-x-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Sword className="w-6 h-6" />
                    <span className="text-lg font-medium">记分</span>
                  </Link>
                  
                  <Link 
                    to="/users" 
                    className="flex items-center justify-center space-x-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-lg font-medium">用户管理</span>
                  </Link>
                </>
              )}
              
              {!isAuthenticated && (
                <Link 
                  to="/login" 
                  className="flex items-center justify-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transition-all duration-300 shadow-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-6 h-6" />
                  <span className="text-lg font-medium">登录</span>
                </Link>
              )}
            </div>
            
            {isAuthenticated && user && (
              <div className="mt-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg mx-auto mb-2">
                  <span className="text-white text-xl font-bold">
                    {user.nickname.charAt(0)}
                  </span>
                </div>
                <span className="text-white text-lg font-medium">{user.nickname}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 主要内容 */}
      <main className="md:pr-24 min-h-screen flex flex-col justify-center items-center relative px-4 md:px-0">
        {/* 中央欢迎区域 */}
        <div className="text-center mb-12 px-4 md:px-8 w-full max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
            <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
              极客雀魂
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg font-medium">
            专业麻将记分 · 段位晋升 · 排行统计
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center w-full">
              <Link
                to="/login"
                className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold text-lg rounded-full hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 shadow-2xl hover:shadow-pink-500/30 transform hover:scale-110"
              >
                <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                登录
              </Link>
              <Link
                to="/ranking"
                className="group inline-flex items-center px-10 py-5 bg-white/10 backdrop-blur-md text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-xl transform hover:scale-110"
              >
                <Star className="w-6 h-6 mr-3 group-hover:animate-spin" />
                查看排行
              </Link>
            </div>
          )}
        </div>

        {/* 排行榜小模块 */}
        {rankings.length > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 md:bottom-8 md:left-8 md:transform-none md:translate-x-0 w-64 md:w-80 max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-12rem)] z-30">
            <div className="bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-blue-900/95 backdrop-blur-lg rounded-2xl p-4 md:p-6 border-2 border-yellow-400/30 shadow-2xl">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-bold text-white flex items-center">
                  <Trophy className="w-4 h-4 md:w-5 md:h-5 mr-2 text-yellow-400" />
                  排行榜
                </h3>
                <Link
                  to="/ranking"
                  className="text-yellow-400 hover:text-yellow-300 text-xs md:text-sm font-medium transition-colors flex items-center"
                >
                  更多 →
                </Link>
              </div>
              
              <div className="space-y-2">
                {rankings.slice(0, 3).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200">
                    <div className="flex items-center space-x-2">
                      <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                        'bg-gradient-to-r from-amber-500 to-amber-600'
                      }`}>
                        {index === 0 ? '👑' : index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-white text-xs md:text-sm font-medium truncate">{user.nickname}</div>
                        <div className="text-yellow-300/80 text-xs truncate">{getRankNameByLevel(user.rankLevel)}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white text-xs md:text-sm font-bold">{user.totalPoints}</div>
                      <div className="text-white/60 text-xs">{user.gamesPlayed}局</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;