import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { Trophy, LogIn, Star, Zap, X, Sparkles, ChevronRight } from 'lucide-react';

// 段位配置数据（与后端保持一致）
import { getRankNameByLevel } from '../utils/rankConfigs';
import QuoteBubble from '../components/QuoteBubble';
import SakuraRain from '../components/SakuraRain';
import MouseTrail from '../components/MouseTrail';
import FloatingMahjong from '../components/FloatingMahjong';

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
    <div className="h-screen relative overflow-hidden bg-black">
      {/* 鼠标轨迹特效 */}
      <MouseTrail />

      {/* 二次元主背景 - 增加了视差感和亮度微调 */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-subtle-zoom"
        style={{
          backgroundImage: `url('https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20traditional%20Japanese%20temple%20with%20cherry%20blossoms%2C%20mahjong%20tiles%20floating%2C%20vibrant%20colors%2C%20sunset%20sky%2C%20detailed%20illustration%2C%20kawaii%20aesthetic%2C%20high%20contrast&image_size=landscape_16_9')`,
          filter: 'brightness(0.85) contrast(1.1)'
        }}
      />
      
      {/* 樱花雨效果 */}
      <SakuraRain petalCount={15} />
      
      {/* 浮动麻将牌特效 */}
      <FloatingMahjong count={12} />
      
      {/* 渐变遮罩层 - 增强了深度感 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-900/40 to-black/60" />
      
      {/* 优化的动态装饰元素 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute top-32 right-20 w-24 h-24 bg-pink-400/20 rounded-full blur-[60px] animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-purple-400/20 rounded-full blur-[100px] animate-pulse" style={{animationDelay: '2s'}} />
        
        {/* 动态光点 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.2
              }}
            />
          ))}
        </div>
      </div>

      {/* 主要内容 */}
      <main className="h-screen flex relative px-4 md:px-0 container mx-auto overflow-hidden">
        {/* 左侧内容区域 */}
        <div className="flex-1 flex flex-col justify-center items-start relative z-10 py-10">
          <div className="animate-fade-in-up w-full">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 text-sm font-medium mb-4 animate-float-gentle">
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              全新版本：极客雀魂 2.0 现已上线
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tighter">
              <span className="block text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">超越极限的</span>
              <span className="bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-glow">
                麻将竞技
              </span>
            </h1>
            
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl leading-relaxed font-light drop-shadow-md border-l-4 border-yellow-400 pl-6">
              体验最纯粹的二次元竞技，在这里，每一场对局都是一场智慧与运气的华丽博弈。
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mb-8">
                <Link
                  to="/login"
                  className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white font-black text-lg rounded-2xl transition-all duration-500 overflow-hidden shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)] hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-out -skew-x-12 -translate-x-full" />
                  <Zap className="w-6 h-6 mr-3 fill-current group-hover:rotate-12 transition-transform" />
                  开启征途
                </Link>
                <Link
                  to="/ranking"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-white/5 backdrop-blur-xl text-white font-bold text-lg rounded-2xl border-2 border-white/20 hover:bg-white/10 hover:border-white/40 transition-all duration-300 shadow-xl hover:scale-105 active:scale-95"
                >
                  荣耀排行
                  <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            ) : (
              <Link
                to="/profile"
                className="group inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all duration-300 mb-8"
              >
                回到个人主页
                <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            )}

            {/* 排行榜模块 - 移动到此处以避免遮挡 */}
            {rankings.length > 0 && (
              <div className="hidden md:block animate-fade-in-up w-full max-w-md" style={{animationDelay: '0.5s'}}>
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group hover:bg-white/10 transition-all duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-white flex items-center tracking-tight">
                      <Trophy className="w-5 h-5 mr-3 text-yellow-400 animate-bounce-slow" />
                      巅峰殿堂
                    </h3>
                    <Link
                      to="/ranking"
                      className="text-white/40 hover:text-white text-xs font-medium transition-all group-hover:translate-x-1"
                    >
                      全部排行 →
                    </Link>
                  </div>
                  
                  <div className="space-y-2">
                    {rankings.slice(0, 3).map((user, index) => (
                      <div key={user.id} className="group/item flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.4)]' :
                            index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-500 text-gray-900' :
                            'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-100'
                          }`}>
                            {index === 0 ? '👑' : index + 1}
                          </div>
                          <div className="min-w-0">
                            <div className="text-white text-sm font-bold truncate group-hover/item:text-yellow-400 transition-colors">{user.nickname}</div>
                            <div className="text-white/40 text-[10px] font-medium tracking-wider uppercase leading-none">{getRankNameByLevel(user.rankLevel)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-black text-sm">{user.totalPoints}</div>
                          <div className="text-white/20 text-[8px] font-bold uppercase tracking-tighter">{user.gamesPlayed} GAMES</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧人像区域 */}
        <div className="hidden lg:flex flex-1 justify-center items-end relative z-20">
          <div className="relative animate-fade-in-right">
            {/* 人像背景光效 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-t from-pink-500/20 via-purple-500/10 to-transparent rounded-full blur-[100px] animate-pulse" />
            
            {/* 科技感装饰圈 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border-2 border-white/10 rounded-full animate-spin-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-dashed border-white/5 rounded-full animate-reverse-spin" />
            
            {/* 主要人像 */}
            <div className="relative group">
              <img 
                src="/image.png" 
                alt="Game Character" 
                className="relative z-10 max-h-[85vh] w-auto object-contain drop-shadow-[0_0_50px_rgba(255,182,193,0.3)] transform transition-all duration-700 scale-x-[-1] group-hover:scale-x-[-1.02] group-hover:translate-y--2"
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
            
            {/* 底部台座光效 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-t from-pink-500/40 to-transparent rounded-[100%] blur-3xl" />
          </div>
        </div>

        {/* 移动端人像 */}
        <div className="lg:hidden absolute bottom-0 right-0 transform z-10 animate-fade-in">
          <div className="relative">
            <img 
              src="/image.png" 
              alt="Game Character" 
              className="max-h-80 w-auto object-contain opacity-80"
              onClick={handleClick}
            />
            <QuoteBubble 
              isVisible={showQuote}
              onClose={handleQuoteClose}
              position="top"
              className="animate-bounce"
              showCloseButton={false}
              autoHide={true}
            />
          </div>
        </div>
      </main>

      {/* 移动端排行榜浮动按钮 */}
      {rankings.length > 0 && (
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileRankingOpen(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl shadow-2xl z-30 flex items-center justify-center transform active:scale-90 transition-all duration-300"
          >
            <Trophy className="w-8 h-8 text-white" />
          </button>

          {/* 移动端排行榜弹窗 */}
          {isMobileRankingOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
                onClick={() => setIsMobileRankingOpen(false)}
              />
              <div className="fixed inset-x-4 bottom-10 z-50 flex items-end justify-center">
                <div 
                  className="bg-zinc-900 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl w-full max-w-sm"
                  style={{ animation: 'genieEmerge 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-white">巅峰排行</h3>
                    <button onClick={() => setIsMobileRankingOpen(false)} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {rankings.slice(0, 5).map((user, index) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-black text-white/20 w-8">{index + 1}</span>
                          <div>
                            <div className="text-white font-bold">{user.nickname}</div>
                            <div className="text-yellow-500 text-xs font-bold">{getRankNameByLevel(user.rankLevel)}</div>
                          </div>
                        </div>
                        <div className="text-white font-black text-lg">{user.totalPoints}</div>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/ranking"
                    onClick={() => setIsMobileRankingOpen(false)}
                    className="block w-full text-center py-5 bg-white text-black font-black rounded-2xl active:scale-95 transition-transform"
                  >
                    查看完整排行榜
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 增强动画样式 */}
      <style>{`
        @keyframes subtle-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1.05); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(239,68,68,0.3)); }
          50% { filter: drop-shadow(0 0 25px rgba(239,68,68,0.6)); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(60px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes reverse-spin {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes genieEmerge {
          0% { transform: scale(0.8) translateY(100px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-subtle-zoom { animation: subtle-zoom 20s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in-right { animation: fade-in-right 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-reverse-spin { animation: reverse-spin 20s linear infinite; }
        .animate-float-gentle { animation: float-gentle 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: float-gentle 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Home;