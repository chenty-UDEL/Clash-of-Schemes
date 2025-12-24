# Vercel 部署指南

## 📋 步骤概览

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署
5. 验证部署

---

## 第一步：推送代码到 GitHub

### 1. 初始化 Git（如果还没做）

```powershell
cd C:\权谋决战\quan-mou-jue-zhan-full

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 完整版项目初始化"
```

### 2. 创建 GitHub 仓库

1. 访问 https://github.com
2. 点击右上角 **+** → **New repository**
3. 填写信息：
   - **Repository name**: `quan-mou-jue-zhan-full`（或你喜欢的名字）
   - **Description**: "权谋决战完整版 - 22角色社交推理游戏"
   - **Visibility**: Public 或 Private
   - ❌ **不要**勾选 "Add a README file"（我们已经有了）

4. 点击 **"Create repository"**

### 3. 推送代码

GitHub 会显示推送命令，类似：

```powershell
git remote add origin https://github.com/你的用户名/quan-mou-jue-zhan-full.git
git branch -M main
git push -u origin main
```

如果遇到认证问题：
- 使用 Personal Access Token 作为密码
- 或配置 SSH 密钥

---

## 第二步：在 Vercel 中导入项目

### 1. 访问 Vercel

1. 打开 https://vercel.com
2. 使用你的账号登录（与旧项目相同的账号）

### 2. 导入项目

1. 点击 **"Add New..."** → **"Project"**
2. 在 **Import Git Repository** 中，找到你刚创建的仓库
3. 点击 **"Import"**

### 3. 配置项目

在 **Configure Project** 页面：

#### Project Settings
- **Project Name**: `quan-mou-jue-zhan-full`（或你喜欢的名字）
- **Framework Preset**: Next.js（应该自动检测）
- **Root Directory**: `./`（默认）
- **Build Command**: `npm run build`（默认）
- **Output Directory**: `.next`（默认）
- **Install Command**: `npm install`（默认）

#### Environment Variables
**重要**：在这里添加环境变量！

点击 **"Environment Variables"**，添加以下三个变量：

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: 你的 Supabase Project URL
   - Environment: Production, Preview, Development（全部勾选）

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: 你的 Supabase anon public key
   - Environment: Production, Preview, Development（全部勾选）

3. **SUPABASE_SERVICE_KEY**
   - Value: 你的 Supabase service_role key
   - Environment: Production, Preview, Development（全部勾选）
   - ⚠️ **注意**：这个变量没有 `NEXT_PUBLIC_` 前缀，不会暴露给客户端

### 4. 部署

1. 点击 **"Deploy"**
2. 等待部署完成（约 2-3 分钟）

---

## 第三步：验证部署

### 1. 查看部署状态

部署完成后，你会看到：
- ✅ **Success** 状态
- 一个部署 URL，例如：`quan-mou-jue-zhan-full.vercel.app`

### 2. 访问网站

1. 点击部署 URL，或复制到浏览器打开
2. 检查网站是否正常加载
3. 尝试创建房间，测试基本功能

### 3. 检查日志

如果遇到问题：
1. 在 Vercel Dashboard 中，点击 **"Deployments"**
2. 点击最新的部署
3. 查看 **"Logs"** 或 **"Functions"** 标签
4. 检查是否有错误信息

---

## 第四步：配置自定义域名（可选）

### 1. 添加域名

1. 在 Vercel 项目设置中，点击 **"Domains"**
2. 输入你的域名（例如：`clash-of-schemes.com`）
3. 点击 **"Add"**

### 2. 配置 DNS

Vercel 会显示需要配置的 DNS 记录：
- **Type**: CNAME
- **Name**: `@` 或 `www`
- **Value**: `cname.vercel-dns.com`

在你的域名提供商（如 Cloudflare、阿里云等）配置这些记录。

### 3. 等待生效

DNS 生效通常需要几分钟到几小时。

---

## ✅ 部署完成检查清单

- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建
- [ ] 环境变量已配置（3个）
- [ ] 部署成功
- [ ] 网站可以访问
- [ ] 基本功能测试通过

---

## 🔄 后续更新

每次修改代码后：

```powershell
# 1. 提交代码
git add .
git commit -m "feat: 添加新功能"

# 2. 推送到 GitHub
git push

# 3. Vercel 会自动检测并重新部署


# 1. 添加所有新文件
git add .

# 2. 提交
git commit -m "feat: 添加角色配置系统、类型定义和基础API路由"

# 3. 推送到 GitHub
git push
```

在 Vercel Dashboard 的 **"Deployments"** 中可以看到自动部署进度。

---

## 🆘 常见问题

### Q: 部署失败？

**A**: 
1. 检查 **Logs** 中的错误信息
2. 常见原因：
   - 环境变量未配置
   - 构建错误（TypeScript 类型错误等）
   - 依赖安装失败

### Q: 环境变量不生效？

**A**: 
1. 确保所有环境（Production, Preview, Development）都配置了
2. 重新部署项目
3. 检查变量名是否正确（注意大小写）

### Q: 网站可以访问但功能不工作？

**A**: 
1. 检查浏览器 Console 是否有错误
2. 检查 Supabase 连接是否正常
3. 检查 RLS 策略是否正确配置

### Q: 如何回滚到之前的版本？

**A**: 
1. 在 Vercel Dashboard → **Deployments**
2. 找到之前的部署
3. 点击 **"..."** → **"Promote to Production"**

---

## 📝 重要提示

1. **环境变量安全**
   - `SUPABASE_SERVICE_KEY` 不会暴露给客户端（没有 NEXT_PUBLIC_ 前缀）
   - 不要将密钥提交到代码中

2. **自动部署**
   - 推送到 main 分支会自动触发部署
   - 可以在 Vercel 设置中配置分支策略

3. **性能优化**
   - Vercel 自动提供 CDN
   - 自动 HTTPS
   - 自动优化图片和资源

4. **监控和日志**
   - 在 Vercel Dashboard 查看访问统计
   - 查看函数执行日志
   - 设置错误通知

---

## 🎉 部署完成！

现在你的项目已经：
- ✅ 部署到 Vercel
- ✅ 可以通过 URL 访问
- ✅ 自动 HTTPS
- ✅ 自动 CDN 加速

**可以开始测试和使用了！** 🚀

---

## 📚 相关文档

- [数据库设置指南.md](./数据库设置指南.md)
- [部署指南.md](./部署指南.md)
- [GitHub设置指南.md](./GitHub设置指南.md)

