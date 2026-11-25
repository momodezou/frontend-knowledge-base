# useMemo 与 useCallback：React 中的性能缓存

> 两者都用于缓存，但缓存的东西不同：useMemo 缓存计算结果，useCallback 缓存函数定义。它们是性能优化工具，不是保证业务正确性的工具。

## 一、为什么需要缓存？⭐⭐⭐

组件重新渲染时，函数体会重新执行。复杂计算可能重复运行；每次创建的新对象或函数，也可能让依赖浅比较的子组件认为 props 变了。

~~~jsx
function ProductList({ products, keyword }) {
  const result = products.filter((item) => item.name.includes(keyword));
  return <List items={result} />;
}
~~~

每次渲染都会重新过滤。数据量很大时，可以考虑缓存计算结果。

## 二、useMemo：缓存计算结果

~~~jsx
const visibleProducts = useMemo(() => {
  return products.filter((item) => item.name.includes(keyword));
}, [products, keyword]);
~~~

依赖没有变化时，React 可以复用上一次计算结果；依赖变化时重新计算。

适合：
- 计算成本较高的筛选、排序、统计。
- 需要保持对象或数组引用稳定，避免下游不必要更新。
- 配合 memo 优化子组件 props。

不要为了每个简单表达式都加 useMemo，缓存本身也有维护成本。

## 三、useCallback：缓存函数定义

~~~jsx
const handleDelete = useCallback((id) => {
  setItems((prev) => prev.filter((item) => item.id !== id));
}, []);
~~~

适合把回调传给使用 `memo` 的子组件，或者作为其他 Hook 的依赖时，需要保持函数引用稳定的场景。

`useCallback(fn, deps)` 可以理解为缓存函数本身，而不是执行函数的结果。

## 四、两者的区别 ⭐⭐⭐

| 对比 | useMemo | useCallback |
|---|---|---|
| 缓存对象 | 计算结果 | 函数定义 |
| 常见用途 | 避免重复计算 | 避免函数引用频繁变化 |
| 返回值 | 缓存的值 | 缓存的函数 |
| 典型配合 | 复杂计算、memo 子组件 | memo 子组件、Hook 依赖 |

## 五、配合 memo 使用

~~~jsx
import { memo, useCallback, useState } from "react";

const Child = memo(function Child({ onAdd }) {
  console.log("Child render");
  return <button onClick={onAdd}>增加</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState("light");

  const handleAdd = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  return (
    <div className={theme}>
      <p>{count}</p>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        切换主题
      </button>
      <Child onAdd={handleAdd} />
    </div>
  );
}
~~~

如果不使用 useCallback，Parent 每次渲染都会创建新的函数引用，memo 的浅比较可能认为 props 已变化。

但要记住：memo 只是在 props 没变化时跳过一部分父级触发的重新渲染；子组件自己的 State 或它读取的 Context 变化，仍可能让它重新渲染。

## 六、依赖数组容易出错的地方

~~~jsx
const [count, setCount] = useState(0);

const logCount = useCallback(() => {
  console.log(count);
}, []); // 错误：闭包捕获了初始 count
~~~

这里函数缓存后一直使用第一次渲染时的 count，形成陈旧闭包问题。应把真正使用的响应式值放进依赖：

~~~jsx
const logCount = useCallback(() => {
  console.log(count);
}, [count]);
~~~

如果更新逻辑只依赖旧 State，可以用函数式更新减少依赖：

~~~jsx
const add = useCallback(() => {
  setCount((prev) => prev + 1);
}, []);
~~~

## 七、React.memo、useMemo、useCallback 的区别

- `memo(Component)`：缓存组件渲染结果的优化边界，通常根据 props 浅比较决定是否跳过父级导致的渲染。
- `useMemo`：缓存一个值。
- `useCallback`：缓存一个函数。

它们不能阻止所有重新渲染，也不应该用来修复有副作用的渲染逻辑。

## 八、易错点

1. 不要把 useMemo 当成业务状态存储。
2. 依赖数组不能为了性能随意漏写。
3. useCallback 只缓存函数引用，不会自动让函数执行更快。
4. 组件本身很轻时，过度 memo 可能得不偿失。
5. 优先用 Profiler 找到真实瓶颈，再决定是否优化。
6. 如果项目启用了 React Compiler，部分手动 memo 优化可能不再必要；具体以项目配置和官方文档为准。

## 九、面试重点与自测

- [ ] useMemo 和 useCallback 有什么区别？
- [ ] React.memo 解决什么问题？
- [ ] useCallback 缓存的是函数执行结果吗？
- [ ] 为什么依赖数组漏写会出现陈旧闭包？
- [ ] useMemo 是否保证值永远保留？
- [ ] 什么情况下不需要使用 memo？
- [ ] 如何验证一次 memo 优化是否真的有效？

## 十、参考资料

- [React：useMemo](https://react.dev/reference/react/useMemo)
- [React：useCallback](https://react.dev/reference/react/useCallback)
- [React：memo](https://react.dev/reference/react/memo)

---
**学习标准：** 能清楚区分三种 memo 工具，知道它们的适用条件，并能识别依赖遗漏和过度优化问题。
