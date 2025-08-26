import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Menu, X, Crown, GamepadIcon, Trophy, History, Sword, Settings, Shield, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { UserRole } from '../../shared/types';
import Avatar from './Avatar';

interface HeaderBarProps {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ 
  title, 
  showBackButton = true, 
  onBackClick 
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1); // 返回上一页
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 处理用户菜单选项点击
  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setIsMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* 标题栏 */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          {/* 左侧：返回按钮 */}
          <div className="flex items-center">
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
                aria-label="返回"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* 中间：标题 */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
          </div>

          {/* 右侧：汉堡菜单按钮（仅移动端显示） */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="flex flex-col items-center justify-center w-8 h-8 space-y-1 transition-colors"
              aria-label="菜单"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <>
                  <div className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all"></div>
                  <div className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all"></div>
                  <div className="w-5 h-0.5 bg-gray-700 dark:bg-gray-300 transition-all"></div>
                </>
              )}
            </button>
          </div>

          {/* 桌面端占位，保持布局平衡 */}
          <div className="hidden md:block w-9"></div>
        </div>
      </div>

      {/* 移动端菜单覆盖层 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-gradient-to-br from-purple-600/95 via-pink-600/95 to-blue-600/95 backdrop-blur-lg">
          {/* 右上角关闭按钮 */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
            aria-label="关闭菜单"
          >
            <X className="w-6 h-6" />
          </button>

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

export default HeaderBar;