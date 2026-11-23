# Vue Router：路由模式、守卫、权限与工程实践

> 适用范围：Vue 3 + Vue Router 4，侧重管理后台路由设计及高频面试问题。Vue Router 3 的 `next()` 守卫模式与 Router 4 的返回值写法需区分。

## 1. 路由做了什么？

Vue Router 将 URL 与组件视图匹配，并提供嵌套路由、动态路由、导航守卫、懒加载等能力。

- **动态路由匹配**：`/users/:id` 匹配不同用户 ID。
- **嵌套路由**：父路由组件内通过 `<RouterView />` 渲染子路由。
- **路由懒加载**：`component: () => import('./Page.vue')` 让页面按需加载。
- **导航守卫**：可以允许、取消或重定向导航。

## 2. Hash 与 History 模式

| 对比 | Hash | HTML5 History |
| --- | --- | --- |
| URL 示例 | `/app/#/users` | `/app/users` |
| 原理 | 使用 URL 片段参与前端路由 | History API 管理路径 |
| 服务端配置 | 一般不需要为 hash 路径做回退 | 深链接刷新通常需要回退到 SPA 入口 |
| 取舍 | 部署简单但 URL 带 `#` | URL 更自然，但依赖服务端正确配置 |

**易错点：** History 模式下直接刷新 `/users/123` 出现 404，往往不是 Router 配置错误，而是服务器没有做 SPA fallback（静态资源/API 路由仍需按其原样处理）。

## 3. 基础配置：动态参数与懒加载

```ts
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    {
      path: '/users/:id', name: 'user-detail',
      component: () => import('@/views/UserDetail.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') }
  ]
})
export default router
```

```ts
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()          // 当前路由（响应式）
const router = useRouter()        // 导航实例
const id = route.params.id        // 在路由组件中读取参数
router.push({ name: 'user-detail', params: { id: '42' } })
```

**注意**：复用同一个路由组件时，仅参数从 `:id=1` 变为 `:id=2` 不一定重新挂载组件；可使用 `watch(() => route.params.id, ...)` 或 `onBeforeRouteUpdate` 更新数据。不要假设 `onMounted` 每次路由参数变化都会执行。

## 4. 导航守卫与权限控制

```ts
// 示例：token 校验只是 UX 入口限制；安全授权必须由服务端执行
router.beforeEach((to) => {
  const token = localStorage.getItem('access_token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})
```

Router 4 常见返回结果：

- `return true` / `undefined`：继续导航。
- `return false`：取消本次导航。
- `return { name: 'login' }`：重定向。
- `throw new Error(...)`：抛出错误，应用可集中处理。

**示例前提**：上面的项目必须已定义名为 `login` 的路由，并应对重定向目标作白名单或安全校验，避免开放重定向。真实项目中建议通过认证状态服务 / Pinia 管理登录状态，而非把 `localStorage` 当成安全真相来源。

**重要**：前端守卫只能控制页面展示与导航，**不能替代服务端接口鉴权**。只在菜单隐藏按钮、或动态注册路由，不会阻止恶意用户直接请求后台 API。

## 5. 动态路由与菜单管理

常见后台方案：

1. 登录成功后从服务端获取经过授权的菜单/路由描述。
2. 对服务端数据做结构校验、路径规范化和权限过滤。
3. 用**预先定义的组件映射表**把安全的组件标识转换为懒加载组件；不要直接把不可信字符串拼成任意模块导入路径。
4. 调用 `router.addRoute()` 注册路由；退出登录或角色变化时清除对应动态路由。
5. 将菜单可见性和路由访问控制分开建模，刷新后需重建必要的动态路由。

```ts
// 示例：明确的受控组件映射
const pages = {
  dashboard: () => import('@/views/Dashboard.vue'),
  users: () => import('@/views/Users.vue')
} as const

type PageName = keyof typeof pages
function getPage(name: string) {
  if (!(name in pages)) throw new Error('未知页面标识')
  return pages[name as PageName]
}
```

## 6. 常见易错点

- `route` 是当前路由信息，`router` 是路由实例，别混淆。
- `params` 与 `query` 语义不同；动态命名路由参数通常通过 `params` 提供，查询字符串使用 `query`。
- 不要同时假定 `path` 和 `params` 的组合总按预期处理；有参数时优先按 `name` 导航。
- 路由守卫异步任务须考虑异常、重复跳转和权限加载竞争；避免无条件重定向造成死循环。
- `addRoute` 不会自动保证当前 URL 的所有场景立即匹配正确路由；首次动态注入后需按应用导航状态处理匹配/重试。
- 离开页面后取消请求、清理定时器；参数变化也需触发数据刷新。

## 7. 典型面试场景

**问题：登录后服务端返回菜单，前端如何实现动态路由？**

回答时应覆盖：权限数据校验 → 路由组件安全映射 → 注册与匹配 → 页面刷新恢复 → 退出登录清理 → 后端 API 鉴权 → 404 和无权限边界。仅说“调用 `addRoute`”不够。

**问题：History 模式的页面刷新为什么可能 404？**

需要从浏览器导航、服务器请求路径、SPA fallback 三个层次解释，不要只答“切换成 hash”。

## 8. 面试自测

- [ ] Hash 和 History 模式如何工作？部署时分别要注意什么？
- [ ] Router 4 中守卫的返回值有什么含义？
- [ ] 只修改动态路由参数，组件是否会重新创建？
- [ ] 前端权限、菜单权限、后端鉴权是什么关系？
- [ ] 动态路由如何避免误导入任意文件路径？
- [ ] 如何处理登录后刷新、登出后的路由状态？

## 9. 参考

- [Vue Router 官方指南](https://router.vuejs.org/zh/guide/)
- [导航守卫](https://router.vuejs.org/zh/guide/advanced/navigation-guards.html)
- [动态路由](https://router.vuejs.org/zh/guide/advanced/dynamic-routing.html)
- [Vue 项目实践](./Vue项目实践.md)
