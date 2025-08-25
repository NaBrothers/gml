import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuthStore } from "@/stores/authStore";
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

export default function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    console.log('🚀 App.tsx: 开始初始化认证状态');
    const initAuth = async () => {
      console.log('🔍 App.tsx: 调用initializeAuth');
      await initializeAuth();
      console.log('✅ App.tsx: initializeAuth完成');
    };
    initAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="flex">
        {/* 鼠标轨迹效果 - 仅在桌面端显示 */}
        <div className="hidden lg:block">
          <MouseTrail />
        </div>
        
        {/* 全局侧边栏 */}
        <Sidebar />
        
        {/* 主内容区域 - 为桌面端侧边栏留出空间 */}
        <div className="flex-1 md:pr-20 lg:pr-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/scoring" element={<Scoring />} />
            <Route path="/settings" element={<Settings />} />
            {/* 管理相关路由 */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<UserManagement />} />
            {/* 保持旧路由兼容性 */}
            <Route path="/users" element={<UserManagement />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/match-history" element={<MatchHistory />} />
            <Route path="/game/:id" element={<div className="text-center text-xl p-8">对局详情页面 - 开发中</div>} />
          </Routes>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </Router>
  );
}
