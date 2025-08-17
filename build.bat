@echo off
setlocal enabledelayedexpansion

echo Starting Mahjong Scoring System...
echo ==============================

REM Kill processes on ports 3001 and 5173
echo Cleaning up ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do (
    if not "%%a"=="" if not "%%a"=="0" (
        echo Killing process %%a on port 3001
        taskkill /PID %%a /F >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    if not "%%a"=="" if not "%%a"=="0" (
        echo Killing process %%a on port 5173
        taskkill /PID %%a /F >nul 2>&1
    )
)

REM Kill node processes
echo Cleaning up node processes...
taskkill /IM node.exe /F >nul 2>&1
taskkill /IM nodemon.exe /F >nul 2>&1

REM Check if npm exists
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm not found. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo Error: package.json not found. Please run in project root.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting services...
echo Frontend: http://localhost:5173/
echo Backend: http://localhost:3001/api/
echo Press Ctrl+C to stop
echo.

REM Start the project
npm run dev

if %errorlevel% neq 0 (
    echo.
    echo Service failed to start
    pause
)