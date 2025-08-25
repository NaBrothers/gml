// API服务层
import { UserWithStats, UserRegistration, UserLogin, AuthResponse, ApiResponse, GameResult, GameDetail, RankingUser, PointHistory } from '../../shared/types';

const API_BASE_URL = '/api';

// API请求工具函数
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // 从localStorage获取token
    this.token = localStorage.getItem('auth_token');
  }

  // 设置认证token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // 清除token
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // 通用请求方法
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 添加认证头
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API请求失败:', error);
      return {
        success: false,
        error: '网络请求失败'
      };
    }
  }

  // GET请求
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST请求
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 文件上传请求
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {};

    // 添加认证头
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('文件上传失败:', error);
      return {
        success: false,
        error: '文件上传失败'
      };
    }
  }
}

// 创建API客户端实例
const apiClient = new ApiClient(API_BASE_URL);

// 认证相关API
export const authApi = {
  // 用户注册
  register: (userData: UserRegistration): Promise<AuthResponse> => {
    return apiClient.post('/auth/register', userData);
  },

  // 用户登录
  login: async (credentials: UserLogin): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    // 确保返回正确的AuthResponse格式
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          token: response.data.token!,
          user: response.data.user!
        },
        token: response.data.token,
        user: response.data.user,
        message: response.message
      };
    } else {
      return {
        success: false,
        error: response.error || response.message || '登录失败'
      };
    }
  },

  // 用户登出
  logout: () => {
    apiClient.clearToken();
  },

  // 设置token
  setToken: (token: string) => {
    apiClient.setToken(token);
  },

  // 清除token
  clearToken: () => {
    apiClient.clearToken();
  },

  // 验证token
  verify: (): Promise<AuthResponse> => {
    return apiClient.get('/auth/verify');
  }
};

// 用户相关API
export const usersApi = {
  // 获取所有用户
  getAll: (): Promise<ApiResponse<{ users: UserWithStats[], total: number }>> => {
    return apiClient.get('/users');
  },

  // 根据ID获取用户
  getById: (id: string): Promise<ApiResponse<UserWithStats>> => {
    return apiClient.get(`/users/${id}`);
  },

  // 更新用户信息
  update: (id: string, data: { nickname?: string, avatar?: string }): Promise<ApiResponse<UserWithStats>> => {
    return apiClient.put(`/users/${id}`, data);
  },

  // 删除用户
  delete: (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/users/${id}`);
  },

  // 获取用户历史记录
  getUserHistory: (id: string, params?: { limit?: number, offset?: number }): Promise<ApiResponse<any>> => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    const queryString = query.toString();
    return apiClient.get(`/users/${id}/history${queryString ? '?' + queryString : ''}`);
  },

  // 更新用户资料（支持文件上传）
  updateProfile: (formData: FormData): Promise<ApiResponse<UserWithStats>> => {
    return apiClient.uploadFile('/users/profile', formData);
  }
};

// 用户API别名
export const userApi = usersApi;

// 对局相关API
export const gamesApi = {
  // 创建对局
  create: (gameData: GameResult): Promise<ApiResponse<{
    game: any;
    players: any[];
    pointChanges: any[];
  }>> => {
    return apiClient.post('/games', gameData);
  },

  // 获取所有对局
  getAll: (): Promise<ApiResponse<GameDetail[]>> => {
    return apiClient.get('/games');
  },

  // 根据ID获取对局详情
  getById: (id: string): Promise<ApiResponse<GameDetail>> => {
    return apiClient.get(`/games/${id}`);
  }
};

// 排行榜相关API
export const rankingApi = {
  // 获取排行榜
  getRanking: (params?: { limit?: number, offset?: number, majorRank?: string }): Promise<ApiResponse<{
    rankings: RankingUser[];
    total: number;
  }>> => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.majorRank) query.append('majorRank', params.majorRank);
    const queryString = query.toString();
    return apiClient.get(`/ranking${queryString ? '?' + queryString : ''}`);
  },

  // 获取用户积分历史
  getUserHistory: (userId: string, limit?: number): Promise<ApiResponse<{
    user: UserWithStats;
    history: PointHistory[];
  }>> => {
    const query = limit ? `?limit=${limit}` : '';
    return apiClient.get(`/ranking/history/${userId}${query}`);
  },

  // 获取统计数据
  getStats: (): Promise<ApiResponse<{
    rankStats: { [key: string]: number };
    totalUsers: number;
    totalGames: number;
    averagePoints: number;
  }>> => {
    return apiClient.get('/ranking/stats');
  }
};

// 健康检查API
export const healthApi = {
  check: (): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.get('/health');
  }
};

export default apiClient;