# Vercel 配置检查清单

## ✅ 当前配置检查

根据你的截图，以下配置是**正确的**：

### 1. 项目基本信息 ✅
- **Project Name**: `clash-of-schemes` ✅
- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` ✅

### 2. 需要配置的部分 ⚠️

**重要**：在点击 "Deploy" 之前，必须配置环境变量！

---

## 🔴 关键步骤：配置环境变量

### 步骤：

1. **点击 "Environment Variables" 展开**

2. **添加以下 3 个环境变量**：

   #### 变量 1: NEXT_PUBLIC_SUPABASE_URL
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: 你的 Supabase Project URL（例如：`https://xxxxx.supabase.co`）
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development（全部勾选）

   #### 变量 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: 你的 Supabase anon public key
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development（全部勾选）

   #### 变量 3: SUPABASE_SERVICE_KEY
   - **Key**: `SUPABASE_SERVICE_KEY`
   - **Value**: 你的 Supabase service_role key
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development（全部勾选）
   - ⚠️ **注意**：这个变量没有 `NEXT_PUBLIC_` 前缀，不会暴露给客户端

3. **点击每个变量的 "Add" 按钮**

---

## 📋 完整检查清单

在点击 "Deploy" 之前，确认：

- [x] Project Name: `clash-of-schemes` ✅
- [x] Framework Preset: Next.js ✅
- [x] Root Directory: `./` ✅
- [ ] **Environment Variables 已配置** ⚠️ **必须完成！**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` 已添加
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 已添加
  - [ ] `SUPABASE_SERVICE_KEY` 已添加
  - [ ] 所有变量都勾选了 Production, Preview, Development

---

## ⚠️ 重要提示

### 1. 环境变量必须在部署前配置

如果部署后再添加环境变量，需要重新部署才能生效。

### 2. 环境变量值从哪里获取？

从 Supabase Dashboard → Settings → API：
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_KEY`

### 3. 检查变量名

确保变量名**完全正确**，注意：
- 大小写敏感
- 下划线位置
- 不要有多余的空格

---

## ✅ 配置完成后

1. **检查所有环境变量都已添加**
2. **点击 "Deploy" 按钮**
3. **等待部署完成**（约 2-3 分钟）
4. **访问部署 URL 测试**

---

## 🆘 如果忘记配置环境变量

如果已经部署但忘记配置环境变量：

1. 部署完成后，在项目设置中
2. 点击 **Settings** → **Environment Variables**
3. 添加环境变量
4. 重新部署（在 Deployments 中点击 "Redeploy"）

---

**现在请展开 "Environment Variables" 并配置 3 个环境变量！** 🔑



