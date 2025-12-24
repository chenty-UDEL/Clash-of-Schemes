# 权谋决战完整版 (Clash of Schemes Full)

## 项目简介

《权谋决战》完整版是一款社交策略推理游戏，支持22个独特角色、3个预设板子、完整的行动顺序系统和死局判定机制。

## 版本信息

- **版本**: 2.0.0 (完整版)
- **角色数量**: 22个
- **支持人数**: 6-13人
- **预设板子**: 3个（命运之轮、均衡法则、策略之巅）

## 功能特性

### ✅ 完整实现
- 22个独特角色，每个角色都有独特的技能和胜利条件
- 3个预设板子系统，每个板子13个角色
- 完整的行动顺序系统（夜晚8步、白天7步）
- 死局判定机制（连续3次相同情况自动重置）
- 游戏人数限制（6-13人）

### 🎮 游戏流程
1. **创建/加入房间** - 选择板子类型
2. **夜晚阶段** - 玩家依次发动技能
3. **白天阶段** - 公开讨论和投票
4. **结算阶段** - 计算投票结果和胜利条件

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS
- **数据库**: Supabase (PostgreSQL + Realtime)
- **语言**: TypeScript
- **部署**: Vercel

## 快速开始

### 1. 克隆项目

```bash
git clone <your-github-repo-url>
cd quan-mou-jue-zhan-full
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的Supabase配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### 4. 初始化数据库

1. 在Supabase Dashboard创建新项目
2. 执行 `lib/db/schema.sql` 中的SQL语句
3. 配置Row Level Security (RLS) 策略

### 5. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 部署指南

### Vercel部署

1. 将代码推送到GitHub
2. 在Vercel中导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
4. 部署

详细部署步骤请参考 [docs/部署指南.md](./docs/部署指南.md)

## 项目结构

```
quan-mou-jue-zhan-full/
├── app/                    # Next.js App Router
│   ├── api/                # API路由
│   ├── (game)/             # 游戏页面
│   └── layout.tsx
├── components/             # React组件
│   ├── game/               # 游戏相关组件
│   └── ui/                 # UI组件
├── lib/                    # 工具库
│   ├── game/               # 游戏逻辑
│   ├── db/                 # 数据库相关
│   └── utils/              # 工具函数
├── types/                  # TypeScript类型
├── docs/                   # 文档
└── public/                 # 静态资源
```

## 开发计划

- [x] 项目初始化
- [ ] 数据库Schema设计
- [ ] 统一角色配置系统
- [ ] 实现7个新角色
- [ ] 板子系统
- [ ] 行动顺序系统
- [ ] 死局判定
- [ ] 前端组件重构
- [ ] 测试与优化
- [ ] 部署上线

详细计划请参考 [docs/完整版实施计划.md](./docs/完整版实施计划.md)

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue。


