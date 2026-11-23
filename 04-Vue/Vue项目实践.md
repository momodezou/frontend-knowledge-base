# Vue 项目实践：管理系统架构、组件封装与常见难点

> 学习定位：用于真实项目经验沉淀和中高级前端面试。以 Vue 3 + TypeScript + Vue Router + Pinia + Vite 为参考技术栈，重点关注**如何拆分职责、减少耦合、可测试与可维护**。

## 1. 管理系统的推荐分层

一个项目可以按**业务域**组织（如用户、权限、报表），不必将所有组件都塞入按类型划分的巨大文件夹。以下为一种可演进的参考：

```text
src/
├── app/                  # 应用启动、插件与全局初始化
├── router/               # 路由定义和守卫
├── stores/               # 跨页面共享状态（Pinia）
├── api/                  # HTTP 请求封装与端点函数
├── components/           # 通用、无业务倾向组件
├── composables/          # 可复用状态逻辑
├── features/
│   ├── users/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── components/
│   │   └── pages/
│   └── reports/
│       ├── components/
│       └── pages/
├── utils/                # 纯工具函数
├── styles/
└── main.ts
```

**核心边界**：

- `api`：只负责协议通信、返回值解析和基础错误处理；必要时进行运行时数据校验。
- `composables`：可复用的状态、生命周期与业务逻辑；纯函数无需封装成 composable。
- `stores`：多个页面真正需要共享的业务状态；不要承载所有一次性页面请求。
- `components`：明确 Props/Emits/Slots 契约，避免直接修改父页面状态。
- `features`：按业务域放置页面和专属组件，降低跨模块耦合。

## 2. Vue 3 + TypeScript：先建立接口契约

```ts
// features/users/types.ts
export interface User {
  id: string
  name: string
  status: 'active' | 'disabled'
}

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface UserQuery {
  keyword: string
  page: number
  pageSize: number
}
```

**易错点**：`await response.json() as PageResult<User>` 只是编译时断言，**不会**在运行时验证服务端返回的数据。真正需要健壮边界时应自行检查或使用 schema 校验库。

## 3. 实战：带请求取消的列表数据 composable

要解决的真实问题：用户快速修改筛选条件，多个请求交错返回，旧结果可能覆盖新结果。

```ts
// features/users/useUsers.ts
import { ref, onScopeDispose } from 'vue'
import type { User, UserQuery, PageResult } from './types'

export function useUsers() {
  const rows = ref<User[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref('')
  let controller: AbortController | null = null

  async function load(query: UserQuery) {
    controller?.abort()                 // 取消上一轮
    const current = new AbortController()
    controller = current
    loading.value = true
    error.value = ''

    try {
      const params = new URLSearchParams({
        keyword: query.keyword,
        page: String(query.page),
        pageSize: String(query.pageSize)
      })
      const response = await fetch(`/api/users?${params}`, { signal: current.signal })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json() as PageResult<User>
      if (controller !== current) return // 即使取消失效也避免旧数据覆盖
      rows.value = data.list
      total.value = data.total
    } catch (e) {
      if (current.signal.aborted || controller !== current) return
      error.value = e instanceof Error ? e.message : '加载失败'
    } finally {
      if (controller === current) {
        loading.value = false
        controller = null
      }
    }
  }

  // 在组件同步 setup 中调用时，随作用域销毁清理
  onScopeDispose(() => controller?.abort())
  return { rows, total, loading, error, load }
}
```

**这里为何使用 `onScopeDispose`？** 当 composable 在组件的同步 setup 作用域内调用时，能随对应作用域清理订阅/请求；若脱离作用域调用，需另行明确清理责任。

**生产补充**：实现时还要考虑参数校验、空结果、服务端错误格式、请求超时、分页边界和接口去重缓存。

## 4. 表格与表单组件如何封装

### 表格封装的适度抽象

建议稳定支持：`rows`、`columns`、`loading`、`rowKey`、分页事件、作用域插槽等能力。

```ts
interface Column<T> {
  key: keyof T | string
  title: string
  width?: number
  align?: 'left' | 'center' | 'right'
}
```

**不要为“未来可能的需求”一次性封装几十个配置项**。复杂表格常需要业务自定义单元格、筛选、树形数据、虚拟滚动，必要时优先使用成熟 UI 库并在外层包装约定。

### 表单封装的职责边界

- 表单字段值与校验规则来自父层或表单上下文。
- 校验错误消息应该可以被清晰地定位到字段。
- 避免在子组件内部直接请求业务端点。
- 对外暴露 `validate`、`reset` 等有限动作，或者通过事件通知父层。
- 多步骤表单需要明确保存草稿、离开确认以及重复提交的处理策略。

