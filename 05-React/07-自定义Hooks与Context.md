# 自定义 Hooks 与 Context：如何复用逻辑和共享数据？

> 自定义 Hook 解决“逻辑重复”，Context 解决“跨层级传数据”。它们用途不同，可以配合使用，但不能互相替代。

## 一、为什么需要自定义 Hook？⭐⭐⭐

多个组件可能都需要监听窗口大小、读取登录状态、管理分页或订阅数据。如果每个组件都重复写一遍，代码会越来越难维护。

可以把这段有状态逻辑抽成自定义 Hook：

~~~jsx
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);

  return { count, increment, decrement };
}
~~~

组件中使用：

~~~jsx
function CounterPanel() {
  const { count, increment, decrement } = useCounter(10);
  return (
    <>
      <p>{count}</p>
      <button onClick={increment}>增加</button>
      <button onClick={decrement}>减少</button>
    </>
  );
}
~~~

## 二、自定义 Hook 的特点

- 名称通常以 `use` 开头。
- 可以调用其他 Hooks。
- 负责复用逻辑，而不是必须返回 UI。
- 每个组件调用自定义 Hook 时，通常拥有自己的 State。
- 如果多个组件需要共享同一份状态，需要 Context、外部状态库或其他共享机制。

**易错点：** 两个组件都调用 `useCounter()`，并不意味着它们会得到同一个 count。它们只是复用了同一套逻辑。

## 三、Context 是什么？⭐⭐⭐

当数据需要从很深的父组件传给子组件时，如果每一层都只负责转发 props，会出现 Props Drilling（属性层层传递）。

Context 可以让组件树中的后代组件读取上层 Provider 提供的数据。

常见场景：当前登录用户信息、主题、国际化语言，以及一些跨多个页面或组件的配置。

## 四、Context 基本用法

~~~jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");

function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div className={theme}>工具栏</div>;
}

function App() {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={theme}>
      <Toolbar />
      <button onClick={() => setTheme("dark")}>切换主题</button>
    </ThemeContext.Provider>
  );
}
~~~

较新版本 React 也支持 `<ThemeContext value={theme}>` 这种 Provider 写法；传统 `.Provider` 写法仍然常见。具体根据项目 React 版本和代码规范使用。

## 五、Context 更新会发生什么？

当 Provider 的 value 发生变化时，读取该 Context 的消费者会收到更新。

如果每次渲染都创建一个新的对象：

~~~jsx
<AuthContext.Provider value={{ user, logout }}>
  {children}
</AuthContext.Provider>
~~~

即使 user 没变，这个对象引用也可能每次不同，导致消费者收到不必要的 Context 更新。

可以在有实际性能问题时稳定 value：

~~~jsx
const value = useMemo(() => ({ user, logout }), [user, logout]);

return (
  <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
);
~~~

不要为了优化而无条件堆叠 memo；先观察实际渲染情况。

## 六、Context 不是万能状态管理工具

Context 适合共享相对稳定、跨层级的数据，但如果把高频变化的大量业务状态全部放进一个 Context，可能造成很多消费者跟着更新，维护也会变复杂。

| 需求 | 可以考虑 |
|---|---|
| 组件内部使用 | useState |
| 兄弟组件共享 | 状态提升 |
| 跨层级共享主题、用户等 | Context |
| 复杂状态转换 | useReducer |
| 大型业务、多模块共享 | Zustand、Redux Toolkit 等外部状态方案 |

## 七、Context + useReducer

复杂状态可以用 reducer 统一管理，再通过 Context 向下提供 state 和 dispatch。

~~~jsx
const CartContext = createContext(null);

function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);

  return (
    <CartContext.Provider value={{ cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const value = useContext(CartContext);
  if (value === null) {
    throw new Error("useCart 必须在 CartProvider 内使用");
  }
  return value;
}
~~~

这是一种常见的轻量共享状态组织方式。

## 八、面试重点与自测

- [ ] 自定义 Hook 解决什么问题？
- [ ] 自定义 Hook 是否天然共享 State？
- [ ] 什么是 Props Drilling？
- [ ] Context 的基本工作方式是什么？
- [ ] Context value 变化会影响哪些组件？
- [ ] 为什么不建议把所有状态都放进一个 Context？
- [ ] Context 与 Redux / Zustand 有什么区别？
- [ ] Context + useReducer 适合什么场景？

## 九、参考资料

- [React：Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React：Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React：useContext](https://react.dev/reference/react/useContext)

---
**学习标准：** 能判断何时抽自定义 Hook、何时使用 Context，并能解释它们与状态共享的区别。
