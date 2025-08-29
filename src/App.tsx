import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { initializeRankConfigs } from "@/utils/rankConfigs";
import Sidebar from "@/components/Sidebar";
import MouseTrail from "@/components/MouseTrail";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Scoring from "@/pages/Scoring";
import Ranking from "@/pages/Ranking";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import UserManagement from "@/pages/UserManagement";
import MatchHistory from "@/pages/MatchHistory";
import Admin from "@/pages/Admin";
import AdminConfig from "@/pages/AdminConfig";

export default function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    console.log('🚀 App.tsx: 开始初始化应用');
    const initApp = async () => {
      // 并行初始化认证和段位配置
      const [authResult, rankConfigResult] = await Promise.allSettled([
        initializeAuth(),
        initializeRankConfigs()
      ]);
      
      if (authResult.status === 'fulfilled') {
        console.log('✅ App.tsx: 认证初始化完成');
      } else {
        console.error('❌ App.tsx: 认证初始化失败:', authResult.reason);
      }
      
      if (rankConfigResult.status === 'fulfilled') {
        console.log('✅ App.tsx: 段位配置初始化完成');
      } else {
        console.error('❌ App.tsx: 段位配置初始化失败:', rankConfigResult.reason);
      }
    };
    initApp();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="flex min-h-screen">
        {/* 鼠标轨迹效果 - 仅在桌面端显示 */}
        <div className="hidden lg:block">
          <MouseTrail />
        </div>
        
        {/* 全局侧边栏 */}
        <Sidebar />
        
        {/* 主内容区域 - 移动端全屏，桌面端为侧边栏留出空间 */}
        <div className="flex-1 w-full md:pr-20 lg:pr-24 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/scoring" element={<Scoring />} />
            <Route path="/settings" element={<Settings />} />
            {/* 管理相关路由 */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/config" element={<AdminConfig />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/match-history" element={<MatchHistory />} />
          </Routes>
        </div>
        
        {/* 全局通知 */}
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}
