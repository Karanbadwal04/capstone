@echo off
REM Quick Deployment Script for Frontend-Backend Integration (Windows)

echo.
echo 🚀 Frontend Deployment Script
echo ==============================
echo.

REM Check if git is initialized
if not exist .git (
    echo ❌ Git not initialized
    echo Please run: git init ^&^& git remote add origin ^<your-repo^>
    pause
    exit /b 1
)

REM Check for changes
for /f %%A in ('git status --porcelain') do set CHANGES=%%A

if "%CHANGES%"=="" (
    echo ✅ No changes to commit
    echo.
    pause
    exit /b 0
)

echo 📦 Changes detected:
git status --short
echo.

set /p CONFIRM="Do you want to commit and push? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ Deployment cancelled
    pause
    exit /b 1
)

echo.
echo 📝 Adding files...
git add .

echo 💾 Committing changes...
git commit -m "Configure frontend-backend connection with Railway backend

- Created centralized API configuration
- Updated all 15 files to use API_URL from config
- Removed hardcoded localhost:5000 references
- Added environment variable support
- Ready for Vercel deployment"

echo 🚀 Pushing to GitHub...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Code pushed successfully!
    echo.
    echo ⏭️  Next Steps:
    echo 1. Go to Vercel Dashboard ^→ Project Settings ^→ Environment Variables
    echo 2. Add: VITE_API_URL=https://capstone-production-7059.up.railway.app
    echo 3. Vercel will auto-deploy
    echo 4. Wait 2-3 minutes for build to complete
    echo 5. Visit https://microjob.vercel.app/ to test
) else (
    echo ❌ Push failed. Check your git configuration
)

echo.
pause
