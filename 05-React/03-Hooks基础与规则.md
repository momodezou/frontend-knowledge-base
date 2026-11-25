# React Hooks：让函数组件使用 React 能力

> Hooks 是一组特殊函数，让函数组件可以使用状态、上下文、引用和副作用等 React 能力。它们不是普通工具函数，调用位置有明确规则。

## 一、为什么需要 Hooks？⭐⭐⭐

早期 React 主要通过 Class 组件使用 State 和生命周期。Hooks 出现后，函数组件也能使用这些能力，并且可以把相关逻辑抽成可复用的自定义 Hook。

| Hook | 主要作用 |
|---|---|
| useState | 保存组件状态 |
| useEffect | 与外部系统同步 |
| useMemo | 缓存计算结果 |
| useCallback | 缓存函数定义 |
| useRef | 保存不直接驱动渲染的值或 DOM 引用 |
| useContext | 读取 Context |
| useReducer | 用 reducer 组织复杂状态更新 |
| useTransition | 将部分状态更新标记为非阻塞 |
| useDeferredValue | 延后更新非紧急值 |

## 二、Hooks 的两条核心规则 ⭐⭐⭐

### 规则一：只在函数组件或自定义 Hook 的顶层调用

不要在条件、循环、普通嵌套函数中调用 Hook：

~~~jsx
// 错误示例
function User({ loggedIn }) {
  if (loggedIn) {
    const [name, setName] = useState("");
  }
  return null;
}
~~~

正确写法：

~~~jsx
function User({ loggedIn }) {
  const [name, setName] = useState("");
  if (!loggedIn) return <p>请登录</p>;
  return <p>{name}</p>;
}
~~~

原因：React 需要按稳定的调用顺序关联每次渲染中的 Hook 状态。条件调用会让顺序发生变化。

### 规则二：只在 React 函数组件或自定义 Hook 中调用

普通 JavaScript 函数不能随意调用 `useState`、`useEffect` 等 Hook。

## 三、为什么 Hook 必须保持调用顺序？

可以把 Hooks 理解成 React 按调用顺序维护的一组状态槽位。每次渲染都必须保持相同顺序，否则后续状态可能对应错位置。

这就是为什么不能把 Hook 放进 if、for 或条件表达式中。

## 四、什么是自定义 Hook？

自定义 Hook 是以 `use` 开头的函数，用来复用有状态的 React 逻辑。

~~~jsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}
~~~

组件中使用：

~~~jsx
function Page() {
  const width = useWindowWidth();
  return <p>窗口宽度：{width}</p>;
}
~~~

**注意：** 自定义 Hook 复用的是逻辑，不会自动让多个调用共享同一份 State。每个组件调用它时，通常拥有独立的 Hook 状态。

## 五、useRef 与 useState 的区别

- 修改 State 会触发组件重新渲染。
- 修改 `ref.current` 不会触发组件重新渲染。
- ref 常用于保存 DOM 节点、定时器 ID、上一次值等。

如果一个值变化后需要更新页面，应优先考虑 State，而不是 ref。

## 六、useReducer 适合什么场景？

当状态更新逻辑较复杂，或者多个操作都要按统一规则更新状态时，可以使用 reducer：

~~~jsx
function reducer(state, action) {
  switch (action.type) {
    case "increment": return { count: state.count + 1 };
    case "reset": return { count: 0 };
    default: return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>增加</button>
      <button onClick={() => dispatch({ type: "reset" })}>重置</button>
    </>
  );
}
~~~

reducer 应保持纯函数：根据旧状态和 action 计算新状态，不在里面请求接口、修改 DOM 或直接改旧对象。

## 七、开发环境中的 StrictMode

React StrictMode 会在开发环境执行额外检查，例如额外调用组件渲染逻辑，或对 Effect 执行额外的 setup/cleanup 检查，以帮助发现不纯逻辑和清理问题。

这不代表生产环境会无缘无故把页面渲染两遍。正确做法是让渲染保持纯净、Effect 能正确清理，而不是简单删除 StrictMode 来掩盖问题。

## 八、面试重点与自测

- [ ] Hooks 解决了什么问题？
- [ ] Hooks 的两条核心规则是什么？
- [ ] 为什么不能在条件语句中调用 Hook？
- [ ] 自定义 Hook 的命名有什么要求？
- [ ] 自定义 Hook 是否会让多个组件共享同一份 State？
- [ ] useRef 和 useState 有什么区别？
- [ ] useReducer 适合什么场景？
- [ ] 为什么 StrictMode 下开发环境可能看到 Effect 执行额外一轮？

## 九、参考资料

- [React：Built-in Hooks](https://react.dev/reference/react/hooks)
- [React：Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [React：Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---
**学习标准：** 能解释 Hooks 的用途、调用规则，并能判断何时使用 State、Ref、Reducer 或自定义 Hook。
