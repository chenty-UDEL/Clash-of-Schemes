# 当前存在的问题清单

## 🔴 高优先级问题

### 1. winReason中的硬编码中文（17处）
**位置**：`app/api/rooms/[code]/process-day/route.ts`
**问题**：所有胜利原因都包含硬编码的中文文本
**影响**：在英文模式下，游戏结束时的胜利原因会显示中文
**涉及内容**：
- `【集票胜者】获得超过 2/3 票数，直接获胜！`
- `【平票赢家】在平局中幸存并获胜！`
- `【平票终结者】连续 ${streak} 局平票，获胜！`
- `【胜利夺取者】夺取了【XXX】的胜利条件，获胜！`
- 等等（共17处）

**建议修复方案**：
1. 为每个胜利原因添加翻译键
2. 使用 `tWithParams()` 函数支持动态内容（角色名、数字）
3. 在API中根据请求头或玩家语言设置选择语言

### 2. 其他组件中getRoleName等函数未传递playerId
**位置**：多个组件文件
**问题**：`RoleInfo`、`GameRules`、`GameTips`、`GameOver` 等组件中调用 `getRoleName`、`getRoleTag`、`getRoleDescription` 时没有传递 `playerId`
**影响**：这些组件中的角色名称、标签、描述可能不会根据玩家语言设置更新
**涉及文件**：
- `components/game/RoleInfo.tsx` (第22, 24, 28, 43行)
- `components/game/GameRules.tsx` (多处)
- `components/game/GameTips.tsx`
- `components/game/GameOver.tsx`
- `components/game/BoardSelector.tsx`
- `components/game/NightPhase.tsx`
- `components/game/RoleSelector.tsx`

**建议修复方案**：
1. 在这些组件中获取 `playerId`
2. 将所有 `getRoleName(role)` 改为 `getRoleName(role, playerId)`
3. 同样更新 `getRoleTag` 和 `getRoleDescription`

### 3. API中的硬编码中文
**位置**：`app/api/rooms/[code]/process-night/route.ts`
**问题**：第82行有硬编码的"未知玩家"
```typescript
return player?.name || `未知玩家(${id})`;
```
**影响**：在英文模式下会显示中文
**建议修复**：使用翻译键或根据语言设置返回不同文本

## 🟡 中优先级问题

### 4. 错误处理可以更完善
**位置**：多个API文件
**问题**：部分错误处理可能不够详细，缺少用户友好的错误消息
**建议**：添加更详细的错误处理和日志记录

### 5. 边界情况测试
**问题**：需要测试以下边界情况：
- 所有玩家同时出局
- 网络异常情况
- 数据库连接失败
- 并发操作冲突

## 🟢 低优先级问题（优化建议）

### 6. 代码注释
**问题**：部分复杂逻辑可以添加更详细的注释
**建议**：为关键业务逻辑添加注释

### 7. 单元测试
**问题**：缺少单元测试和集成测试
**建议**：添加测试覆盖关键功能

## 总结

### 必须修复（影响用户体验）
1. ✅ winReason国际化（17处）
2. ✅ 组件中getRoleName等函数传递playerId
3. ✅ API中的"未知玩家"硬编码

### 建议优化（提升代码质量）
4. 错误处理完善
5. 边界情况测试
6. 代码注释
7. 单元测试

## 修复优先级

**P0（立即修复）**：
- winReason国际化
- 组件中getRoleName等函数传递playerId
- API中的"未知玩家"硬编码

**P1（近期修复）**：
- 错误处理完善
- 边界情况测试

**P2（长期优化）**：
- 代码注释
- 单元测试

