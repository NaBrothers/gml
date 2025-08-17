/**
 * local server entry file, for local development
 */
import app from './app.js';
import { initializeTestData } from './utils/database.js';

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
    await initializeTestData();
    if (!isProduction) {
      console.log('✅ 测试数据初始化完成');
      console.log('📋 可用测试账号:');
      console.log('   - admin / admin123 (管理员)');
      console.log('   - player1 / player123 (测试玩家)');
      console.log('   - player2 / player123 (测试玩家)');
      console.log('   - player3 / player123 (测试玩家)');
    } else {
      console.log('✅ 生产环境数据库初始化完成');
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
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
