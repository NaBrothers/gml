import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-50 to-purple-100 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 头部导航 */}
        <header className="p-4 md:p-6">
          {/* 移动端导航 */}
          <div className="flex lg:hidden items-center justify-between max-w-4xl mx-auto">
            <Link
              to="/"
              className="text-gray-700 hover:text-pink-600 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-6 h-6 text-pink-600" />
              <h1 className="text-xl font-bold text-gray-800">设置</h1>
            </div>
            <div className="w-5"></div>
          </div>
          
          {/* 桌面端导航 */}
          <div className="hidden lg:flex items-center justify-between max-w-4xl mx-auto">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">返回首页</span>
            </Link>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="w-6 h-6 text-pink-600" />
              <h1 className="text-xl font-bold text-gray-800">设置</h1>
            </div>
          </div>
        </header>

        {/* 主要内容 */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 overflow-hidden">
              {/* 设置项目 */}
              <div className="p-6 md:p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <SettingsIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">系统设置</h2>
                  <p className="text-gray-600">个性化您的雀魂记分体验</p>
                </div>

                {/* 设置选项 */}
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">个人资料</h3>
                          <p className="text-sm text-gray-600">管理您的个人信息和头像</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">即将推出</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">通知设置</h3>
                          <p className="text-sm text-gray-600">管理推送通知和提醒</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">即将推出</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200/50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">主题设置</h3>
                          <p className="text-sm text-gray-600">选择您喜欢的界面主题</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">即将推出</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200/50 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">隐私与安全</h3>
                          <p className="text-sm text-gray-600">管理账户安全和隐私设置</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">即将推出</div>
                    </div>
                  </div>
                </div>

                {/* 底部信息 */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-2">雀魂记分系统</p>
                  <p className="text-xs text-gray-400">更多功能正在开发中，敬请期待...</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;