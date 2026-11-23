# Vue 基础知识：核心概念与高频易错点

> 学习定位：Vue 3 为主，兼顾 Vue 2 的常见面试问题。本文关注必须理解的核心机制，不按 API 字母顺序堆砌语法。
>
> 前置知识：JavaScript 对象、模块、异步任务、DOM 事件。推荐结合 [Composition API](./CompositionAPI.md) 与 [响应式原理](./响应式原理.md) 复习。

## 1. Vue 解决什么问题？

Vue 是基于组件的声明式 UI 框架。开发者描述**状态与界面的关系**，Vue 追踪响应式依赖，并在数据变化后调度视图更新。

- **声明式渲染**：`{{ message }}` 表示界面依赖 `message`，不是手动查找 DOM 更新文本。
- **组件化**：通过组件的 Props、事件、插槽组合复杂页面。
- **响应式**：`ref` / `reactive` 包装状态，组件渲染会读取并追踪依赖。
- **单文件组件**：`.vue` 中可以组合 `<script>`、`<template>`、`<style>`，由构建工具编译。

**高频问答：Vue 是 MVVM 吗？** 可用 MVVM 帮助理解状态驱动视图，但 Vue 不要求严格的 MVVM 架构；项目的业务分层应根据实际情况设计。Vue 3 的 Options API 和 Composition API 都是受支持的开发方式。

## 2. 模板、指令与绑定

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const keyword = ref('')
const items = ref(['Vue', 'TypeScript', 'Vite'])
const results = computed(() =>
  items.value.filter(item => item.toLowerCase().includes(keyword.value.toLowerCase()))
)

function remove(item: string) {
  items.value = items.value.filter(value => value !== item)
}
</script>

<template>
  <input v-model.trim="keyword" placeholder="搜索" />
  <p v-if="results.length === 0">暂无结果</p>
  <ul v-else>
    <li v-for="item in results" :key="item">
      <span>{{ item }}</span>
      <button type="button" @click="remove(item)">删除</button>
    </li>
  </ul>
</template>
```

| 写法 | 作用 | 易错点 |
| --- | --- | --- |
| `{{ expr }}` | 文本插值 | 内容会按文本转义；不是任意 HTML |
| `:disabled="busy"` | `v-bind` 动态绑定 | 不要把布尔值写成字符串字面量 |
| `@click="submit"` | `v-on` 事件监听 | `@click="submit()"` 也是合法的表达式 |
| `v-if` / `v-else` | 条件创建或移除子树 | 频繁切换时有挂载/卸载开销 |
| `v-show` | 切换 `display` | 元素仍在 DOM 中；不支持 `<template>` |
| `v-for` + `:key` | 列表渲染与节点复用身份 | 变化顺序的列表避免使用索引作 key |
| `v-model` | 表单双向绑定语法糖 | 对组件而言是 prop + update 事件协议 |
| `v-html` | 插入原始 HTML | **不要直接注入不可信内容，会有 XSS 风险** |

**面试常问：`v-if` 和 `v-show` 怎么选？** 初始条件经常为假、切换较少选 `v-if`；高频显隐且 DOM 体量可接受时可考虑 `v-show`。性能结论应结合测量，别绝对化。

## 3. 计算属性、方法、侦听器的职责

| 需求 | 首选 | 原因 |
| --- | --- | --- |
| 从响应式状态派生值 | `computed` | 按依赖缓存，只有依赖变化后才需要重新计算 |
| 由事件触发行为 | 函数 / 方法 | 显式触发易理解 |
| 状态变化时执行副作用 | `watch` / `watchEffect` | 可发送请求、同步外部系统或清理副作用 |

```ts
import { ref, computed, watch } from 'vue'
const price = ref(100)
const quantity = ref(2)
const total = computed(() => price.value * quantity.value)

watch(quantity, (newValue, oldValue) => {
  console.log('数量变化', oldValue, '→', newValue)
})
```

**易错点：** `computed` getter 应尽量保持纯粹，避免在 getter 中发请求、改其他响应式数据；`watch` 默认非立即执行，`immediate: true` 可在创建时执行一次。更多请见 [CompositionAPI](./CompositionAPI.md)。

## 4. 组件设计与数据流

- 父组件通过 **Props** 下发数据，子组件通过 **Emits** 告知交互；不要直接修改 Props。
- 跨层级可使用 `provide/inject`，跨页面共享业务状态可使用 Pinia；不是所有状态都要进入全局 Store。
- **插槽**是父组件把内容/渲染结构交给子组件的一种复用机制，作用域插槽通过 slot props 把子组件数据提供给父组件的插槽内容。
- 在 `<script setup>` 中使用 `defineProps`、`defineEmits` 等编译宏，不需要从 `vue` 导入它们。

```vue
<!-- CounterButton.vue -->
<script setup lang="ts">
const props = defineProps<{ count: number }>()
const emit = defineEmits<{ increment: [] }>()
</script>

<template>
  <button @click="emit('increment')">已点击 {{ props.count }} 次</button>
</template>
```

## 5. 容易踩的基础坑

1. **数据更新后立刻读 DOM**：响应式状态是同步改的，组件 DOM 更新通常在下一个调度周期。使用 `await nextTick()` 等待本轮 DOM 更新。
2. **列表不稳定的 key**：删除、重排包含输入框或组件本地状态的列表时，索引 key 可能导致状态被复用到错误的项。
3. **对象解构丢失追踪**：把 `reactive()` 对象的基本类型字段直接解构为普通变量可能失去响应式联系；考虑 `toRef` / `toRefs`。
4. **错误地以为 `<style scoped>` 完全隔离**：它通过编译后的选择器限定范围，不等于 Shadow DOM；涉及深度选择器时需了解作用范围。
5. **把所有逻辑塞进组件**：请求、校验、复杂数据转换应该抽取 composable、服务层或独立函数。

## 6. 高频面试自测

- [ ] Vue 的声明式渲染与手动 DOM 操作有什么区别？
- [ ] `v-if`、`v-show`、`v-for` 分别解决什么问题？`key` 为什么重要？
- [ ] `computed`、`watch`、普通函数分别适合什么情况？
- [ ] 为什么 Props 推荐单向数据流？组件 `v-model` 如何工作？
- [ ] 修改响应式数据后，什么时候适合 `nextTick()`？
- [ ] 在实际管理系统中，你会如何拆分表格、筛选表单与接口请求逻辑？

## 7. 关联专题与参考

- [Vue2 与 Vue3 的区别](./Vue2与Vue3区别.md)
- [Composition API](./CompositionAPI.md)
- [组件通信](./组件通信.md)
- [Vue 性能优化](./Vue性能优化.md)
- [Vue 官方指南](https://cn.vuejs.org/guide/introduction.html)

> 复习标准：不看笔记解释上述问题，并能独立写出一个包含表单、计算属性和事件的组件。
