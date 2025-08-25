// 文件存储工具模块 - 简化版本
import { promises as fs } from 'fs';
import path from 'path';
import { User, GameRecord } from '../../shared/types.js';

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');

// 确保数据目录存在
export async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// 通用文件读取函数
export async function readJsonFile<T>(filePath: string, defaultValue: T[] = []): Promise<T[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 如果文件不存在或读取失败，返回默认值
    console.log(`文件 ${filePath} 不存在或读取失败，使用默认值`);
    return defaultValue as T[];
  }
}

// 通用文件写入函数
export async function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  try {
    await ensureDataDirectory();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`写入文件 ${filePath} 失败:`, error);
    throw error;
  }
}

// 用户数据文件操作
export const userFileStorage = {
  async load(): Promise<User[]> {
    return readJsonFile<User>(USERS_FILE, []);
  },

  async save(users: User[]): Promise<void> {
    await writeJsonFile(USERS_FILE, users);
  }
};

// 对局数据文件操作
export const gameFileStorage = {
  async load(): Promise<GameRecord[]> {
    return readJsonFile<GameRecord>(GAMES_FILE, []);
  },

  async save(games: GameRecord[]): Promise<void> {
    await writeJsonFile(GAMES_FILE, games);
  }
};



// 初始化所有数据文件
export async function initializeDataFiles(): Promise<void> {
  await ensureDataDirectory();
  
  // 检查并创建空的数据文件（如果不存在）
  const files = [
    { path: USERS_FILE, data: [] },
    { path: GAMES_FILE, data: [] }
  ];

  for (const file of files) {
    try {
      await fs.access(file.path);
    } catch {
      await writeJsonFile(file.path, file.data);
      console.log(`创建数据文件: ${file.path}`);
    }
  }
}

// 兼容性导出（为了向后兼容）
export const gamePlayerFileStorage = {
  async load(): Promise<any[]> {
    return [];
  },
  async save(data: any[]): Promise<void> {
    // 不再存储，忽略
  }
};

export const pointHistoryFileStorage = {
  async load(): Promise<any[]> {
    return [];
  },
  async save(data: any[]): Promise<void> {
    // 不再存储，忽略
  }
};