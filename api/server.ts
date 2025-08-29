/**
 * local server entry file, for local development
 */
import app from './app.js';
import { initializeDatabase } from './utils/database.js';
import { ConfigManager } from './utils/configManager.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
  console.log(`Server ready on port ${PORT}`);
  
  // 初始化数据库
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`🚀 启动模式: ${isProduction ? '生产环境' : '开发环境'}`);
  
  try {
    // 初始化配置管理器
    await ConfigManager.initialize();
    
    // 初始化数据库
    await initializeDatabase();
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  }
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
