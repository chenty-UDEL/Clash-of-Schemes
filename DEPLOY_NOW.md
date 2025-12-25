# 🚀 立即部署测试模式更新

## 部署步骤

### 方法1：使用 Git 推送（推荐 - 自动部署）

```bash
# 1. 检查当前状态
git status

# 2. 添加所有更改
git add .

# 3. 提交更改
git commit -m "feat: 添加测试模式功能

- 添加测试模式页面 (/test)
- 实现AI自动行动和投票
- 添加测试模式API端点
- 完善国际化支持
- 配置自动部署流程"

# 4. 推送到 GitHub（会自动触发 Vercel 部署）
git push origin main
```

### 方法2：使用 Vercel CLI 手动部署

```bash
# 1. 确保已安装 Vercel CLI
npm i -g vercel

# 2. 登录（如果还没登录）
vercel login

# 3. 部署到生产环境
vercel --prod

# 或使用 npm 脚本
npm run deploy
```

### 方法3：通过 Vercel Dashboard

1. 访问 https://vercel.com/dashboard
2. 找到你的项目
3. 点击 "Deployments" 标签
4. 点击 "Redeploy" 按钮
5. 选择最新的提交或手动触发部署

## 部署前检查清单

- [x] 测试模式页面已创建 (`app/test/page.tsx`)
- [x] 测试API端点已创建 (`app/api/test/create/route.ts`, `app/api/test/auto-action/route.ts`)
- [x] 主页面已添加测试模式入口
- [x] 国际化翻译已添加
- [x] 自动部署配置已设置
- [ ] 代码已提交到 Git
- [ ] 已推送到 GitHub

## 验证部署

部署完成后，访问以下URL验证：

1. **测试模式页面**: `https://你的域名.vercel.app/test`
2. **主页测试入口**: `https://你的域名.vercel.app/` (应该看到"进入测试模式"按钮)

## 测试功能

1. 访问测试模式页面
2. 输入玩家昵称
3. 选择一个角色
4. 选择游戏板子
5. 点击"开始测试"
6. 验证AI玩家是否自动创建
7. 验证AI是否自动行动和投票

## 如果部署失败

1. **检查 Vercel 日志**
   - 访问 Vercel Dashboard → Deployments → 查看日志

2. **检查环境变量**
   - 确保所有环境变量都已配置：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_KEY`

3. **本地构建测试**
   ```bash
   npm run build
   ```
   如果本地构建失败，部署也会失败

4. **检查类型错误**
   ```bash
   npm run type-check
   ```

## 快速部署命令

```bash
# 一键部署（如果已配置 Git）
git add . && git commit -m "feat: 测试模式更新" && git push

# 或使用 Vercel CLI
vercel --prod
```

## 部署后验证

- [ ] 测试模式页面可以访问
- [ ] 可以创建测试房间
- [ ] AI玩家自动创建
- [ ] AI自动行动和投票
- [ ] 游戏流程正常
- [ ] 国际化正常工作

## 需要帮助？

查看详细文档：
- `AUTO_DEPLOY_SETUP.md` - 自动部署设置指南
- `TEST_MODE_README.md` - 测试模式使用说明
- `docs/Vercel部署指南.md` - Vercel 部署详细指南