## 5. ECharts 通用图表封装：最常见的实际难点

图表组件除了 `setOption()`，还应考虑：

| 问题 | 推荐处理 |
| --- | --- |
| 首次初始化 | 容器挂载后初始化实例 |
| 数据更新 | 有针对性地 `setOption`，必要时控制合并策略 |
| 容器变化 | `ResizeObserver` + `chart.resize()` |
| 路由切换 | 卸载时 `dispose()`；KeepAlive 页面处理激活时 resize |
| 空数据 | 独立空态而不是展示陈旧图表 |
| 多图表联动 | 用明确的事件/状态协议，不让组件直接操作彼此实例 |

下面的示例使用父组件传入的 `option`，通过生命周期管理 ECharts 实例（项目需安装 `echarts`）：

```vue
<!-- components/BaseChart.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, onActivated } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, ECharts } from 'echarts'

const props = defineProps<{ option: EChartsOption }>()
const container = ref<HTMLDivElement | null>(null)
let chart: ECharts | undefined
let observer: ResizeObserver | undefined

onMounted(() => {
  if (!container.value) return
  chart = echarts.init(container.value)
  chart.setOption(props.option)
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(container.value)
})

watch(() => props.option, option => {
  chart?.setOption(option, { notMerge: true })
})

onActivated(() => chart?.resize())
onUnmounted(() => {
  observer?.disconnect()
  chart?.dispose()
  chart = undefined
})
</script>

<template><div ref="container" style="width: 100%; height: 320px" /></template>
```

**重要权衡**：`notMerge: true` 避免不同图表配置的旧系列残留，但会失去部分增量更新的优势；真实应用应根据业务性质选择并测量。若父组件**原地深改** `option` 而不更换对象引用，浅 `watch` 可能不触发：建议约定不可变更新或显式的版本触发机制。尺寸为 0 的隐藏容器需要在恢复可见后调用 `resize()`。

## 6. 权限设计：前端与后端边界

管理系统通常有菜单权限、路由权限、按钮权限、接口权限。

- 前端负责：提升用户体验、隐藏不可用入口、阻止普通导航进入无权限页面。
- 后端必须负责：**真正的资源授权、租户隔离和接口级校验**。
- 不可信菜单的组件标识要经过白名单映射，不能直接变成任意动态 `import()` 路径。
- 身份变更或登出后，需要清理 Pinia 用户状态、动态路由、缓存以及其他会话相关副作用。

更多见 [Vue Router](./VueRouter.md) 与 [Pinia](./Pinia.md)。

## 7. 工程质量：测试、发布和监控

建议最少覆盖三层：

1. **单元测试**：纯函数、复杂计算、composable 的状态变化与异常边界。
2. **组件测试**：Props/Emits、表单校验、筛选条件、关键交互。
3. **端到端测试**：登录、菜单权限、搜索分页、表单提交、导入导出等关键主流程。

发布前检查类型检查、Lint、单元测试、构建。生产环境关注网络错误、页面白屏、性能指标和前端异常日志；错误上报应处理脱敏和采样，不泄露个人数据。

## 8. 面试表达：用 STAR 结构讲项目难点

回答“你做过哪些有技术难度的模块？”时建议：

- **场景（Situation）**：用户操作、业务复杂度、数据量。
- **任务（Task）**：你承担的具体责任，而不是整个团队的成果。
- **行动（Action）**：如何定位瓶颈、对比方案、组织实施与测试。
- **结果（Result）**：用真实可核实的数据描述改善；没有测量结果时明确说“缺少量化数据”。

可选例题：

- 通用 ECharts 组件如何同时支持双 Y 轴、多个系列与动态刷新？
- 管理后台如何处理服务端动态菜单与权限变更？
- 表格筛选与请求取消如何防止竞态？
- 团队多人同时开发，如何约束组件 API 与发布回归？

## 9. 复习检查

- [ ] 能说明项目分层、状态所有权和组件通信原则。
- [ ] 能写一个有 loading/error/cancel 的列表请求逻辑。
- [ ] 能解释 ECharts 初始化、更新、resize、dispose 的生命周期。
- [ ] 能把前端权限与后端鉴权区分开。
- [ ] 能清晰讲述一个真实技术难点及权衡，不编造量化结果。

## 10. 参考

- [Vue TypeScript 文档](https://cn.vuejs.org/guide/typescript/overview.html)
- [Vue 测试指南](https://cn.vuejs.org/guide/scaling-up/testing.html)
- [Vue Router](./VueRouter.md)
- [Pinia](./Pinia.md)
- [生命周期](./生命周期.md)
- [Vue 性能优化](./Vue性能优化.md)
