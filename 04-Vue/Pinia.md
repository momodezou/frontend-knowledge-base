# Pinia 状态管理：Store 设计、异步行为与常见错误

> 学习定位：Vue 3 中常用的全局状态管理。重在理解何时用 Store、如何组织业务边界、如何避免状态不同步。

## 1. Pinia 解决的是什么问题？

当用户身份、权限、主题、全局筛选条件等需要在多个组件或路由间共享时，可用 Pinia 管理明确的共享状态。

| 状态种类 | 建议放哪里 |
| --- | --- |
| 单个输入框是否聚焦 | 组件本地 `ref` |
| 表格筛选条件，且只在单页面使用 | 页面组件 / composable |
| 登录用户资料、角色信息 | Pinia Store |
| 服务端数据缓存与失效 | 按项目复杂度选择缓存层/数据请求库；不必全部存 Pinia |
| 在父子组件间短距离共享 | Props / Emits |

**面试高频：Pinia 与 Vuex 的区别？** Pinia 常见优势是较简洁的 API、较好的 TypeScript 推断，不要求类似 Vuex 的 `mutations` 分层；但“某个项目应该迁移吗”仍取决于成本、版本和维护计划。

## 2. Options Store 与 Setup Store

```ts
// src/stores/counter.ts：Options Store
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    doubled: state => state.count * 2
  },
  actions: {
    increment() { this.count++ }
  }
})
```

```ts
// Setup Store：在 setup 风格组织状态和逻辑
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref<{ id: string; price: number }[]>([])
  const total = computed(() => items.value.reduce((sum, item) => sum + item.price, 0))
  function add(item: { id: string; price: number }) { items.value.push(item) }
  return { items, total, add }
})
```

Setup Store 中应返回希望 Pinia 管理的状态属性；不要把业务共享状态藏在未返回的私有 ref 中，导致 SSR、DevTools 或插件行为不正确。

## 3. `storeToRefs` 与解构陷阱

```ts
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
const { count, doubled } = storeToRefs(counter) // state/getters 保持响应性
const { increment } = counter                 // action 可直接解构

increment()
console.log(count.value, doubled.value)
```

**错误示例：**

```ts
const counter = useCounterStore()
const { count } = counter // 普通值解构，后续变化不一定反映到这个变量
```

与 Vue `reactive` 解构问题类似，Store 的状态和 getter 需要保持对其响应式来源的引用。`storeToRefs` 专门帮助按属性拆解 Store。

## 4. 异步 Action：加载、错误与竞争

```ts
import { defineStore } from 'pinia'

interface User { id: string; name: string }

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as User | null,
    loading: false,
    error: ''
  }),
  actions: {
    async loadProfile() {
      this.loading = true
      this.error = ''
      try {
        const response = await fetch('/api/me', { credentials: 'include' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        this.profile = await response.json() as User
      } catch (err) {
        this.error = err instanceof Error ? err.message : '加载失败'
        throw err // 如调用方需要感知失败，明确向外传播
      } finally {
        this.loading = false
      }
    }
  }
})
```

**工程提醒：**

- **类型断言不会校验接口返回值**，需要时使用运行时 schema 校验。
- 多次并发调用可能让前一次请求最后完成，覆盖新结果；可按请求 ID、AbortController 或业务层缓存策略处理。
- 错误信息是否抛给调用者应形成统一约定；不要既吞错误又让页面误以为成功。

## 5. 更新状态、持久化与 SSR

- 直接赋值 `store.count++`、`$patch({ count: 2 })`、`$patch(state => { ... })` 都是常见状态更新方式。
- Options Store 的 `$reset()` 可恢复初始状态；Setup Store 若需要重置通常自己实现相应方法。
- Pinia 核心并**不默认保证把数据自动永久保存**；持久化需明确选择插件或自己实现。
- 不要将访问令牌、敏感隐私数据随意持久化到 `localStorage`；考虑 XSS 风险、会话安全和产品认证方案。
- SSR 应为每个请求隔离应用/Pinia 实例，并关注服务端数据序列化、注水和运行时上下文，避免用户数据跨请求串用。

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

## 6. Store 拆分与项目实践

真实管理系统可按业务域拆分：

```text
src/stores/
├── auth.ts       # 身份与登录态
├── permissions.ts# 角色、权限与资源
├── preferences.ts# 主题、语言、布局
└── tabs.ts       # 多标签导航
```

明确 **Store 的输入/输出契约**，不要把路由跳转、HTTP 客户端和所有页面业务耦合进一个巨大 Store。跨 Store 依赖应避免循环、重复请求和难以预测的初始化顺序。

## 7. 高频自测

- [ ] Pinia 与 Vuex 的核心差异是什么？为什么不强制 mutations？
- [ ] Option Store 与 Setup Store 有什么取舍？
- [ ] `storeToRefs` 为什么重要？Action 能不能直接解构？
- [ ] Pinia 默认是否自动保存到本地存储？
- [ ] 登录状态、列表页条件、服务端缓存分别应放在哪里？
- [ ] 如何处理接口竞态、登出后状态清理和 SSR 数据隔离？

## 8. 参考

- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
- [定义 Store](https://pinia.vuejs.org/zh/core-concepts/)
- [State](https://pinia.vuejs.org/zh/core-concepts/state.html)
- [Vue Router](./VueRouter.md)
- [Vue 项目实践](./Vue项目实践.md)
