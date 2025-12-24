# Windows 开发环境快速检查脚本
# 在 PowerShell 中运行：.\docs\快速安装脚本.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Windows 开发环境检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 未安装" -ForegroundColor Red
    Write-Host "   请访问 https://nodejs.org/ 下载安装" -ForegroundColor Yellow
}

Write-Host ""

# 检查 npm
Write-Host "检查 npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 已安装: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm 未安装" -ForegroundColor Red
    Write-Host "   通常随 Node.js 一起安装" -ForegroundColor Yellow
}

Write-Host ""

# 检查 Git
Write-Host "检查 Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git 已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git 未安装" -ForegroundColor Red
    Write-Host "   请访问 https://git-scm.com/download/win 下载安装" -ForegroundColor Yellow
}

Write-Host ""

# 检查项目目录
Write-Host "检查项目目录..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "✅ 项目目录正确" -ForegroundColor Green
    
    # 检查 node_modules
    if (Test-Path "node_modules") {
        Write-Host "✅ 依赖已安装" -ForegroundColor Green
    } else {
        Write-Host "⚠️  依赖未安装，运行: npm install" -ForegroundColor Yellow
    }
    
    # 检查 .env.local
    if (Test-Path ".env.local") {
        Write-Host "✅ 环境变量文件存在" -ForegroundColor Green
    } else {
        Write-Host "⚠️  环境变量文件不存在，请复制 env.template 为 .env.local" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ 未在项目目录中" -ForegroundColor Red
    Write-Host "   请进入项目目录后运行此脚本" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "检查完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果所有检查都通过，可以运行: npm run dev" -ForegroundColor Green


