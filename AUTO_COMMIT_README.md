# 自动提交和部署说明

## 功能说明

系统已配置自动提交和推送功能。每次我完成代码更新后，会自动执行以下操作：

1. ✅ 检查 Git 仓库状态
2. ✅ 添加所有更改的文件
3. ✅ 自动提交更改
4. ✅ 推送到 GitHub
5. ✅ 触发 Vercel 自动部署

## 自动执行方式

### 方式1：通过 npm 脚本（推荐）

每次更新完成后，我会运行：
```bash
npm run auto-commit
```

或简写：
```bash
npm run update
```

### 方式2：直接运行脚本

```bash
node scripts/auto-commit.js
```

## 工作流程

```
代码更新完成
    ↓
运行 npm run auto-commit
    ↓
检查 Git 状态
    ↓
添加所有更改
    ↓
自动提交（带时间戳）
    ↓
推送到 GitHub
    ↓
Vercel 自动检测并部署
```

## 提交信息格式

自动提交的消息格式：
```
chore: 自动更新 - 2024/01/15 14:30
```

## 注意事项

1. **首次使用**
   - 如果还没有初始化 Git，脚本会自动初始化
   - 如果还没有配置远程仓库，需要手动配置：
     ```bash
     git remote add origin <你的GitHub仓库URL>
     git push -u origin main
     ```

2. **没有更改时**
   - 如果没有未提交的更改，脚本会跳过提交

3. **推送失败**
   - 如果推送失败（如网络问题），可以稍后手动推送：
     ```bash
     git push origin main
     ```

## 手动触发

如果需要手动触发自动提交：

```bash
npm run auto-commit
```

## 禁用自动提交

如果不想自动提交，可以：
1. 不运行 `npm run auto-commit`
2. 手动管理 Git 提交

## 配置远程仓库

如果还没有配置远程仓库：

```bash
# 1. 添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 2. 首次推送
git push -u origin main
```

## 查看部署状态

推送完成后，可以：

1. **GitHub**: 访问仓库查看提交记录
2. **Vercel**: 访问 Dashboard 查看部署状态
3. **网站**: 等待2-3分钟后访问网站验证更新

## 故障排除

### 问题1: Git 未初始化
**解决**: 脚本会自动初始化，或手动运行 `git init`

### 问题2: 没有远程仓库
**解决**: 按照上面的"配置远程仓库"步骤操作

### 问题3: 推送失败
**解决**: 
- 检查网络连接
- 检查 Git 认证（可能需要 Personal Access Token）
- 手动推送: `git push origin main`

### 问题4: Vercel 未自动部署
**解决**:
- 检查 Vercel 是否已连接 GitHub 仓库
- 检查 Vercel Dashboard 中的部署设置
- 手动触发部署: `npm run deploy`

## 示例输出

```
🚀 开始自动提交和推送...

📝 发现未提交的更改，正在添加...
💾 提交更改: chore: 自动更新 - 2024/01/15 14:30
📤 推送到远程仓库...

✅ 代码已成功推送到 GitHub
🔗 Vercel 将自动检测并部署更新
```

