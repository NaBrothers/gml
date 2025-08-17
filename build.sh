#!/bin/bash

# 日本麻将记分系统启动脚本
# 自动杀死旧端口进程并启动服务

echo "🚀 启动日本麻将记分系统..."
echo "=============================="

# 检测操作系统
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ "$OS" == "Windows_NT" ]]; then
    IS_WINDOWS=true
else
    IS_WINDOWS=false
fi

# 杀死占用端口的进程函数
kill_port() {
    local port=$1
    echo "🔍 检查端口 $port..."
    
    if [ "$IS_WINDOWS" = true ]; then
        # Windows系统
        local pid=$(netstat -ano | findstr ":$port" | awk '{print $5}' | head -1)
        if [ ! -z "$pid" ] && [ "$pid" != "0" ]; then
            echo "⚠️  发现端口 $port 被进程 $pid 占用，正在终止..."
            taskkill //PID $pid //F 2>/dev/null || echo "   进程可能已经结束"
        else
            echo "✅ 端口 $port 空闲"
        fi
    else
        # Linux/Mac系统
        local pid=$(lsof -ti:$port)
        if [ ! -z "$pid" ]; then
            echo "⚠️  发现端口 $port 被进程 $pid 占用，正在终止..."
            kill -9 $pid 2>/dev/null || echo "   进程可能已经结束"
        else
            echo "✅ 端口 $port 空闲"
        fi
    fi
}

# 杀死可能的Node.js残留进程
cleanup_processes() {
    echo "🧹 清理残留进程..."
    
    if [ "$IS_WINDOWS" = true ]; then
        # Windows: 杀死所有node和nodemon进程
        taskkill //IM node.exe //F 2>/dev/null || true
        taskkill //IM nodemon.exe //F 2>/dev/null || true
    else
        # Linux/Mac: 杀死node和nodemon进程
        pkill -f "node" 2>/dev/null || true
        pkill -f "nodemon" 2>/dev/null || true
        pkill -f "vite" 2>/dev/null || true
    fi
    
    echo "✅ 进程清理完成"
}

# 检查npm是否可用
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo "❌ 错误: npm 未安装或不在PATH中"
        echo "   请先安装 Node.js 和 npm"
        exit 1
    fi
    echo "✅ npm 可用"
}

# 检查package.json是否存在
check_package_json() {
    if [ ! -f "package.json" ]; then
        echo "❌ 错误: 未找到 package.json 文件"
        echo "   请确保在项目根目录下运行此脚本"
        exit 1
    fi
    echo "✅ package.json 存在"
}

# 安装依赖（如果需要）
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo "📦 安装项目依赖..."
        npm install
        if [ $? -ne 0 ]; then
            echo "❌ 依赖安装失败"
            exit 1
        fi
        echo "✅ 依赖安装完成"
    else
        echo "✅ 依赖已存在"
    fi
}

# 主要启动流程
main() {
    echo "🔧 环境检查..."
    check_npm
    check_package_json
    
    echo ""
    echo "🛑 清理旧进程和端口..."
    cleanup_processes
    kill_port 3001  # 后端端口
    kill_port 5173  # 前端端口
    
    echo ""
    install_dependencies
    
    echo ""
    echo "🚀 启动服务..."
    echo "   前端地址: http://localhost:5173/"
    echo "   后端地址: http://localhost:3001/"
    echo "   按 Ctrl+C 停止服务"
    echo ""
    
    # 启动项目
    npm run dev
}

# 信号处理 - 优雅退出
trap 'echo "\n🛑 正在停止服务..."; cleanup_processes; echo "✅ 服务已停止"; exit 0' INT TERM

# 执行主函数
main