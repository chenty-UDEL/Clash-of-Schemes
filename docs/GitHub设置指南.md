# GitHub新项目设置指南

## 一、创建新仓库

### 步骤

1. **登录GitHub**
   - 访问 https://github.com
   - 使用你的账号登录

2. **创建新仓库**
   - 点击右上角 **+** 号
   - 选择 **New repository**

3. **填写仓库信息**
   ```
   Repository name: quan-mou-jue-zhan-full
   Description: 权谋决战完整版 - 22角色社交推理游戏
   Visibility: 
     - Public (公开，任何人都能看到)
     - Private (私有，只有你能看到)
   ```
   
   ⚠️ **不要**勾选以下选项：
   - ❌ Add a README file (我们会自己创建)
   - ❌ Add .gitignore (我们已经有了)
   - ❌ Choose a license (可选)

4. **点击 Create repository**

## 二、初始化本地Git仓库

### 在项目目录中执行

```bash
# 1. 进入项目目录
cd quan-mou-jue-zhan-full

# 2. 初始化Git
git init

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "Initial commit: 完整版项目初始化"

# 5. 添加远程仓库（替换为你的实际仓库URL）
git remote add origin https://github.com/你的用户名/quan-mou-jue-zhan-full.git

# 6. 设置主分支
git branch -M main

# 7. 推送代码
git push -u origin main
```

### 如果遇到认证问题

如果提示需要认证，可以：

1. **使用Personal Access Token**
   - GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 生成新token，勾选 `repo` 权限
   - 使用token作为密码

2. **或使用SSH**
   ```bash
   # 使用SSH URL
   git remote set-url origin git@github.com:你的用户名/quan-mou-jue-zhan-full.git
   ```

## 三、后续更新代码

每次修改代码后：

```bash
# 1. 查看修改
git status

# 2. 添加修改的文件
git add .

# 3. 提交（写清楚提交信息）
git commit -m "feat: 添加新角色XXX"

# 4. 推送到GitHub
git push
```

## 四、分支管理建议

### 主分支策略

- **main/master**: 生产环境代码，保持稳定
- **develop**: 开发分支，用于日常开发
- **feature/xxx**: 功能分支，开发新功能

### 创建功能分支

```bash
# 创建并切换到新分支
git checkout -b feature/add-new-role

# 开发完成后，合并到develop
git checkout develop
git merge feature/add-new-role
```

## 五、GitHub Actions（可选）

可以设置自动部署，当推送到main分支时自动部署到Vercel。

## 六、保护主分支（推荐）

1. 进入仓库 Settings → Branches
2. 添加分支保护规则
3. 要求Pull Request审查（可选）

这样可以防止直接推送到main分支，提高代码质量。

## 七、常见问题

### Q: 如何删除远程仓库？

A: 在GitHub仓库设置中，滚动到底部，点击 "Delete this repository"

### Q: 如何重命名仓库？

A: 在GitHub仓库设置中，可以修改仓库名称

### Q: 如何添加协作者？

A: Settings → Collaborators → Add people

### Q: 如何查看提交历史？

A: 在仓库页面点击 "commits" 或使用 `git log`

## 八、最佳实践

1. ✅ **提交信息要清晰**
   - `feat: 添加新功能`
   - `fix: 修复bug`
   - `docs: 更新文档`
   - `refactor: 重构代码`

2. ✅ **经常提交**
   - 完成一个小功能就提交
   - 不要积累太多修改

3. ✅ **使用分支**
   - 新功能用新分支
   - 主分支保持稳定

4. ✅ **添加README**
   - 说明项目用途
   - 如何安装和运行
   - 如何贡献

5. ✅ **添加LICENSE**
   - 选择适合的许可证
   - MIT License 比较常用


