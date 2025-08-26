import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { Trophy, LogIn, Star, Zap, X } from 'lucide-react';

import QuoteBubble from '../components/QuoteBubble';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { rankings, fetchRankings } = useUserStore();
  const [isMobileRankingOpen, setIsMobileRankingOpen] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchRankings(10); // 获取前10名
    
    // 检测是否为移动设备
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 1024;
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [fetchRankings]);

  // 处理人物交互
  const handleMouseEnter = () => {
    if (!isMobile && !showQuote) {
      setShowQuote(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && showQuote) {
      setShowQuote(false);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      setShowQuote(true);
    } else {
      // 桌面端也允许点击
      setShowQuote(!showQuote);
    }
  };

  const handleQuoteClose = () => {
    setShowQuote(false);
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

      {/* 主要内容 */}
      <main className="min-h-screen flex relative px-4 md:px-0">
        {/* 左侧内容区域 */}
        <div className="flex-1 flex flex-col justify-center items-start relative z-10 max-w-2xl mx-auto md:mx-0 md:ml-8 lg:ml-16">
          {/* 中央欢迎区域 */}
          <div className="text-left mb-12 px-4 md:px-8 w-full">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-2xl">
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">极客雀魂</span>
            </h1>
            
            <p className="text-white/90 text-lg md:text-xl mb-8 drop-shadow-lg max-w-lg">
              体验最纯粹的麻将竞技
            </p>
            
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-2/3">
                <Link
                  to="/login"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold text-lg rounded-full hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 shadow-2xl hover:shadow-pink-500/30 transform hover:scale-105"
                >
                  <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                  登录
                </Link>
                <Link
                  to="/ranking"
                  className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-xl transform hover:scale-105"
                >
                  <Star className="w-6 h-6 mr-3 group-hover:animate-spin" />
                  查看排行
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 右侧人像区域 */}
        <div className="hidden lg:flex flex-1 justify-center items-end relative z-20 max-w-3xl">
          <div className="relative">
            {/* 人像背景光效 */}
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl scale-150 animate-pulse" />
            
            {/* 主要人像 */}
            <div className="relative">
              <img 
                src="/image.png" 
                alt="Game Character" 
                className="relative z-10 max-h-[80vh] w-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500 cursor-pointer"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 60px rgba(255, 182, 193, 0.4))'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              />
              
              {/* 气泡对话框 */}
              <QuoteBubble 
                isVisible={showQuote}
                onClose={handleQuoteClose}
                position="top"
                className="animate-bounce"
                showCloseButton={isMobile}
                autoHide={isMobile}
              />
            </div>
            
            {/* 底部光效 */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-32 bg-gradient-to-t from-white/20 to-transparent rounded-full blur-2xl" />
          </div>
        </div>

        {/* 移动端人像（小尺寸背景装饰） */}
        <div className="lg:hidden absolute bottom-0 right-4 transform opacity-100 z-0">
          <div className="relative">
            <img 
              src="/image.png" 
              alt="Game Character" 
              className="max-h-96 w-auto object-contain cursor-pointer transform hover:scale-105 transition-transform duration-300"
              onClick={handleClick}
            />
            
            {/* 移动端气泡对话框 */}
            <QuoteBubble 
              isVisible={showQuote}
              onClose={handleQuoteClose}
              position="top"
              className="animate-bounce"
              showCloseButton={true}
              autoHide={true}
            />
          </div>
        </div>
      </main>

      {/* 桌面端排行榜小模块 */}
      {rankings.length > 0 && (
        <div className="hidden md:block fixed bottom-8 left-24 w-80 max-w-[calc(100vw-4rem)] z-30">
          <div className="bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-blue-900/95 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-400/30 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                排行榜
              </h3>
              <Link
                to="/ranking"
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors flex items-center"
              >
                更多 →
              </Link>
            </div>
            
            <div className="space-y-2">
              {rankings.slice(0, 3).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-200">
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                      'bg-gradient-to-r from-amber-500 to-amber-600'
                    }`}>
                      {index === 0 ? '👑' : index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white text-sm font-medium truncate">{user.nickname}</div>
                      <div className="text-yellow-300/80 text-xs truncate">{getRankNameByLevel(user.rankLevel)}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-white text-sm font-bold">{user.totalPoints}</div>
                    <div className="text-white/60 text-xs">{user.gamesPlayed}局</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 移动端排行榜浮动按钮 */}
      {rankings.length > 0 && (
        <div className="md:hidden">
          {/* 浮动按钮 */}
          <button
            onClick={() => setIsMobileRankingOpen(true)}
            className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-full shadow-2xl border-2 border-yellow-400/50 z-40 flex items-center justify-center transform hover:scale-110 transition-all duration-300"
            style={{
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(147, 51, 234, 0.3)'
            }}
          >
            <Trophy className="w-6 h-6 text-yellow-400 animate-pulse" />
          </button>

          {/* 移动端排行榜弹窗 */}
          {isMobileRankingOpen && (
            <>
              {/* 背景遮罩 */}
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setIsMobileRankingOpen(false)}
              />
              
              {/* 排行榜内容 - 阿拉丁神灯效果 */}
              <div className="fixed inset-0 z-50 flex items-end justify-start p-4">
                <div 
                  className="bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-blue-900/95 backdrop-blur-lg rounded-2xl p-6 border-2 border-yellow-400/30 shadow-2xl w-full max-w-sm transform transition-all duration-700 ease-out"
                  style={{
                    animation: 'genieEmerge 0.7s ease-out forwards',
                    transformOrigin: 'bottom left'
                  }}
                >
                  {/* 关闭按钮 */}
                  <button
                    onClick={() => setIsMobileRankingOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>

                  <div className="flex items-center justify-between mb-4 pr-8">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                      排行榜
                    </h3>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {rankings.slice(0, 5).map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                            index === 2 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                            'bg-gradient-to-r from-slate-500 to-slate-600'
                          }`}>
                            {index === 0 ? '👑' : index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white text-sm font-medium truncate">{user.nickname}</div>
                            <div className="text-yellow-300/80 text-xs truncate">{getRankNameByLevel(user.rankLevel)}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-white text-sm font-bold">{user.totalPoints}</div>
                          <div className="text-white/60 text-xs">{user.gamesPlayed}局</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/ranking"
                    onClick={() => setIsMobileRankingOpen(false)}
                    className="block w-full text-center py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-purple-900 font-bold rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300"
                  >
                    查看完整排行榜
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 阿拉丁神灯动画样式 */}
      <style>{`
        @keyframes genieEmerge {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          30% {
            transform: scale(0.3) rotate(-90deg);
            opacity: 0.5;
          }
          60% {
            transform: scale(0.8) rotate(-20deg);
            opacity: 0.8;
          }
          80% {
            transform: scale(1.1) rotate(5deg);
            opacity: 0.95;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;