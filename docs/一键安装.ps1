# 一键安装开发环境工具脚本
# 使用方法：以管理员身份运行 PowerShell，然后执行：.\docs\一键安装.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "开发环境一键安装脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员身份运行
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  建议以管理员身份运行此脚本" -ForegroundColor Yellow
    Write-Host "   右键 PowerShell -> 以管理员身份运行" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "是否继续？(Y/N)"
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit
    }
}

# 检查 winget
Write-Host "检查 winget..." -ForegroundColor Yellow
try {
    $wingetVersion = winget --version
    Write-Host "✅ winget 可用: $wingetVersion" -ForegroundColor Green
    $useWinget = $true
} catch {
    Write-Host "❌ winget 不可用" -ForegroundColor Red
    Write-Host "   请更新 Windows 11 或使用其他方式安装" -ForegroundColor Yellow
    $useWinget = $false
}

Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
    $needNode = $false
} catch {
    Write-Host "❌ Node.js 未安装" -ForegroundColor Red
    $needNode = $true
}

Write-Host ""

# 检查 npm
Write-Host "检查 npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm 已安装: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm 未安装" -ForegroundColor Red
    Write-Host "   npm 通常随 Node.js 一起安装" -ForegroundColor Yellow
}

Write-Host ""

# 检查 Git
Write-Host "检查 Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ Git 已安装: $gitVersion" -ForegroundColor Green
    $needGit = $false
} catch {
    Write-Host "❌ Git 未安装" -ForegroundColor Red
    $needGit = $true
}

Write-Host ""

# 如果需要安装
if ($needNode -or $needGit) {
    if (-not $useWinget) {
        Write-Host "⚠️  winget 不可用，无法自动安装" -ForegroundColor Yellow
        Write-Host "   请手动安装：" -ForegroundColor Yellow
        if ($needNode) {
            Write-Host "   - Node.js: https://nodejs.org/" -ForegroundColor Yellow
        }
        if ($needGit) {
            Write-Host "   - Git: https://git-scm.com/download/win" -ForegroundColor Yellow
        }
        exit
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "开始安装..." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 安装 Node.js
    if ($needNode) {
        Write-Host "正在安装 Node.js LTS..." -ForegroundColor Yellow
        try {
            winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
            Write-Host "✅ Node.js 安装完成" -ForegroundColor Green
        } catch {
            Write-Host "❌ Node.js 安装失败" -ForegroundColor Red
            Write-Host "   请手动从 https://nodejs.org/ 下载安装" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    # 安装 Git
    if ($needGit) {
        Write-Host "正在安装 Git..." -ForegroundColor Yellow
        try {
            winget install Git.Git --accept-package-agreements --accept-source-agreements
            Write-Host "✅ Git 安装完成" -ForegroundColor Green
        } catch {
            Write-Host "❌ Git 安装失败" -ForegroundColor Red
            Write-Host "   请手动从 https://git-scm.com/download/win 下载安装" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "安装完成！" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  重要：请重新打开 PowerShell，然后运行以下命令验证：" -ForegroundColor Yellow
    Write-Host "   node --version" -ForegroundColor White
    Write-Host "   npm --version" -ForegroundColor White
    Write-Host "   git --version" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "✅ 所有工具已安装！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "可以开始开发了：" -ForegroundColor Green
    Write-Host "   1. cd C:\权谋决战\quan-mou-jue-zhan-full" -ForegroundColor White
    Write-Host "   2. npm install" -ForegroundColor White
    Write-Host "   3. npm run dev" -ForegroundColor White
    Write-Host ""
}


