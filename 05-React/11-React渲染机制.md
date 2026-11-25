# React 渲染机制：组件什么时候重新执行？

> React 的渲染可以理解为：根据当前 Props、State 和 Context 重新计算 UI，再把必要变化提交到页面。组件函数执行不等于浏览器一定发生了真实 DOM 修改。

## 一、什么是 Render？⭐⭐⭐

当 React 需要更新界面时，会调用相关组件，读取 Props、State 和 Context，生成新的 React Element 描述。

~~~jsx
function Greeting({ name }) {
  console.log("组件函数执行");
  return <h1>你好，{name}</h1>;
}
~~~

组件函数执行，说明发生了 render 计算；但如果新旧结果没有实际差异，React 可能不需要修改对应 DOM。

## 二、什么情况下会触发重新渲染？

常见原因：

1. 组件自身 State 更新。
2. 父组件重新渲染，子组件通常也会重新执行（除非满足跳过更新的优化条件）。
3. 组件读取的 Context value 变化。
4. 外部 Store 通过订阅机制通知组件更新。

Props 变化通常伴随父组件渲染和新 Props 传递，但不要把“Props 改变”理解成唯一触发条件。

## 三、Render 和 Commit 两个阶段 ⭐⭐⭐

### Render 阶段

React 计算下一份 UI，协调新旧结构，确定需要做什么更新。

Render 过程应该保持纯净，因为 React 可能多次调用组件函数，也可能在并发场景下暂停或放弃某次 render 工作。

### Commit 阶段

React 把需要的变更应用到宿主环境（浏览器中通常是真实 DOM），并安排相关 Effect。

**面试记忆：Render 是计算要显示什么；Commit 是把确定的变化应用出去。**

## 四、组件函数执行几次，DOM 就更新几次吗？

不是。

组件函数可能执行，但如果输出没有变化，React 不一定修改真实 DOM。此外，React 开发环境 StrictMode 可能额外调用组件函数，帮助发现不纯的渲染逻辑。

不要用 `console.log` 次数直接推断 DOM 更新次数。需要结合 React DevTools Profiler 和浏览器 Performance 分析。

## 五、State 更新与渲染

~~~jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((prev) => prev + 1)}>
      {count}
    </button>
  );
}
~~~

调用 setter 后，React 安排更新。新一轮渲染会拿到新 State，再决定是否需要提交 DOM 变化。

如果更新值与当前值相同（按 React 的比较规则），React 通常可以跳过后续工作，但不能把这当成业务逻辑的控制手段。

## 六、列表中的组件身份与 State 保留

React 会结合元素类型、所在位置和 key 判断组件是否是原来的组件。

如果列表 key 不稳定，可能导致输入框内容或子组件 State 跟着错误的项目移动。

如果希望切换用户时重置编辑表单，可以通过 key 明确表达新身份：

~~~jsx
<UserEditor key={user.id} user={user} />
~~~

## 七、React 事件与更新

事件处理函数通常在用户交互时执行，里面可以调用 State setter。React 会协调这些更新并在合适时机提交。

不要在组件渲染过程中直接执行会改变外部世界的逻辑，例如：

~~~jsx
// 不推荐：render 每次执行都修改外部状态
function Page() {
  document.title = "页面";
  return <h1>首页</h1>;
}
~~~

可以把与浏览器外部系统同步的逻辑放到合适的 Effect 中：

~~~jsx
useEffect(() => {
  document.title = title;
}, [title]);
~~~

## 八、面试重点与自测

- [ ] React 重新渲染是什么意思？
- [ ] 哪些情况会触发组件重新渲染？
- [ ] 组件函数执行是否代表真实 DOM 一定变化？
- [ ] Render 和 Commit 有什么区别？
- [ ] 为什么 Render 阶段必须保持纯净？
- [ ] StrictMode 为什么可能额外调用组件？
- [ ] React 如何判断组件身份并保留 State？
- [ ] 如何分析组件是否发生了不必要的渲染？

## 九、参考资料

- [React：Render and Commit](https://react.dev/learn/render-and-commit)
- [React：Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
- [React：StrictMode](https://react.dev/reference/react/StrictMode)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)

---
**学习标准：** 能从 State 更新讲到 Render、协调和 Commit，并能解释组件执行与真实 DOM 更新的区别。
