# Vercel 未自动更新 - 解决方案

## 问题
GitHub 有更新，但 Vercel 没有自动部署。

## 可能的原因
1. Vercel 的 GitHub webhook 未正确配置
2. Vercel 项目未连接到正确的 GitHub 仓库
3. GitHub webhook 被禁用或失效

## 解决方案

### 方法1：在 Vercel Dashboard 手动触发部署（最快）

1. 访问 https://vercel.com/dashboard
2. 找到项目 `clash-of-schemes-ztnm`
3. 进入 "Deployments" 标签
4. 点击 "Redeploy" 按钮
5. 选择最新的提交 `2f94f95` 或点击 "Use existing Build Cache"
6. 点击 "Redeploy"

### 方法2：检查并重新连接 GitHub 仓库

1. 在 Vercel Dashboard 中，进入项目 Settings
2. 点击 "Git" 标签
3. 检查 "Connected Git Repository" 是否正确
4. 如果不对，点击 "Disconnect" 然后重新连接
5. 确保连接到：`chenty-UDEL/Clash-of-Schemes`
6. 确保分支是 `main`

### 方法3：检查 GitHub Webhook

1. 在 GitHub 仓库中，进入 Settings → Webhooks
2. 查找 Vercel 的 webhook
3. 检查是否正常（绿色勾号）
4. 如果失效，在 Vercel 中重新连接仓库

### 方法4：使用 Vercel CLI 手动部署

```bash
# 1. 安装 Vercel CLI（如果还没有）
npm install -g vercel

# 2. 登录
vercel login

# 3. 在项目目录中链接项目
cd quan-mou-jue-zhan-full
vercel link

# 4. 部署到生产环境
vercel --prod
```

## 当前状态

- **最新提交**: `2f94f95` - `chore: 自动更新 - 2025/12/25 13:07:37`
- **已推送到**: `https://github.com/chenty-UDEL/Clash-of-Schemes`
- **Vercel 应该检测到**: 如果 webhook 正常，应该会自动部署

## 验证

部署完成后，检查：
- Vercel Dashboard 显示新的部署
- 部署的 commit 是 `2f94f95`
- 网站可以正常访问

