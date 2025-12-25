# Next.js 15 类型修复说明

## ❌ 错误原因

在 Next.js 15+ 中，路由处理器的 `params` 参数现在是**异步的**（Promise），需要使用 `await`。

### 旧代码（Next.js 14）
```typescript
export async function POST(
  request: Request,
  { params }: { params: { code: string } }
) {
  const { code } = params; // ❌ 错误
}
```

### 新代码（Next.js 15+）
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params; // ✅ 正确
}
```

## ✅ 已修复

我已经修复了所有 API 路由：
- ✅ `app/api/rooms/create/route.ts`
- ✅ `app/api/rooms/[code]/join/route.ts`

## 📝 注意事项

以后创建新的动态路由时，记住：
1. 使用 `NextRequest` 而不是 `Request`
2. `params` 是 `Promise<{ ... }>` 类型
3. 使用 `await params` 获取参数

---

**现在重新提交代码就可以成功构建了！** 🚀



