/**
 * local server entry file, for local development
 */
import app from './app.js';
import { initializeDatabase } from './utils/database.js';
import { ConfigManager } from './utils/configManager.js';
import { GachaConfigManager } from './utils/gachaConfigManager.js';
import { initializeGachaData } from './utils/gachaDatabase.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // 初始化配置管理器
    await ConfigManager.initialize();
    
    // 初始化抽卡配置管理器
    await GachaConfigManager.initialize();
    
    // 初始化数据库
    await initializeDatabase();
    
    // 初始化抽卡系统数据
    await initializeGachaData();
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

const server = app.listen(PORT, async () => {
  console.log(`Server ready on port ${PORT}`);
  
  // 初始化数据库
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`🚀 启动模式: ${isProduction ? '生产环境' : '开发环境'}`);
  
  await startServer();
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
