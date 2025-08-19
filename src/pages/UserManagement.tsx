import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldCheck, Crown, Edit2, Save, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { User, UserRole } from '../../shared/types';
import { useNavigate } from 'react-router-dom';

// 段位配置数据（与后端保持一致）
import { rankConfigs, getRankNameByLevel } from '../utils/rankConfigs';

interface UserWithActions {
  id: string;
  username: string;
  passwordHash: string;
  nickname: string;
  avatar?: string;
  role: UserRole;
  totalPoints: number;
  rankLevel: number;
  rankPoints: number;
  gamesPlayed: number;
  createdAt: string;
  updatedAt: string;
  isEditing?: boolean;
}



const UserManagement: React.FC = () => {
  const { isAuthenticated, user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('获取用户列表失败');
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users.map((user: User) => ({ ...user, isEditing: false })));
      } else {
        toast.error(data.error || '获取用户列表失败');
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新用户权限
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          role: newRole,
          operatorId: currentUser?.id 
        })
      });
      
      if (!response.ok) {
        throw new Error('更新用户权限失败');
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole, isEditing: false } : user
        ));
        toast.success('用户权限更新成功');
      } else {
        toast.error(data.error || '更新用户权限失败');
      }
    } catch (error) {
      console.error('更新用户权限失败:', error);
      toast.error('更新用户权限失败');
    }
  };

  // 开始编辑
  const startEditing = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isEditing: true }
        : { ...user, isEditing: false }
    ));
  };

  // 取消编辑
  const cancelEditing = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isEditing: false }
        : user
    ));
  };

  // 获取权限图标
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case UserRole.ADMIN:
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      case UserRole.USER:
        return <Shield className="w-4 h-4 text-gray-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  // 获取权限显示名称
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return '超级管理员';
      case UserRole.ADMIN:
        return '管理员';
      case UserRole.USER:
        return '用户';
      default:
        return '用户';
    }
  };

  // 获取权限颜色
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'bg-yellow-100 text-yellow-800';
      case UserRole.ADMIN:
        return 'bg-blue-100 text-blue-800';
      case UserRole.USER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 检查是否可以编辑权限
  const canEditRole = (targetUser: User) => {
    if (!currentUser) return false;
    
    // 只有超级管理员可以修改权限
    if (currentUser.role !== UserRole.SUPER_ADMIN) return false;
    
    // 不能修改自己的权限
    if (currentUser.id === targetUser.id) return false;
    
    return true;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }
    
    if (!currentUser) {
      return;
    }
    
    // 权限检查：只有管理员及以上可以访问用户管理页面
    if (currentUser.role === UserRole.USER) {
      toast.error('权限不足，无法访问用户管理页面');
      return;
    }
    
    fetchUsers();
  }, [isAuthenticated, currentUser]);

  // 权限检查
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">请先登录</div>
        </div>
      </div>
    );
  }

  if (currentUser.role === UserRole.USER) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <div className="text-lg text-gray-600 mb-2">权限不足</div>
          <div className="text-sm text-gray-500">您没有访问用户管理页面的权限</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">错误</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          {/* 返回按钮 */}
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200 active:bg-gray-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium hidden sm:inline">返回首页</span>
              <span className="text-sm font-medium sm:hidden">返回</span>
            </button>
          </div>
          
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">用户管理</h1>
          </div>
          <p className="text-gray-600 mt-2">管理系统用户和权限设置</p>
        </div>

        {/* 桌面端表格布局 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  权限等级
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  积分信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                {currentUser?.role === UserRole.SUPER_ADMIN && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.nickname.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.nickname}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isEditing ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => {
                            const newRole = e.target.value as UserRole;
                            setUsers(prev => prev.map(u => 
                              u.id === user.id ? { ...u, role: newRole } : u
                            ));
                          }}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value={UserRole.USER}>用户</option>
                          <option value={UserRole.ADMIN}>管理员</option>
                          <option value={UserRole.SUPER_ADMIN}>超级管理员</option>
                        </select>
                        <button
                          onClick={() => updateUserRole(user.id, user.role)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => cancelEditing(user.id)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      总积分: {user.totalPoints}
                    </div>
                    <div className="text-sm text-gray-500">
                      段位: {getRankNameByLevel(user.rankLevel)}
                    </div>
                    <div className="text-sm text-gray-500">
                      对局: {user.gamesPlayed}场
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </td>
                  {currentUser?.role === UserRole.SUPER_ADMIN && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {canEditRole(user) && !user.isEditing && (
                        <button
                          onClick={() => startEditing(user.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          编辑权限
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 移动端卡片布局 */}
        <div className="md:hidden space-y-4 p-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              {/* 用户基本信息 */}
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {user.nickname.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="text-base font-medium text-gray-900">
                    {user.nickname}
                  </div>
                  <div className="text-sm text-gray-500">
                    @{user.username}
                  </div>
                </div>
              </div>

              {/* 权限信息 */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">权限等级</div>
                {user.isEditing ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={user.role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setUsers(prev => prev.map(u => 
                          u.id === user.id ? { ...u, role: newRole } : u
                        ));
                      }}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value={UserRole.USER}>用户</option>
                      <option value={UserRole.ADMIN}>管理员</option>
                      <option value={UserRole.SUPER_ADMIN}>超级管理员</option>
                    </select>
                    <button
                      onClick={() => updateUserRole(user.id, user.role)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => cancelEditing(user.id)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {getRoleIcon(user.role)}
                    <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                )}
              </div>

              {/* 积分信息 */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1">积分信息</div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-gray-900 font-medium">{user.totalPoints}</div>
                    <div className="text-gray-500 text-xs">总积分</div>
                  </div>
                  <div>
                    <div className="text-gray-900 font-medium">{getRankNameByLevel(user.rankLevel)}</div>
                    <div className="text-gray-500 text-xs">段位</div>
                  </div>
                  <div>
                    <div className="text-gray-900 font-medium">{user.gamesPlayed}</div>
                    <div className="text-gray-500 text-xs">对局</div>
                  </div>
                </div>
              </div>

              {/* 注册时间和操作 */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-500">注册时间</div>
                  <div className="text-sm text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                {currentUser?.role === UserRole.SUPER_ADMIN && canEditRole(user) && !user.isEditing && (
                  <button
                    onClick={() => startEditing(user.id)}
                    className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md flex items-center text-sm"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    编辑权限
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无用户数据</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;