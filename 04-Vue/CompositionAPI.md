# Composition API：核心用法、易错点与可复用逻辑

> 学习定位：面试高频；理解 `ref` / `reactive` / `computed` / `watch` / `watchEffect` / composable，优先掌握边界，再记语法。

## 1. `setup` 与 `<script setup>`

Composition API 让相关的状态、副作用、函数组织在一起。

- `setup()` 是组件中配置组合式逻辑的入口；在其中不能依赖组件 Options API 的 `this`。
- `<script setup>` 是编译语法糖：顶层声明在模板可直接使用，`defineProps`、`defineEmits`、`defineExpose` 等是编译宏。
- 组件内创建的同步 watcher 通常会在组件卸载时自动停止；异步回调中**延后创建**的 watcher 要关注手动停止。

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
function increment() { count.value++ }
</script>

<template>
  <button @click="increment">{{ count }} / {{ doubled }}</button>
</template>
```

**易错点**：模板中顶层 `ref` 通常可自动解包，JavaScript/TypeScript 中仍需 `.value`。这不是“任何场景都自动解包”。

## 2. `ref` 与 `reactive` 如何选择

| 情况 | 建议 | 原因 |
| --- | --- | --- |
| 数字、字符串、布尔值、可能整体替换的值 | `ref()` | `.value` 保持稳定的响应式容器 |
| 若干紧密关联字段的对象 | `reactive()` / `ref({})` | 按团队约定与更新方式选择 |
| 大对象只关心整体引用更换 | `shallowRef()` | 避免不必要的深度代理成本 |
| 只读派生状态 | `computed()` | 用声明式派生代替重复赋值 |

```ts
import { reactive, toRef, toRefs, ref } from 'vue'

const state = reactive({ keyword: '', page: 1 })
const page = toRef(state, 'page')
const { keyword } = toRefs(state)

page.value++        // 与 state.page 保持关联
keyword.value = 'vue'

const selectedId = ref<number | null>(null)
selectedId.value = 12
```

**典型误区：**

```ts
const state = reactive({ count: 0 })
let { count } = state        // count 是普通 number
state.count++               // count 不会同步变为 1

// 不要通过重赋值原变量来更新 reactive 对象：
// let form = reactive({ name: 'A' })
// form = reactive({ name: 'B' }) // 旧对象的依赖并不会自动迁移到新对象
```

**补充**：嵌套在深层 `reactive` 对象中的 ref 会有解包行为；`reactive` 数组和 Map 集合的元素通常不自动解包 ref。详见 [响应式原理](./响应式原理.md)。

## 3. `computed` 与 `watch`、`watchEffect`

| API | 是否缓存 | 依赖来源 | 使用场景 |
| --- | --- | --- | --- |
| `computed` | 是 | getter 访问的响应式值 | 同步派生值、筛选、汇总 |
| `watch` | 不作为派生值缓存 | 明确指定来源 | 请求、记录日志、字段联动；需新旧值时 |
| `watchEffect` | 不作为派生值缓存 | 同步执行时访问到的响应式值 | 简单自动追踪的副作用 |

```ts
import { ref, computed, watch, watchEffect } from 'vue'

const search = ref('')
const normalized = computed(() => search.value.trim().toLowerCase())

watch(search, (next, prev) => {
  console.log('输入变化', { next, prev })
}, { flush: 'post' })

watchEffect(() => {
  console.log('当前搜索条件', normalized.value)
})
```

**常见坑：**

- `watch(obj.count, cb)` 把当前数值传给 `watch`，无法追踪；应写 `watch(() => obj.count, cb)`。
- `watch(reactiveObject, cb)` 通常隐式深度侦听；直接传 getter 时默认更偏向比较返回值是否变化，需要时显式配置 `deep`。
- 深层变化触发回调时，`newValue` 与 `oldValue` 可能**是同一个对象引用**，并不是自动生成的历史快照。
- `watchEffect(async () => { await ...; use(x.value) })` 只会自动追踪**第一个 `await` 之前**同步访问的响应式依赖。
- 默认回调调度通常在父组件更新之后、当前组件 DOM 更新之前；依赖更新后的 DOM 时用 `flush: 'post'` 或 `nextTick()`。

## 4. 异步请求：取消过时副作用

```ts
import { ref, watch } from 'vue'
const keyword = ref('')
const results = ref<string[]>([])

watch(keyword, async (query, _old, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    results.value = await response.json() as string[]
  } catch (err) {
    if (!(err instanceof DOMException && err.name === 'AbortError')) {
      console.error(err)
    }
  }
}, { immediate: true })
```

上面展示的是**监听器回调参数 `onCleanup`** 的用法。Vue 3.5+ 还支持 `onWatcherCleanup()`，但该 API 必须在 watcher 回调的同步执行阶段调用，不能放在 `await` 后面。真实项目还应设计 loading/error/空态，并验证接口返回数据结构。

## 5. `provide/inject`、`readonly`、`shallowRef`

- `provide/inject` 适合祖先与深层后代之间的上下文共享，如表单上下文、主题、表格列上下文；团队可使用 `InjectionKey<T>` 增强类型安全。
- 如希望下游**只读**共享状态，可对提供的响应式对象使用 `readonly()`，把修改入口提供为函数。
- `shallowRef` 只追踪 `.value` 更换，适合大型不可变列表或第三方实例；深层原地修改不会自动触发更新，必要时更换引用或 `triggerRef`。

```ts
import { shallowRef } from 'vue'
const rows = shallowRef([{ id: 1, label: 'A' }])
rows.value = [...rows.value, { id: 2, label: 'B' }] // 触发更新
```

## 6. Composable：把业务逻辑从组件抽出来

```ts
// composables/usePagination.ts
import { ref, computed } from 'vue'

export function usePagination(pageSize = 10) {
  const page = ref(1)
  const size = ref(pageSize)
  const offset = computed(() => (page.value - 1) * size.value)
  function reset() { page.value = 1 }
  return { page, size, offset, reset }
}
```

```vue
<script setup lang="ts">
import { usePagination } from '@/composables/usePagination'
const { page, offset, reset } = usePagination(20)
</script>

<template>
  <button @click="page++">下一页</button>
  <button @click="reset">重置</button>
  <p>offset: {{ offset }}</p>
</template>
```

**设计判断**：composable 是复用**有状态逻辑**，不是所有纯工具函数都要写成 `useXxx`。涉及浏览器事件、定时器、订阅、第三方实例时要注意生命周期清理与 SSR 运行环境。

## 7. 高频面试与自测

- [ ] `ref` 和 `reactive` 为什么都存在？哪些地方需要 `.value`？
- [ ] 为什么 `reactive` 解构可能丢失响应式？
- [ ] `computed` 和 `watch` 有什么本质区别？
- [ ] `watchEffect` 的依赖追踪范围是什么？
- [ ] 如何处理快速连续输入导致的接口请求竞争？
- [ ] 什么时候应该用 composable，什么时候用 Pinia？

## 8. 参考资料

- [Vue Composition API FAQ](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 响应式基础](https://cn.vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Vue 侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)
- [响应式原理](./响应式原理.md)
