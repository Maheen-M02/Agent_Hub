@echo off
echo ========================================
echo Agent Hub - Windows Setup Script
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found!
echo.

echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo.

echo [3/4] Setting up environment file...
if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo Created .env file from .env.example
        echo IMPORTANT: Please edit .env and add your API keys!
    ) else (
        echo WARNING: .env.example not found!
    )
) else (
    echo .env file already exists
)
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo 1. Edit .env file with your API keys
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo ========================================
echo.
pause
