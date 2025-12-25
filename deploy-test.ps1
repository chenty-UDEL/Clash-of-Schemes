# 测试模式部署脚本
# 使用方法: .\deploy-test.ps1

Write-Host "🚀 开始部署测试模式更新..." -ForegroundColor Green

# 检查是否在正确的目录
if (-not (Test-Path "package.json")) {
    Write-Host "❌ 错误: 请在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查 Git 是否初始化
if (-not (Test-Path ".git")) {
    Write-Host "📦 初始化 Git 仓库..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# 检查是否有未提交的更改
$status = git status --porcelain
if ($status) {
    Write-Host "📝 发现未提交的更改，正在添加..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 提交更改..." -ForegroundColor Yellow
    git commit -m "feat: 添加测试模式功能

- 添加测试模式页面 (/test)
- 实现AI自动行动和投票功能
- 添加测试模式API端点
- 完善国际化支持
- 配置自动部署流程"
    
    Write-Host "✅ 代码已提交" -ForegroundColor Green
} else {
    Write-Host "ℹ️  没有未提交的更改" -ForegroundColor Cyan
}

# 检查远程仓库
$remote = git remote get-url origin 2>$null
if ($remote) {
    Write-Host "📤 推送到 GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 代码已推送到 GitHub，Vercel 将自动部署" -ForegroundColor Green
        Write-Host "🔗 请访问 Vercel Dashboard 查看部署状态" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 推送失败，请检查 Git 配置" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  未配置远程仓库" -ForegroundColor Yellow
    Write-Host "请先配置 GitHub 远程仓库:" -ForegroundColor Cyan
    Write-Host "  git remote add origin <你的仓库URL>" -ForegroundColor Cyan
    Write-Host "  git push -u origin main" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "或者使用 Vercel CLI 手动部署:" -ForegroundColor Cyan
    Write-Host "  npm run deploy" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📚 更多信息请查看 DEPLOY_NOW.md" -ForegroundColor Cyan

