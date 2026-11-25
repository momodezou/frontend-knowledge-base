# 虚拟 DOM 与 Fiber：React 如何高效更新页面？

> 虚拟 DOM 是对 UI 结构的描述；Fiber 是 React 内部组织和调度渲染工作的数据结构。它们相关，但不是同一个概念。

## 一、什么是虚拟 DOM？⭐⭐⭐

浏览器真实 DOM 是页面节点对象。React 通常先根据组件返回的 JSX 生成 React Element（常被通俗称为虚拟 DOM 描述），再协调新旧结构，决定真实 DOM 需要做哪些更新。

~~~jsx
const element = <h1 className="title">Hello</h1>;
~~~

可以把它理解为一份“页面施工说明”，描述希望页面长成什么样，而不是页面本身。

**注意：** 虚拟 DOM 并不意味着一定比手写 DOM 更快。它提供声明式编程和可预测的更新模型，实际性能还取决于组件结构、更新范围和实现策略。

## 二、React 更新 UI 的基本思路

1. 组件根据 Props、State、Context 生成新的元素描述。
2. React 对比新旧树，进行协调（Reconciliation）。
3. 判断哪些节点需要新增、删除或更新。
4. 提交阶段把必要变更应用到真实 DOM 或其他宿主环境。

## 三、Diff / Reconciliation 的关键规则 ⭐⭐⭐

React 不会简单地把整棵真实 DOM 全部删除重建，而是通过启发式规则协调新旧元素。

- 不同类型的元素通常会被视为不同节点，旧子树可能被卸载，新子树重新创建。
- 相同类型的元素通常会被复用，并更新变化的属性。
- 列表中的 key 帮助 React 识别同级元素身份。

### 为什么 key 很重要？

~~~jsx
items.map((item) => <Todo key={item.id} todo={item} />);
~~~

如果列表发生插入、删除或排序，稳定 key 能让 React 知道某个 Todo 还是原来的 Todo，而不是仅仅因为位置相同就认为它是同一个。

使用 index 作为 key，在列表会重排或插入删除时可能导致组件状态错位。

## 四、什么是 Fiber？⭐⭐⭐

Fiber 是 React 内部表示工作单元和组件树关系的数据结构，也支撑 React 对渲染工作的调度。

通俗理解：
- 虚拟 DOM 更像“要呈现什么内容”的描述。
- Fiber 更像“React 如何组织、推进和安排这些更新工作”的内部工作记录。

Fiber 节点会保存组件类型、Props、State、父子兄弟关系、更新队列和副作用等相关信息。具体字段属于内部实现，可能随版本变化。

## 五、为什么需要 Fiber？

传统同步递归渲染在大型组件树中可能占用主线程较长时间，用户输入和动画就容易卡顿。

Fiber 架构让 React 能把部分渲染工作拆成更小单元，并结合调度策略决定优先级。在并发渲染能力下，部分 render 工作可以被暂停、继续或放弃，以便优先响应更紧急的更新。

**重要：** 可中断的是 render/reconciliation 工作；commit 阶段需要一致地应用变更，不会像 render 一样随意中断。

## 六、Render 阶段与 Commit 阶段

### Render / Reconciliation 阶段

- 根据新 Props、State 计算 UI。
- 协调新旧 Fiber 树。
- 确定需要提交的变更。
- 在支持的调度模式下，工作可能被暂停、重启或放弃。

这一阶段应保持纯净，不要直接修改外部变量、操作 DOM 或发送请求。

### Commit 阶段

- 把确定的变更应用到真实 DOM 或其他宿主环境。
- 处理相关生命周期和 Effect 调度。
- 更新完成后，浏览器才有机会绘制新的页面。

## 七、并发渲染不是多线程

React Concurrent Rendering 主要是调度和可中断工作模型，不代表 React 自动把组件渲染放到多个 CPU 线程并行执行。

例如 useTransition 可以把某些更新标记为非紧急，让更紧急的输入响应先处理：

~~~jsx
const [isPending, startTransition] = useTransition();

function handleChange(value) {
  setInput(value);
  startTransition(() => setSearchQuery(value));
}
~~~

## 八、面试重点与自测

- [ ] 什么是虚拟 DOM？它解决什么问题？
- [ ] React 为什么需要协调（Reconciliation）？
- [ ] key 在 Diff 中有什么作用？
- [ ] 什么是 Fiber？它和虚拟 DOM 是同一个东西吗？
- [ ] Fiber 为什么有利于调度渲染工作？
- [ ] Render 阶段和 Commit 阶段有什么区别？
- [ ] 并发渲染是否意味着多线程？
- [ ] 为什么 Render 阶段不能产生不可控副作用？

## 九、参考资料

- [React：Render and Commit](https://react.dev/learn/render-and-commit)
- [React：Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)
- [React：useTransition](https://react.dev/reference/react/useTransition)

---
**学习标准：** 能解释虚拟 DOM、协调、Fiber、Render 和 Commit 的关系，避免把 Fiber 说成真实 DOM 或多线程引擎。
