# Vue 2 与 Vue 3：核心差异与迁移思路

> 学习定位：区分**架构变化、开发方式变化、迁移风险**，避免只背“Vue 2 用 defineProperty、Vue 3 用 Proxy”。

## 1. 对比总览

| 维度 | Vue 2（典型写法） | Vue 3 |
| --- | --- | --- |
| 响应式基础 | `Object.defineProperty` + 对数组方法的特殊处理 | 基于 `Proxy` 的对象代理；`ref` 通过 getter/setter 访问 `.value` |
| 组织逻辑 | Options API 为主 | 同时支持 Options API、Composition API |
| 组件创建 | `new Vue({ ... })` | `createApp(App).mount('#app')` |
| 多根节点 | 组件模板通常需单根 | 支持 Fragment，多根节点 |
| 模板运行时 | Vue 2 的虚拟 DOM 机制 | 编译器增加 Patch Flags、Block Tree 等优化 |
| 组件通信变化 | `v-model` 默认 value/input；`.sync` 曾常用 | 默认 `modelValue`/`update:modelValue`；可定义多个 `v-model` |
| 状态生态 | Vuex 3/4 等 | Pinia 是推荐的新项目选择之一 |
| 生命周期写法 | `beforeDestroy`/`destroyed` | 对应改为 `beforeUnmount`/`unmounted` |

**版本注意**：Vue 2.7 已回移部分 Composition API 能力，因此不能笼统说“所有 Vue 2 都没有 Composition API”。比较时先说明版本前提。

## 2. 响应式行为差异：更常见的实际 Bug

Vue 2 使用 getter/setter 为已有属性建立依赖，一些运行期新增属性、数组索引赋值不能以相同方式被观察（常通过 `Vue.set`、`splice` 等处理）。Vue 3 代理对象可拦截对象属性的新增、删除及数组索引等操作。

```js
// Vue 2 思路（适用于支持 Vue.set 的 Vue 2 环境）
this.$set(this.user, 'nickname', 'Tom')
this.list.splice(0, 1, 'new')
```

```ts
// Vue 3（在 setup 中）
import { reactive } from 'vue'
const user = reactive<{ name: string; nickname?: string }>({ name: 'Tom' })
user.nickname = 'Jerry' // 代理对象能追踪新增属性
```

**不要走向另一个误区**：Vue 3 的 `reactive()` 也有使用边界，例如直接解构基本类型字段，以及用新对象替换原代理变量，可能使旧订阅关系无法跟随。见 [响应式原理](./响应式原理.md)。

## 3. Options API 与 Composition API

```vue
<!-- Vue 2/3 都支持的 Options API 风格（示意） -->
<script>
export default {
  data() { return { count: 0 } },
  computed: { doubled() { return this.count * 2 } },
  methods: { increment() { this.count++ } }
}
</script>
```

```vue
<!-- Vue 3 常用的 Composition API / script setup -->
<script setup lang="ts">
import { ref, computed } from 'vue'
const count = ref(0)
const doubled = computed(() => count.value * 2)
const increment = () => count.value++
</script>
```

**面试答法：** Options API 按配置项（data、methods、computed）组织；Composition API 可按功能关注点组织相关状态与逻辑，适合复用复杂业务逻辑，但不等于性能必然更好，也不要求所有旧项目必须重写。

## 4. 组件 API 迁移要点

- **应用实例**：Vue 3 使用 `createApp`，插件使用 `app.use()`，便于多个应用隔离全局配置。
- **事件**：Vue 3 不再提供 Vue 2 风格的实例事件总线 `$on/$off/$once`；推荐 Props/Emits、Pinia 或专门的事件机制。
- **过滤器**：Vue 3 移除模板 filters，改用计算属性或普通函数。
- **`v-model`**：Vue 3 默认 `modelValue` / `update:modelValue`，Vue 3.4+ 可用 `defineModel()` 简化；注意项目版本。
- **指令**：自定义指令钩子命名及参数发生变化，迁移时需要检查。
- **Teleport / Suspense / Fragment**：Vue 3 中可利用这些能力，但别认为 Suspense 与所有异步业务逻辑天然兼容；需区分具体支持范围。
- **响应式事件**：`emits` 建议显式声明，尤其是包装原生组件时，避免事件透传与重复触发带来问题。

## 5. 项目迁移策略（高频场景题）

管理后台从 Vue 2 升级 Vue 3，不建议只进行全局搜索替换。更可控的路径：

1. **盘点依赖**：UI 库、Router、Vuex/Pinia、构建工具、指令、mixins、过滤器、第三方插件是否支持。
2. **梳理兼容风险**：`v-model`、`.sync`、生命周期名称、事件总线、`Vue.set`、全局 API、自定义指令。
3. **建立测试基线**：登录权限、动态菜单、表格、表单、上传、图表、路由跳转等关键路径先确保可回归。
4. **分模块迁移**：保留可工作的 Options API，优先迁移需要重构和复用的业务模块。
5. **性能与生产验证**：检查打包体积、首屏数据请求、路由权限和 ECharts 实例销毁等行为。

**示例回答：** “我会先评估第三方依赖和关键组件兼容性，建立回归测试，再逐步迁移，优先保证业务稳定，而不是一次性全部改成 `<script setup>`。”

## 6. 常见错误理解

- ❌ “Vue 3 完全不支持 Options API” → ✅ 仍支持。
- ❌ “Vue 3 所有响应式状态都是 Proxy” → ✅ `ref` 使用自身的 `.value` 访问器，内部对象值再按需要转换。
- ❌ “使用 Composition API 一定显著提升运行性能” → ✅ 主要改变代码组织与复用方式，具体性能需测量。
- ❌ “Vue 2 不能监听数组任何变化” → ✅ Vue 2 对一组变更数组的方法做了响应式处理，问题主要在特定操作。

## 7. 高频面试自测

- [ ] Vue 2 / Vue 3 响应式实现为什么不同？各有什么使用边界？
- [ ] Vue 3 的 Composition API 是否取代了 Options API？
- [ ] 解释 Vue 3 的 `v-model` 协议，并比较 Vue 2。
- [ ] 如果升级一套存量管理系统，如何降低回归风险？
- [ ] 如何与业务方解释“迁移成本”和“直接收益”？

## 8. 参考

- [Vue 3 迁移指南](https://v3-migration.vuejs.org/)
- [Vue 官方指南](https://cn.vuejs.org/guide/introduction.html)
- [响应式原理](./响应式原理.md)
- [组件通信](./组件通信.md)
