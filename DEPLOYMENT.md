# 部署说明

## 自动部署流程

每次代码更新完成后，系统会自动：
1. ✅ 提交代码到 Git
2. ✅ 推送到 GitHub
3. ⚠️ 尝试部署到 Vercel（需要先配置）

## 首次配置 Vercel CLI（只需一次）

### 方法1：通过命令行配置（推荐）

```bash
# 1. 安装 Vercel CLI（如果还没有）
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 在项目目录中链接项目
cd quan-mou-jue-zhan-full
vercel link

# 4. 选择你的项目和组织
# 按照提示操作即可
```

### 方法2：通过 Vercel Dashboard

1. 访问 https://vercel.com/dashboard
2. 确保项目已连接 GitHub 仓库
3. 每次推送代码到 GitHub 时，Vercel 会自动部署

## 当前状态

- ✅ 无用文件已删除
- ✅ 代码已推送到 GitHub
- ⚠️ Vercel CLI 需要登录才能自动部署

## 部署方式

### 方式1：自动部署（推荐）

配置好 Vercel CLI 后，每次运行 `npm run auto-commit` 会自动部署。

### 方式2：GitHub 自动部署

如果 Vercel 已连接 GitHub，推送代码后会自动部署。

### 方式3：手动部署

```bash
# 部署到生产环境
npm run deploy

# 或使用 Vercel CLI
vercel --prod
```

### 方式4：Vercel Dashboard

1. 访问 https://vercel.com/dashboard
2. 找到项目
3. 点击 "Deployments" → "Redeploy"

## 已删除的文件

- ✅ `test-roles.js` - 测试脚本
- ✅ `test-roles-group2.js` - 测试脚本
- ✅ `scripts/post-update.js` - 未使用的脚本
- ✅ `scripts/manual-deploy.js` - 已整合到 auto-commit
- ✅ `AUTO_COMMIT_README.md` - 临时文档
- ✅ `AUTO_DEPLOY_SETUP.md` - 临时文档
- ✅ `DEPLOY_NOW.md` - 临时文档
- ✅ `FORCE_DEPLOY.md` - 临时文档
- ✅ `快速部署.md` - 临时文档
- ✅ `deploy-test.ps1` - 临时脚本

## 验证部署

部署完成后，访问：
- 测试模式: `https://你的域名.vercel.app/test`
- 主页: `https://你的域名.vercel.app/`

