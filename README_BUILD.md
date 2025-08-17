# 日本麻将记分系统 - 启动脚本使用说明

## 快速启动

本项目提供了两个启动脚本，用于一键启动整个系统：

### Windows 用户（推荐）
```bash
# 双击运行或在命令行中执行
build.bat
```

### Linux/Mac 用户
```bash
# 首次使用需要设置执行权限
chmod +x build.sh

# 运行脚本
./build.sh
```

## 脚本功能

启动脚本会自动执行以下操作：

1. **环境检查**
   - 检查 npm 是否已安装
   - 验证 package.json 文件是否存在

2. **清理旧进程**
   - 自动杀死占用 3001 端口的后端进程
   - 自动杀死占用 5173 端口的前端进程
   - 清理可能的 Node.js 残留进程

3. **依赖管理**
   - 如果 node_modules 不存在，自动安装依赖

4. **启动服务**
   - 同时启动前端和后端服务
   - 前端地址：http://localhost:5173/
   - 后端地址：http://localhost:3001/api/

## 手动启动方式

如果不使用启动脚本，也可以手动启动：

```bash
# 安装依赖（首次运行）
npm install

# 同时启动前后端
npm run dev

# 或者分别启动
npm run server:dev  # 启动后端
npm run client:dev  # 启动前端
```

## 常见问题

### 端口被占用
如果遇到端口被占用的问题，启动脚本会自动处理。如需手动处理：

**Windows:**
```cmd
# 查找占用端口的进程
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# 杀死进程（替换 PID 为实际进程ID）
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# 查找并杀死占用端口的进程
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### 权限问题（Linux/Mac）
如果遇到权限问题：
```bash
chmod +x build.sh
```

### npm 命令不存在
请先安装 Node.js：
- 访问 https://nodejs.org/
- 下载并安装最新的 LTS 版本

## 停止服务

在终端中按 `Ctrl + C` 即可停止服务。

## 测试账号

系统启动后，可以使用以下测试账号登录：

- **管理员**: `admin` / `admin123`
- **测试用户1**: `player1` / `player123`
- **测试用户2**: `player2` / `player123`
- **测试用户3**: `player3` / `player123`

---

**注意**: 首次启动可能需要较长时间来安装依赖，请耐心等待。