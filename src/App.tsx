import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Scoring from "@/pages/Scoring";
import Ranking from "@/pages/Ranking";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/scoring" element={<Scoring />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<div className="text-center text-xl p-8">用户管理页面 - 开发中</div>} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/game/:id" element={<div className="text-center text-xl p-8">对局详情页面 - 开发中</div>} />
      </Routes>
    </Router>
  );
}
