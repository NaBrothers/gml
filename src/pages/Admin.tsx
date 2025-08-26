import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Users, Settings, Bell, Shield, ArrowLeft, Database, BarChart3 } from 'lucide-react';
import { UserRole } from '../../shared/types';
import HeaderBar from '../components/HeaderBar';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // 权限检查
  if (!isAuthenticated || !user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-lg text-gray-600 mb-2">权限不足</div>
          <div className="text-sm text-gray-500">您没有访问管理页面的权限</div>
        </div>
      </div>
    );
  }

  const adminMenus = [
    {
      id: 'users',
      title: '用户管理',
      description: '管理系统用户、权限分配',
      icon: Users,
      path: '/users',
      color: 'from-blue-500 to-blue-600',
      available: true
    },
    {
      id: 'config',
      title: '配置中心',
      description: '系统配置、参数设置、段位管理',
      icon: Settings,
      path: '/admin/config',
      color: 'from-green-500 to-green-600',
      available: true
    },
    {
      id: 'notifications',
      title: '通知中心',
      description: '系统通知、消息推送',
      icon: Bell,
      path: '/admin/notifications',
      color: 'from-yellow-500 to-yellow-600',
      available: false
    },
    {
      id: 'database',
      title: '数据管理',
      description: '数据备份、导入导出',
      icon: Database,
      path: '/admin/database',
      color: 'from-purple-500 to-purple-600',
      available: false
    },
    {
      id: 'analytics',
      title: '数据分析',
      description: '用户行为、系统统计',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'from-red-500 to-red-600',
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <HeaderBar title="系统管理" />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* 欢迎区域 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 border border-white/20 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">欢迎，{user.nickname}</h2>
              <p className="text-gray-600">
                您的权限级别：
                <span className="ml-2 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  {user.role === UserRole.SUPER_ADMIN ? '超级管理员' : '管理员'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 管理菜单网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenus.map((menu) => {
            const IconComponent = menu.icon;
            
            if (menu.available) {
              return (
                <Link
                  key={menu.id}
                  to={menu.path}
                  className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${menu.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {menu.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {menu.description}
                    </p>
                  </div>
                </Link>
              );
            } else {
              return (
                <div
                  key={menu.id}
                  className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-lg opacity-60 cursor-not-allowed"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${menu.color} rounded-2xl flex items-center justify-center mb-4 opacity-50`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {menu.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-2">
                      {menu.description}
                    </p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      即将推出
                    </span>
                  </div>
                </div>
              );
            }
          })}
        </div>

      </div>
    </div>
  );
};

export default Admin;