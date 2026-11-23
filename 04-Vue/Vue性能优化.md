# Vue 性能优化：从定位瓶颈到可验证方案

> 学习定位：中高级面试场景题与实际项目实践。原则是**先测量，再优化；区分加载性能与运行时性能**。

## 1. 先明确性能问题是什么

| 类别 | 常见症状 | 常用分析工具 |
| --- | --- | --- |
| 加载性能 | 首屏慢、JS 包大、资源请求多 | Chrome DevTools Network、Performance、Lighthouse |
| 运行时更新 | 输入卡顿、滚动掉帧、列表更新慢 | Vue DevTools、Chrome Performance |
| 内存与副作用 | 切页变慢、内存持续增长、定时器残留 | Memory、Heap Snapshot、Performance |
| 数据请求 | 连续搜索结果乱序、接口瀑布流 | Network、请求日志与取消策略 |

Vue 官方指南强调优化目标应与应用类型相关：首屏依赖网络/资源加载，复杂交互依赖更新路径和组件组织。详见 [Vue 性能最佳实践](https://cn.vuejs.org/guide/best-practices/performance.html)。

## 2. 组件更新优化：让输入尽可能稳定

```vue
<!-- 父组件：提前计算具体行是否激活，而不是把 activeId 传给所有行 -->
<script setup lang="ts">
import { ref } from 'vue'
import RowItem from './RowItem.vue'
const activeId = ref(1)
const rows = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
</script>
<template>
  <RowItem v-for="row in rows" :key="row.id" :row="row" :active="row.id === activeId" />
</template>
```

**为什么？** 直接把不断变化的 `activeId` 传给所有子组件，可能让本不需要更新的子组件收到变化的 prop。提前转换为每个子组件更稳定的布尔值，可能减少部分更新。具体仍取决于组件实现和其他依赖。

其他选择：

- 合理使用 `computed` 缓存有依赖的派生结果，避免在模板中重复做昂贵运算。
- `v-once`：明确只需渲染一次、后续不更新的内容。
- `v-memo`：极端场景下基于指定依赖跳过特定子树更新；使用前需验证必要更新没有被错误跳过。
- 拆分组件并不自动更快：组件实例也有成本，重点是分离更新边界和复杂度。

## 3. 大列表：虚拟滚动与数据组织

当一页渲染数千、数万条数据时，主要瓶颈可能是 DOM 节点数量，而不是 Vue 单次计算。

1. **分页**：让用户只加载当前需要的数据；尤其后端有准确查询能力时。
2. **虚拟滚动**：视口内和缓冲区内渲染有限数量节点，注意动态行高、焦点与无障碍支持。
3. **稳定的 `key`**：确保行重排时状态正确复用。
4. **数据归一化**：避免每次 render 都构造大量临时对象或做深层计算。
5. **分析实际瓶颈**：接口返回 10 万条数据时，仅使用虚拟列表不一定解决 JSON 解析与内存占用问题。

## 4. 浅层响应式：优化大型、基本不可变的数据

```ts
import { shallowRef } from 'vue'

type Row = { id: number; score: number }
const rows = shallowRef<Row[]>([])

function replaceRows(next: Row[]) {
  rows.value = next     // 用新引用触发更新
}

function updateOne(id: number, score: number) {
  rows.value = rows.value.map(row => row.id === id ? { ...row, score } : row)
}
```

**易错点：** `shallowRef` 不追踪数组项深层字段的原地变化。下面写法**通常不会**触发依赖 `rows` 的组件更新：

```ts
rows.value[0].score = 100 // 仅深层修改，未改变 .value 引用
```

此方案适合大型不可变数据；如果业务频繁按字段修改，普通响应式对象也可能更合适。性能选择应经过 profiling。

## 5. 资源加载：路由懒加载、异步组件和构建体积

```ts
// Vue Router 4
const routes = [
  { path: '/analytics', component: () => import('@/views/AnalyticsPage.vue') }
]
```

```ts
import { defineAsyncComponent } from 'vue'
const HeavyDialog = defineAsyncComponent(() => import('./HeavyDialog.vue'))
```

- 路由级代码分割降低部分初始 JS 加载开销，但会增加切换时首次请求；需适当预取和加载反馈。
- 使用 `vite build` 配合 bundle 可视化分析依赖大小；不要依赖“某个库一定很大”的直觉。
- 对 ECharts 等大型依赖可考虑按需引入模块，但要核查实际 bundler 输出和插件兼容性。
- 图片懒加载、合适格式、缓存和 CDN 常常同样重要；不要把所有性能问题都归因于 Vue。

## 6. Vue 高频坑：`v-if`、`v-show`、key 和监听器

| 现象 | 可能原因 | 处理思路 |
| --- | --- | --- |
| 频繁切换复杂面板卡顿 | 每次 `v-if` 都创建/销毁大量节点 | 评估 `v-show` / KeepAlive，权衡内存 |
| 删除列表项后输入框内容错位 | 使用数组索引 key | 使用稳定唯一 ID |
| 切换页面后仍轮询 | 没清理计时器，或 KeepAlive 未暂停 | `onUnmounted` + `onDeactivated` |
| 图表显示尺寸错误 | 容器隐藏后恢复但图表未 resize | 使用 ResizeObserver/激活回调 |
| 输入搜索时重复请求 | 每次变化都立即请求 | debounce、取消过期请求、请求缓存 |
| 组件过度重渲染 | 不稳定 prop / 过度共享状态 | 缩小状态更新影响范围 |

## 7. 真实项目性能优化回答模板

建议面试时按“**现象 → 定位 → 原因 → 改动 → 验证**”说明，而不是堆技术名词：

> 一个数据量较大的表格页面出现滚动卡顿。我先用 Performance 录制定位长任务和 DOM 节点开销，确认瓶颈在大量行渲染；然后评估分页或虚拟滚动，并保留稳定 key 与交互状态；最后对比优化前后的交互响应和内存占用。

**不要编造优化百分比**；若没有真实数据，可以讲你的排查流程、可观察指标和权衡。

## 8. 高频自测

- [ ] 如何区分“加载慢”和“更新慢”？各用什么工具定位？
- [ ] 为什么 `computed` 不是“任何函数都包一层就提速”？
- [ ] `shallowRef` 为何可能提高大型不可变数组的性能？副作用是什么？
- [ ] 路由懒加载与异步组件的关系是什么？
- [ ] `v-if`、`v-show`、`KeepAlive` 适用场景如何区分？
- [ ] ECharts 页面反复进入后内存增长，你如何定位？

## 9. 参考

- [Vue 性能最佳实践](https://cn.vuejs.org/guide/best-practices/performance.html)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [虚拟 DOM 与 Diff](./虚拟DOM与Diff.md)
- [Vue 项目实践](./Vue项目实践.md)
