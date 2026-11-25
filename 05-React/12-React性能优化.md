# React 性能优化：如何减少不必要的渲染？

> 性能优化不是到处添加 memo、useMemo 和 useCallback。正确流程是先测量，再找到真正耗时的环节，最后选择最简单有效的优化方式。

## 一、先判断性能问题在哪里 ⭐⭐⭐

常见问题包括组件重复渲染、计算量大、大量 DOM 节点、首屏 JavaScript 包过大、列表筛选耗时、图片或接口加载慢。

先用 React DevTools Profiler 观察组件提交和耗时，再结合浏览器 Performance、Network 分析。

## 二、减少不必要的组件渲染

### 1. 合理使用 memo

~~~jsx
const UserCard = memo(function UserCard({ user }) {
  return <div>{user.name}</div>;
});
~~~

当父组件更新，但 UserCard 的 props 没变化时，React 可以跳过这次由父级带来的渲染。

注意：子组件自己的 State 更新仍会触发它更新；它读取的 Context 变化仍会触发它更新；默认比较 props 的方式是浅比较。memo 是优化提示，不是绝对不渲染的保证。

### 2. 合理使用 useMemo

对耗时计算结果进行缓存：

~~~jsx
const filteredList = useMemo(() => {
  return list.filter((item) => item.name.includes(keyword));
}, [list, keyword]);
~~~

### 3. 合理使用 useCallback

当函数作为 props 传给 memo 子组件，或作为 Hook 依赖时，按需缓存函数引用。不要为了“看起来高级”给所有函数加 useCallback。

## 三、优化 State 放置位置

如果一个状态只影响页面中的一小块区域，就尽量不要放在最顶层让整棵组件树都跟着更新。

例如搜索框输入只影响搜索区域，可以把输入状态放在搜索组件内部；确实需要共享时再提升状态。

## 四、列表性能优化

### 1. 使用稳定 key

~~~jsx
items.map((item) => <Row key={item.id} item={item} />);
~~~

key 主要保证列表项目身份正确，不等于性能优化的全部。

### 2. 虚拟列表

当列表有几千甚至几万条数据时，不必一次把所有 DOM 都渲染出来。可以只渲染可视区域及附近的项目。

常见库包括 TanStack Virtual、react-window 等，具体选择看项目 React 版本和库维护情况。

## 五、代码分割与懒加载

按路由或功能拆分代码，避免首屏加载所有模块：

~~~jsx
import { lazy, Suspense } from "react";

const ReportPage = lazy(() => import("./ReportPage"));

function App() {
  return (
    <Suspense fallback={<p>页面加载中...</p>}>
      <ReportPage />
    </Suspense>
  );
}
~~~

配合路由级懒加载，可以把不常访问的页面拆成独立 chunk。

## 六、使用 useTransition 优化非紧急更新

例如输入框需要立即响应，但大列表筛选可以稍后处理：

~~~jsx
const [keyword, setKeyword] = useState("");
const [query, setQuery] = useState("");
const [isPending, startTransition] = useTransition();

function handleChange(event) {
  const value = event.target.value;
  setKeyword(value);

  startTransition(() => {
    setQuery(value);
  });
}
~~~

紧急输入更新不会被非紧急渲染工作长期阻塞。useTransition 不会让计算本身凭空变快，而是帮助 React 调整更新优先级。

## 七、减少不必要的 Effect 更新链

不推荐把可以直接计算的数据再存成 State，然后通过 Effect 同步。可以直接计算，或在计算确实昂贵时使用 useMemo。这样可以减少额外的状态和一次更新链。

## 八、图片、网络与首屏优化

React 组件性能只是前端性能的一部分，还要考虑图片尺寸、格式和懒加载；路由级代码分割；减少首屏不需要的第三方依赖；缓存 API 数据；合理使用加载状态；避免页面初始渲染时同时创建大量复杂组件。

## 九、推荐的性能优化流程

1. 复现卡顿，并明确是加载慢、输入卡顿还是滚动不流畅。
2. 使用 Profiler / Performance / Network 找到瓶颈。
3. 判断是组件渲染、计算、DOM 数量还是网络资源问题。
4. 选择最小范围的优化方案。
5. 在相同场景下重新测量。
6. 保留优化前后的数据，确认没有牺牲正确性和可维护性。

## 十、面试重点与自测

- [ ] React.memo、useMemo、useCallback 分别做什么？
- [ ] 为什么 memo 不能阻止所有组件更新？
- [ ] 如何避免状态更新导致大范围组件重新渲染？
- [ ] 什么是虚拟列表？适合什么场景？
- [ ] React.lazy 和 Suspense 如何配合？
- [ ] useTransition 解决什么问题？
- [ ] 为什么不应该滥用 useMemo 和 useCallback？
- [ ] 如何使用 React Profiler 定位性能问题？

## 十一、参考资料

- [React：memo](https://react.dev/reference/react/memo)
- [React：useMemo](https://react.dev/reference/react/useMemo)
- [React：useCallback](https://react.dev/reference/react/useCallback)
- [React：useTransition](https://react.dev/reference/react/useTransition)
- [React：lazy](https://react.dev/reference/react/lazy)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)

---
**学习标准：** 能先定位性能瓶颈，再合理使用 memo、代码分割、虚拟列表和并发更新能力。
