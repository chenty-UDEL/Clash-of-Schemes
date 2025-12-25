# Vercel 部署问题诊断和修复

## 问题现象
- GitHub 有更新，但 Vercel 没有自动部署
- Vercel Dashboard 没有 "Redeploy" 按钮

## 可能的原因

### 1. Vercel 项目未连接到 GitHub 仓库
这是最常见的原因。Vercel 需要正确连接到 GitHub 仓库才能自动部署。

### 2. GitHub Webhook 未正确配置
Vercel 通过 GitHub webhook 接收推送通知，如果 webhook 失效，就不会自动部署。

### 3. 项目设置中的分支配置错误
Vercel 可能配置为监听其他分支，而不是 `main` 分支。

## 解决方案

### 步骤1：检查 Vercel 项目设置

1. 访问 https://vercel.com/dashboard
2. 找到项目 `clash-of-schemes-ztnm`
3. 进入 **Settings** → **Git**
4. 检查以下内容：

#### 检查项：
- [ ] **Connected Git Repository** 是否显示：`chenty-UDEL/Clash-of-Schemes`
- [ ] **Production Branch** 是否为：`main`
- [ ] **GitHub App** 是否已安装并授权

### 步骤2：重新连接 GitHub 仓库（如果需要）

如果连接不正确：

1. 在 **Settings** → **Git** 中
2. 点击 **Disconnect**（如果已连接）
3. 点击 **Connect Git Repository**
4. 选择 **GitHub**
5. 找到并选择 `chenty-UDEL/Clash-of-Schemes`
6. 选择分支：`main`
7. 点击 **Import**

### 步骤3：检查 GitHub Webhook

1. 访问 GitHub 仓库：https://github.com/chenty-UDEL/Clash-of-Schemes
2. 进入 **Settings** → **Webhooks**
3. 查找 Vercel 的 webhook（URL 包含 `vercel.com`）
4. 检查状态：
   - ✅ 绿色勾号 = 正常
   - ❌ 红色叉号 = 失效，需要重新连接

### 步骤4：手动触发部署（临时方案）

如果自动部署不工作，可以：

1. 在 Vercel Dashboard 中，进入 **Deployments**
2. 找到最新的部署（即使显示旧的 commit）
3. 点击部署右侧的 **...** 菜单
4. 选择 **Redeploy**
5. 或者点击部署详情页面的 **Redeploy** 按钮

### 步骤5：验证部署

部署完成后：
- 检查部署状态是否为 "Ready"
- 检查部署的 commit 是否为最新：`6fad5f5`
- 访问网站验证更新是否生效

## 当前状态

- **最新提交**: `6fad5f5` - `chore: 自动更新 - 2025/12/25 13:14:49`
- **GitHub 仓库**: `https://github.com/chenty-UDEL/Clash-of-Schemes`
- **分支**: `main`
- **已删除**: GitHub Actions workflows（避免干扰）

## 如果仍然无法部署

### 方法A：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 在项目目录中链接项目
cd quan-mou-jue-zhan-full
vercel link

# 4. 部署
vercel --prod
```

### 方法B：检查 Vercel 项目名称

确保 Vercel 项目名称与 GitHub 仓库匹配，或者检查是否有多个同名项目。

### 方法C：联系 Vercel 支持

如果以上方法都不行，可能是 Vercel 账户或项目配置的问题，需要联系 Vercel 支持。

## 预防措施

1. **定期检查** Vercel 项目设置中的 Git 连接
2. **监控部署** 确保每次推送后都有新部署
3. **设置通知** 在 Vercel 中设置部署失败通知

