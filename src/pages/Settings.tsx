import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Shield, Palette, Camera, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import { toast } from 'sonner';
import Avatar from '../components/Avatar';

const Settings: React.FC = () => {
  const { user } = useAuthStore();
  const { updateProfile } = useUserStore();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      if (user.avatar) {
        // 调试信息：输出用户avatar字段的值
        console.log('用户avatar字段值:', user.avatar);
        // 直接使用文件名，让Avatar组件处理URL拼接
        setAvatarPreview(user.avatar);
      } else {
        console.log('用户没有avatar字段或为空');
        setAvatarPreview(null);
      }
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('头像文件大小不能超过5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('请选择图片文件');
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    if (nickname.trim().length < 2) {
      toast.error('昵称至少需要2个字符');
      return;
    }
    
    if (nickname.trim().length > 20) {
      toast.error('昵称不能超过20个字符');
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateProfile(nickname.trim(), avatar);
      if (success) {
        toast.success('个人资料更新成功');
        
        // 清除文件对象
        setAvatar(null);
        
        // 等待一小段时间确保authStore已更新
        setTimeout(() => {
          const { user: updatedUser } = useAuthStore.getState();
          if (updatedUser) {
            // 更新昵称
            setNickname(updatedUser.nickname || '');
            // 更新头像预览 - 直接使用文件名
            if (updatedUser.avatar) {
              setAvatarPreview(updatedUser.avatar);
            } else {
              setAvatarPreview(null);
            }
          }
        }, 100);
      } else {
        toast.error('更新失败，请重试');
      }
    } catch (error) {
      console.error('更新个人资料失败:', error);
      toast.error('更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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
          <div className="hidden lg:flex items-center justify-center max-w-4xl mx-auto">
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
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 overflow-hidden">
                    <div 
                      className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                      onClick={() => setShowProfileEdit(!showProfileEdit)}
                    >
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
                        <div className="text-sm text-blue-600 font-medium">
                          {showProfileEdit ? '收起' : '展开'}
                        </div>
                      </div>
                    </div>
                    
                    {showProfileEdit && (
                      <div className="px-4 pb-4 border-t border-blue-200/30">
                        <div className="pt-4 space-y-6">
                          {/* 头像上传区域 */}
                          <div className="flex flex-col items-center space-y-4">
                            <div className="relative group">
                              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                                {avatarPreview ? (
                                  // 如果是文件预览（base64），直接使用img标签
                                  avatarPreview.startsWith('data:') ? (
                                    <img 
                                      src={avatarPreview} 
                                      alt="头像预览" 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    // 如果是服务器文件名，使用Avatar组件
                                    <Avatar 
                                      src={avatarPreview}
                                      alt="头像预览"
                                      size="xl"
                                    />
                                  )
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                    <User className="w-12 h-12 text-white" />
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={triggerFileInput}
                                className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                            <p className="text-xs text-gray-500 text-center">
                              点击相机图标上传头像<br />
                              支持 JPG、PNG 格式，最大 5MB
                            </p>
                          </div>

                          {/* 昵称编辑 */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              昵称
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="请输入昵称"
                                maxLength={20}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              />
                              <div className="absolute right-3 top-3 text-xs text-gray-400">
                                {nickname.length}/20
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              昵称长度为 2-20 个字符
                            </p>
                          </div>

                          {/* 保存按钮 */}
                          <div className="flex justify-end pt-4">
                            <button
                              onClick={handleSaveProfile}
                              disabled={isLoading || !nickname.trim() || nickname.trim().length < 2}
                              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                            >
                              {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                              <span>{isLoading ? '保存中...' : '保存'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
                  <p className="text-sm text-gray-500 mb-2">极客雀魂</p>
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