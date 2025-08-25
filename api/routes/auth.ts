import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userDb, getRankByPoints, parseRankInfo } from '../utils/database.js';
import { ApiResponse, UserRegistration, UserLogin, UserWithStats, UserRole } from '../../shared/types.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mahjong-secret-key';

// 用户注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, nickname }: UserRegistration = req.body;

    // 验证输入
    if (!username || !password) {
      const response: ApiResponse = {
        success: false,
        error: '用户名和密码不能为空'
      };
      return res.status(400).json(response);
    }

    if (username.length < 3 || username.length > 20) {
      const response: ApiResponse = {
        success: false,
        error: '用户名长度必须在3-20字符之间'
      };
      return res.status(400).json(response);
    }

    if (password.length < 6) {
      const response: ApiResponse = {
        success: false,
        error: '密码长度不能少于6位'
      };
      return res.status(400).json(response);
    }

    // 检查用户名是否已存在
    const existingUser = await userDb.findByUsername(username);
    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: '用户名已存在'
      };
      return res.status(400).json(response);
    }

    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 创建用户（使用简化的数据结构）
    const user = await userDb.create({
      username,
      passwordHash,
      nickname: nickname || username,
      avatar: '',
      role: UserRole.USER
    });

    // 重新获取用户信息（包含统计数据）
    const userWithStats = await userDb.findById(user.id);

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response: ApiResponse<{ user: UserWithStats; token: string }> = {
      success: true,
      data: {
        user: userWithStats!,
        token
      },
      message: '注册成功'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('用户注册失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '注册失败，请稍后重试'
    };
    res.status(500).json(response);
  }
});

// 用户登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password }: UserLogin = req.body;
    console.log('🔐 登录请求 - 用户名:', username, '密码长度:', password?.length);

    // 验证输入
    if (!username || !password) {
      console.log('❌ 登录失败 - 用户名或密码为空');
      const response: ApiResponse = {
        success: false,
        error: '用户名和密码不能为空'
      };
      return res.status(400).json(response);
    }

    // 查找用户
    const user = await userDb.findByUsername(username);
    console.log('👤 查找用户结果:', user ? `找到用户: ${user.nickname}` : '用户不存在');
    if (user) {
      console.log('🔑 用户密码哈希存在:', !!user.passwordHash);
      console.log('🔑 密码哈希长度:', user.passwordHash?.length || 0);
    }
    
    if (!user) {
      console.log('❌ 登录失败 - 用户不存在');
      const response: ApiResponse = {
        success: false,
        error: '用户名或密码错误'
      };
      return res.status(401).json(response);
    }

    // 验证密码
    console.log('🔍 开始密码验证...');
    const isValidPassword = await bcrypt.compare(password, user.passwordHash || '');
    console.log('✅ 密码验证结果:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ 登录失败 - 密码错误');
      const response: ApiResponse = {
        success: false,
        error: '用户名或密码错误'
      };
      return res.status(401).json(response);
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ 登录成功 - 用户:', user.nickname);
    const response: ApiResponse<{ user: UserWithStats; token: string }> = {
      success: true,
      data: {
        user,
        token
      },
      message: '登录成功'
    };
    res.json(response);
  } catch (error) {
    console.error('用户登录失败:', error);
    const response: ApiResponse = {
      success: false,
      error: '登录失败，请稍后重试'
    };
    res.status(500).json(response);
  }
});

// 验证token并返回用户信息
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: '访问令牌缺失'
      };
      return res.status(401).json(response);
    }

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // 根据token中的用户ID获取最新的用户信息
    const user = await userDb.findById(decoded.userId);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: '用户不存在'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<{ user: UserWithStats; token: string }> = {
      success: true,
      data: {
        user,
        token
      },
      message: 'Token验证成功'
    };
    res.json(response);
  } catch (error) {
    console.error('Token验证失败:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Token无效或已过期'
    };
    res.status(403).json(response);
  }
});

// 验证token中间件
export const authenticateToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: '访问令牌缺失'
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Token无效或已过期'
      });
    }
    (req as any).user = user;
    next();
  });
};

export default router;