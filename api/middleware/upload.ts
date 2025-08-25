import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { Request } from 'express';

// 确保上传目录存在
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars');

export async function ensureUploadDirectory(): Promise<void> {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// 配置multer存储
const storage = multer.memoryStorage();

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 只允许图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'));
  }
};

// 创建multer实例
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB限制
  },
}).single('avatar');

// 保存头像文件到磁盘
export async function saveAvatarFile(buffer: Buffer, originalName: string, userId: string): Promise<string> {
  await ensureUploadDirectory();
  
  // 生成唯一文件名
  const ext = path.extname(originalName);
  const filename = `${userId}_${Date.now()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  
  // 保存文件
  await fs.writeFile(filepath, buffer);
  
  // 返回相对路径用于存储在数据库中
  return `/uploads/avatars/${filename}`;
}

// 删除旧头像文件
export async function deleteAvatarFile(avatarPath: string): Promise<void> {
  if (!avatarPath || avatarPath === '') return;
  
  try {
    const fullPath = path.join(process.cwd(), avatarPath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.warn('删除旧头像文件失败:', error);
  }
}