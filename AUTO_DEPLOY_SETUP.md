# 自动部署设置指南

## 概述

项目已配置自动部署功能，每次推送到 `main` 或 `master` 分支时，会自动构建并部署到 Vercel。

## 部署方式

### 方式1：Vercel自动部署（推荐）

Vercel 会自动检测 GitHub 仓库的推送并自动部署，无需额外配置。

**设置步骤：**
1. 在 Vercel 中连接你的 GitHub 仓库
2. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
3. 完成！每次推送代码到 main 分支会自动部署

### 方式2：GitHub Actions（已配置）

项目已包含 GitHub Actions workflow，可以在 GitHub 上自动部署。

**设置步骤：**

1. **在 GitHub 仓库设置 Secrets：**
   - 进入仓库 Settings → Secrets and variables → Actions
   - 添加以下 Secrets：
     - `VERCEL_TOKEN`: Vercel 访问令牌
     - `VERCEL_ORG_ID`: Vercel 组织 ID
     - `VERCEL_PROJECT_ID`: Vercel 项目 ID
     - `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
     - `SUPABASE_SERVICE_KEY`: Supabase Service Key

2. **获取 Vercel Token：**
   - 访问 https://vercel.com/account/tokens
   - 创建新的 Token
   - 复制 Token 到 GitHub Secrets

3. **获取 Vercel 项目信息：**
   - 在 Vercel 项目设置中找到 Organization ID 和 Project ID
   - 或运行 `vercel link` 命令获取

## 工作流程

### 自动触发条件

- ✅ 推送到 `main` 或 `master` 分支
- ✅ 创建 Pull Request 到 `main` 或 `master` 分支
- ✅ 手动触发（在 GitHub Actions 页面）

### 部署流程

1. **代码检查**
   - 检出代码
   - 安装依赖 (`npm ci`)

2. **质量检查**
   - TypeScript 类型检查 (`npm run type-check`)
   - ESLint 代码检查 (`npm run lint`)

3. **构建**
   - 运行构建命令 (`npm run build`)
   - 使用环境变量进行构建

4. **部署**
   - 部署到 Vercel 生产环境
   - 使用 `--prod` 参数

## 文件说明

### `.github/workflows/auto-deploy.yml`
主要的自动部署 workflow，在推送到 main 分支时触发。

### `.github/workflows/deploy.yml`
备用部署 workflow，支持 PR 和手动触发。

### `vercel.json`
Vercel 配置文件，定义构建和部署设置。

### `.vercelignore`
Vercel 忽略文件列表，排除不需要部署的文件。

## 环境变量配置

### 在 Vercel 中配置：

1. 进入项目设置 → Environment Variables
2. 添加以下变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase Anon Key
   SUPABASE_SERVICE_KEY=你的Supabase Service Key
   ```
3. 选择环境：Production, Preview, Development

### 在 GitHub Secrets 中配置：

用于 GitHub Actions 部署，需要配置相同的环境变量。

## 部署状态检查

### Vercel Dashboard
- 访问 https://vercel.com/dashboard
- 查看部署历史和状态

### GitHub Actions
- 访问仓库的 Actions 标签页
- 查看 workflow 运行状态

## 故障排除

### 部署失败

1. **检查构建日志**
   - Vercel: 项目 → Deployments → 查看日志
   - GitHub Actions: Actions 标签页 → 查看运行详情

2. **常见问题**
   - 环境变量未配置
   - 构建错误（TypeScript/ESLint）
   - 依赖安装失败

3. **手动部署**
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel
   
   # 登录
   vercel login
   
   # 部署
   vercel --prod
   ```

## 最佳实践

1. **分支策略**
   - `main/master`: 生产环境，自动部署
   - `develop`: 开发环境，预览部署
   - `feature/*`: 功能分支，预览部署

2. **提交前检查**
   ```bash
   npm run type-check  # 类型检查
   npm run lint        # 代码检查
   npm run build       # 构建测试
   ```

3. **环境变量管理**
   - 使用 Vercel 环境变量管理
   - 不同环境使用不同配置
   - 敏感信息使用 Secrets

## 快速开始

1. **首次设置（Vercel）**
   ```bash
   # 安装 Vercel CLI
   npm i -g vercel
   
   # 登录并链接项目
   vercel login
   vercel link
   
   # 配置环境变量
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_KEY
   ```

2. **首次设置（GitHub Actions）**
   - 在 GitHub 仓库设置 Secrets
   - 推送代码到 main 分支
   - 检查 Actions 标签页

## 注意事项

- ⚠️ 确保所有环境变量都已正确配置
- ⚠️ 构建失败不会阻止部署（使用 `continue-on-error: true`）
- ⚠️ 生产部署需要手动审核（可选）
- ⚠️ 大型文件可能影响部署速度

## 支持

如有问题，请查看：
- [Vercel 文档](https://vercel.com/docs)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- 项目文档：`docs/Vercel部署指南.md`

