# Windows 11 开发环境设置指南

## ✅ Windows 11 完全可以开发！

**好消息**：你**不需要**WSL！Windows 11 原生支持 Next.js 开发，所有工具都有 Windows 版本。

## 📋 需要安装的工具

### 1. Node.js（必需）

Node.js 是运行 Next.js 的基础。

#### 安装步骤：

1. **访问 Node.js 官网**
   - 打开 https://nodejs.org/
   - 下载 **LTS 版本**（推荐，例如 v20.x 或 v18.x）

2. **运行安装程序**
   - 双击下载的 `.msi` 文件
   - 点击 "Next" 完成安装
   - ✅ **重要**：确保勾选 "Add to PATH" 选项

3. **验证安装**
   打开 PowerShell 或 CMD，运行：
   ```powershell
   node --version
   npm --version
   ```
   应该显示版本号，例如：
   ```
   v20.10.0
   10.2.3
   ```

### 2. Git（必需）

用于版本控制和推送到 GitHub。

#### 安装步骤：

1. **访问 Git 官网**
   - 打开 https://git-scm.com/download/win
   - 下载会自动开始

2. **运行安装程序**
   - 双击下载的 `.exe` 文件
   - 大部分选项保持默认即可
   - ✅ **重要**：选择 "Git from the command line and also from 3rd-party software"

3. **验证安装**
   ```powershell
   git --version
   ```
   应该显示版本号，例如：`git version 2.42.0`

### 3. 代码编辑器（推荐）

#### VS Code（强烈推荐）

1. **下载 VS Code**
   - 访问 https://code.visualstudio.com/
   - 下载 Windows 版本

2. **安装推荐扩展**
   打开 VS Code 后，安装以下扩展：
   - **ES7+ React/Redux/React-Native snippets** - React 代码片段
   - **ESLint** - 代码检查
   - **Prettier** - 代码格式化
   - **TypeScript and JavaScript Language Features** - TypeScript 支持（通常已内置）

## 🚀 快速开始

### 1. 打开项目

```powershell
# 进入项目目录
cd C:\权谋决战\quan-mou-jue-zhan-full

# 或者使用 VS Code 打开
code .
```

### 2. 安装依赖

```powershell
npm install
```

这会在项目目录创建 `node_modules` 文件夹，安装所有依赖包。

### 3. 配置环境变量

1. 复制 `env.template` 为 `.env.local`：
   ```powershell
   copy env.template .env.local
   ```

2. 编辑 `.env.local`，填入你的 Supabase 配置

### 4. 启动开发服务器

```powershell
npm run dev
```

应该看到：
```
  ▲ Next.js 16.0.7
  - Local:        http://localhost:3000
```

在浏览器打开 http://localhost:3000 即可看到项目！

## 💡 Windows 特定提示

### PowerShell vs CMD

- **PowerShell**（推荐）：功能更强大，支持更多命令
- **CMD**：也可以使用，但功能较少

### 路径问题

Windows 使用反斜杠 `\`，但大多数情况下可以混用：
```powershell
# 这些都可以
cd C:\权谋决战\quan-mou-jue-zhan-full
cd "C:\权谋决战\quan-mou-jue-zhan-full"
```

### 中文路径

项目路径包含中文（`权谋决战`）是**完全没问题**的！Node.js 和 Git 都支持 Unicode。

### 权限问题

如果遇到权限错误：
1. 以**管理员身份**运行 PowerShell
2. 或者修改文件夹权限

## 🔧 常见问题

### Q: 命令找不到（'node' 不是内部或外部命令）

**A**: Node.js 没有正确添加到 PATH
1. 重新安装 Node.js，确保勾选 "Add to PATH"
2. 或者手动添加到 PATH：
   - 右键 "此电脑" → "属性" → "高级系统设置"
   - "环境变量" → 编辑 "Path"
   - 添加 Node.js 安装路径（通常是 `C:\Program Files\nodejs\`）

### Q: npm install 很慢

**A**: 可以使用国内镜像
```powershell
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或者使用 cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

### Q: 端口 3000 被占用

**A**: 使用其他端口
```powershell
# 使用端口 3001
npm run dev -- -p 3001
```

### Q: Git 提交时中文乱码

**A**: 设置 Git 编码
```powershell
git config --global core.quotepath false
git config --global gui.encoding utf-8
git config --global i18n.commit.encoding utf-8
git config --global i18n.logoutputencoding utf-8
```

## ✅ 验证环境

运行以下命令，确保一切正常：

```powershell
# 检查 Node.js
node --version
# 应该显示：v18.x.x 或 v20.x.x

# 检查 npm
npm --version
# 应该显示：9.x.x 或 10.x.x

# 检查 Git
git --version
# 应该显示：git version 2.x.x

# 检查项目依赖
cd C:\权谋决战\quan-mou-jue-zhan-full
npm install
# 应该成功安装所有依赖

# 启动开发服务器
npm run dev
# 应该看到 Next.js 启动信息
```

## 📝 开发工作流

### 日常开发

```powershell
# 1. 进入项目目录
cd C:\权谋决战\quan-mou-jue-zhan-full

# 2. 启动开发服务器
npm run dev

# 3. 在浏览器打开 http://localhost:3000

# 4. 修改代码，保存后自动刷新
```

### 提交代码

```powershell
# 1. 查看修改
git status

# 2. 添加文件
git add .

# 3. 提交
git commit -m "feat: 添加新功能"

# 4. 推送到 GitHub
git push
```

## 🎯 总结

- ✅ **Windows 11 完全支持开发**，不需要 WSL
- ✅ 只需要安装 Node.js、Git 和 VS Code
- ✅ 所有命令在 PowerShell 中运行
- ✅ 中文路径完全支持
- ✅ 开发体验与 Mac/Linux 基本相同

**开始开发吧！** 🚀


