# Vercel 自动部署检查清单

## ✅ 已确认正常
- Git 仓库已连接：`chenty-UDEL/Clash-of-Schemes` ✅
- 连接时间：1天前 ✅

## ⚠️ 需要检查的设置

### 1. Production Branch 设置
在 Vercel Dashboard → Settings → Git 中检查：
- **Production Branch** 应该设置为：`main`
- 如果设置为其他分支（如 `master`），需要改为 `main`

### 2. 自动部署是否启用
在 Vercel Dashboard → Settings → Git 中检查：
- 应该有一个选项 "Automatic deployments from Git"
- 确保这个选项是 **Enabled**

### 3. 部署保护设置
在 Vercel Dashboard → Settings → Deployment Protection 中检查：
- 如果启用了 "Require approval for production deployments"
- 需要手动批准部署，或者禁用它

### 4. 检查最新的部署
在 Vercel Dashboard → Deployments 中：
- 查看最新的部署时间
- 如果最新部署是旧的 commit（如 `c9b4194`），说明自动部署确实没有工作

## 🔍 诊断步骤

### 步骤1：检查 Production Branch
1. 进入 Vercel Dashboard → 项目 Settings → Git
2. 查看 "Production Branch" 设置
3. 如果不是 `main`，改为 `main` 并保存

### 步骤2：检查部署历史
1. 进入 Vercel Dashboard → Deployments
2. 查看最新的部署
3. 检查部署的 commit 是否为：`8bde43f` 或 `6fad5f5`
4. 如果还是旧的 commit（如 `c9b4194`），说明自动部署确实没有触发

### 步骤3：检查 GitHub Webhook
1. 访问：https://github.com/chenty-UDEL/Clash-of-Schemes/settings/hooks
2. 查找 Vercel 的 webhook
3. 检查最近的事件（Recent Deliveries）
4. 查看是否有错误

### 步骤4：手动触发测试
1. 在 Vercel Dashboard → Deployments
2. 点击最新的部署
3. 查看是否有 "Redeploy" 或 "..." 菜单
4. 如果有，手动触发一次部署，看看是否能成功

## 🛠️ 可能的解决方案

### 方案1：重新连接 Git 仓库
即使显示已连接，有时重新连接可以修复问题：
1. 在 Settings → Git 中点击 "Disconnect"
2. 然后重新连接 `chenty-UDEL/Clash-of-Schemes`
3. 确保选择 `main` 分支

### 方案2：检查 Vercel GitHub App 权限
1. 访问 GitHub Settings → Applications → Authorized OAuth Apps
2. 查找 Vercel
3. 检查权限是否完整
4. 如果权限不足，重新授权

### 方案3：使用 Vercel CLI 手动部署
如果自动部署一直不工作，可以配置 Vercel CLI：
```bash
npm install -g vercel
vercel login
vercel link
vercel --prod
```

## 📊 当前状态
- **最新提交**: `8bde43f` - `chore: 自动更新 - 2025/12/25 13:15:06`
- **GitHub 仓库**: 已连接 ✅
- **自动部署**: 需要检查 Production Branch 设置

