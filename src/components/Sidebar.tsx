import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Trophy, Users, GamepadIcon, Crown, Sword, LogIn, User, Settings, LogOut, ChevronDown, History, Menu, X, Shield } from 'lucide-react';
import Avatar from './Avatar';
import { UserRole } from '../../shared/types';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 检查是否在主页
  const isHomePage = location.pathname === '/';

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
      setIsMobileMenuOpen(false); // 关闭移动端菜单
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false); // 关闭移动端菜单
  };

  const handleLogoutClick = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false); // 关闭移动端菜单
  };

  return (
    <>
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
              极客<br/>雀魂
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
                  to="/match-history" 
                  className="group flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105"
                >
                  <History className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors" />
                  <span className="text-xs text-white/80 group-hover:text-white mt-1 font-medium">记录</span>
                </Link>

                 {/* 管理菜单 - 仅管理员和超级管理员可见 */}
                {user && (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                  <Link 
                    to="/admin" 
                    className="group flex flex-col items-center p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 transform hover:scale-105"
                  >
                    <Shield className="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors" />
                    <span className="text-xs text-white/80 group-hover:text-white mt-1 font-medium">管理</span>
                  </Link>
                )}
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
                  <Avatar
                    src={user.avatar}
                    alt={user.nickname}
                    size="md"
                    className="shadow-lg group-hover:shadow-xl transition-shadow"
                  />
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
                      <span className="text-sm font-medium">我的主页</span>
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
      
      {/* 移动端汉堡菜单按钮 - 只在主页显示 */}
      {isHomePage && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-4 right-4 z-50 p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full shadow-lg text-white hover:scale-110 transition-all duration-300"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}
      
      {/* 移动端全屏菜单 */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gradient-to-br from-purple-600/95 via-pink-600/95 to-blue-600/95 backdrop-blur-lg">
          <div className="flex flex-col items-center justify-center h-full px-4 py-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-3">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">极客雀魂</h2>
            </div>
            
            {/* 九宫格菜单 */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
              {/* 第一行 */}
              <Link 
                to="/" 
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 aspect-square"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <GamepadIcon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium text-center">首页</span>
              </Link>
              
              <Link 
                to="/ranking" 
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 aspect-square"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Trophy className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium text-center">排行榜</span>
              </Link>
              
              <Link 
                to="/match-history" 
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 aspect-square"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <History className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium text-center">记录</span>
              </Link>
              
              {/* 第二行 */}
              {isAuthenticated && (
                <>
                  <Link 
                    to="/scoring" 
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 aspect-square"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Sword className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium text-center">记分</span>
                  </Link>
                  
                  <button
                    onClick={handleSettingsClick}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 aspect-square"
                  >
                    <Settings className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium text-center">设置</span>
                  </button>

                  {/* 管理菜单 - 仅管理员和超级管理员可见 */}
                  {user && (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                    <Link 
                      to="/admin" 
                      className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300 aspect-square"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium text-center">管理</span>
                    </Link>
                  )}
                </>
              )}
            </div>
            
            {/* 用户信息区域 */}
            <div className="w-full max-w-sm">
              {isAuthenticated && user ? (
                <div className="bg-white/10 rounded-2xl p-4 mb-4 border border-white/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar
                      src={user.avatar}
                      alt={user.nickname}
                      size="lg"
                      className="shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{user.nickname}</h3>
                      <p className="text-white/70 text-sm">欢迎回来！</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      我的主页
                    </button>
                    <button
                      onClick={handleLogoutClick}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      登出
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="block w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-2xl text-center font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  登录账户
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;