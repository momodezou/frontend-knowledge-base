# 虚拟 DOM 与 Diff：Vue 3 渲染和更新机制

> 学习定位：中高级前端高频。目标是把模板编译、VNode、patch、keyed diff、scheduler 串成一条完整路径，而不是机械背双端指针。

## 1. 什么是虚拟 DOM（VNode）？

Vue 的 VNode 是一种用 JavaScript 对象表示 UI 节点及其属性、子节点、组件关系的数据结构。它本身**不是浏览器 DOM**。

通常的更新路线是：

```text
.vue template
  ↓ 编译为 render 函数（可能在构建期）
render(state) → 新的 VNode 树
  ↓
patch(旧 VNode, 新 VNode)
  ↓ 比较需要更新的部分
宿主 DOM 的创建 / 更新 / 移除
```

**面试高频：虚拟 DOM 一定比直接 DOM 快吗？** 不是。对于已知的简单 DOM 操作，直接命令式修改可能更轻；虚拟 DOM 的价值在于提供声明式、跨平台与组件化更新模型，配合编译器静态分析减少实际工作量。Vue 的性能还来自静态提升、Patch Flags、Block Tree 等优化。

## 2. Vue 3 中组件更新的一般流程

1. 组件初次渲染时运行 render，读取响应式依赖并创建 VNode。
2. 当依赖发生变化，响应式系统触发相关组件更新 effect。
3. 调度器对同一轮重复更新进行合并、排序与刷新。
4. 重新执行 render，生成新的 VNode 结构。
5. `patch` 比较新旧 VNode，并执行必要的宿主操作。
6. 更新完成后，在约定时点触发生命周期钩子、更新相关观察者等。

**简化说明**：具体调度、父子组件时序和异步组件行为比上述描述复杂，不能断言所有变更都会导致整个页面重新渲染。

## 3. Key 的意义：表达“同一个节点是谁”

```vue
<template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">
      <input :value="todo.title" />
    </li>
  </ul>
</template>
```

`key` 帮助 Diff 在列表增删重排时识别稳定的逻辑身份。使用索引作为 key 的问题不是“Vue 一定无法更新”，而是当列表顺序变化、子节点包含输入状态或组件实例时，可能把旧状态复用给不正确的数据项。

| key 选择 | 典型情况 | 建议 |
| --- | --- | --- |
| 数据库 ID / 唯一业务 ID | 稳定且唯一 | 优先 |
| 数组索引 | 静态、不重排列表 | 可接受但应了解限制 |
| `Math.random()` | 每次渲染都变化 | 避免；会破坏复用导致反复创建 |
| 不唯一的业务字段 | 可能重复 | 避免；同一兄弟列表里需要唯一 |

## 4. Keyed Diff：Vue 3 如何处理列表变化

对于带 key 的子节点列表，Vue 3 的相关处理可以概括为：

1. **从头同步**：尽可能比较开头相同的节点。
2. **从尾同步**：尽可能比较结尾相同的节点。
3. **处理纯新增 / 纯删除**：一端遍历完时，可以直接挂载或卸载剩余节点。
4. **处理中间未知序列**：建立新节点 key 到索引的映射，对旧节点寻找可复用的新节点并 patch；对不能复用的节点删除。
5. **尽量少移动**：通过最长递增子序列（LIS）找出可以保持相对顺序的节点，移动其余需要移动的节点。

**为什么出现 LIS？** 假设新节点已经按新位置编号，将可复用旧节点映射到新索引序列，LIS 对应那些可以按顺序保留、不必移动的节点，有助于减少 DOM 移动次数。

**注意**：这是 Vue 3 的 keyed children 更新策略的概括；不能直接把所有 Vue 版本、所有不同的 children 形态都称为同一个“Diff 算法”。Vue 2 的经典双端比较策略与 Vue 3 的实现细节不完全相同。

## 5. 编译优化：Patch Flags、Block Tree、静态提升

Vue 3 的编译器能判断模板的哪部分可能变化，以便 runtime 少做无谓工作。

```vue
<template>
  <div class="card">
    <h2>用户信息</h2>
    <p>{{ user.name }}</p>
  </div>
</template>
```

- **静态提升（hoistStatic）**：静态节点或属性对象可在适用时被提升，避免重复创建。
- **Patch Flags**：编译器把可能变更的信息标记到 VNode，运行时更有针对性地更新文本、class、style、props 等。
- **Block Tree**：收集动态后代，减少全树遍历的必要性；不意味着永远不需要 Diff。
- **Fragment**：允许组件具有多个根节点，不必为满足模板语法人为增加包裹层。

**面试回答要点：** Vue 3 的性能优化不只依赖“更快的 Diff”，更重要的是编译器提供了动态变化的提示，让运行时知道哪些部分值得检查。

## 6. `nextTick()`、批处理与 DOM 一致性

```vue
<script setup lang="ts">
import { ref, nextTick } from 'vue'
const title = ref('旧标题')
async function change() {
  title.value = '新标题'     // 数据同步变化
  await nextTick()            // 等待本轮组件 DOM 更新
  console.log('DOM 已按本轮更新完成')
}
</script>
<template><h2>{{ title }}</h2><button @click="change">更新</button></template>
```

- 多次同步状态改变可以被批处理成更少的 DOM 更新。
- `nextTick` 不是固定延时；也不保证图片、字体、网络请求或动画全部完成。
- 组件 `onUpdated` 可能响应多个状态变化而触发；在其中无条件改状态会有无限更新风险。

## 7. 常见问题与误区

- ❌ “没有虚拟 DOM 就不能做响应式” → ✅ 响应式系统与 DOM 更新策略是不同层次。
- ❌ “key 只为了避免控制台警告” → ✅ key 表示节点身份，对状态复用具有语义影响。
- ❌ “每次状态变化都会重新创建全部真实 DOM” → ✅ 组件 render 可能重新执行，但 patch 会复用并最小化宿主修改。
- ❌ “LIS 能保证所有更新都是 O(n)” → ✅ 一般 keyed diff 仍有其他遍历和查找，LIS 本身通常是 O(n log n)；实际复杂度取决于具体路径。
- ❌ “模板编译与虚拟 DOM 完全没关系” → ✅ Vue 模板通常编译到可创建 VNode 的渲染函数。

## 8. 面试自测

- [ ] VNode 与浏览器真实 DOM 有什么区别？
- [ ] 数据更新到 DOM 更新的主要步骤是什么？
- [ ] `key` 为什么不能随意使用随机值？
- [ ] Vue 3 keyed diff 的双端同步、key 映射和 LIS 分别解决什么问题？
- [ ] Patch Flags 与 Block Tree 有什么作用？
- [ ] 为什么不应武断地说“虚拟 DOM 一定比原生 DOM 快”？

## 9. 参考

- [Vue 渲染机制](https://cn.vuejs.org/guide/extras/rendering-mechanism.html)
- [Vue 核心源码](https://github.com/vuejs/core)
- [响应式原理](./响应式原理.md)
- [Vue 性能优化](./Vue性能优化.md)
