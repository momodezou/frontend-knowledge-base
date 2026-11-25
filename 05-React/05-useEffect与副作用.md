# useEffect 与副作用：什么时候需要它？

> useEffect 的核心用途不是“让代码在组件加载时执行”，而是让 React 组件和外部系统保持同步，例如请求数据、订阅事件、连接 WebSocket 或控制第三方组件。

## 一、什么是副作用？⭐⭐⭐

组件渲染应该尽量保持纯净：根据 Props 和 State 计算 UI，不直接操作外部世界。

但实际应用需要与外部系统交互，例如监听浏览器窗口、订阅 WebSocket、设置定时器、调用第三方地图或图表库。这类与外部系统同步的工作通常可以放在 Effect 中。

## 二、useEffect 基本语法

~~~jsx
useEffect(() => {
  // 建立同步关系或执行副作用
  return () => {
    // 清理副作用
  };
}, [dependencies]);
~~~

Effect 在 React 提交更新后运行。依赖变化时，React 会先执行上一次 Effect 的清理函数，再执行新一轮 Effect。

## 三、依赖数组的三种情况 ⭐⭐⭐

### 1. 不传依赖数组

~~~jsx
useEffect(() => {
  console.log("每次提交后的渲染都会执行");
});
~~~

每次组件提交更新后都会执行。

### 2. 空依赖数组

~~~jsx
useEffect(() => {
  console.log("建立一次订阅");
  return () => console.log("清理订阅");
}, []);
~~~

表示 Effect 不依赖变化的响应式值，通常在组件挂载后的提交阶段执行，并在卸载时清理。开发环境 StrictMode 可能额外执行一轮 setup/cleanup 检查。

### 3. 有依赖数组

~~~jsx
useEffect(() => {
  console.log("userId 变化后重新同步");
}, [userId]);
~~~

当依赖值与上次相比发生变化时，重新执行 Effect。React 使用 `Object.is` 比较依赖项。

**注意：** 依赖数组应该包含 Effect 中使用到的响应式值，不要为了减少执行次数而故意漏写依赖。

## 四、清理函数有什么作用？⭐⭐⭐

例如监听窗口变化：

~~~jsx
useEffect(() => {
  function handleResize() {
    console.log(window.innerWidth);
  }

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
~~~

如果不清理，组件卸载后监听器可能仍然存在，导致重复执行或引用无法释放。

常见需要清理的资源：事件监听器、定时器、WebSocket 连接、订阅、第三方库实例，以及不再需要的异步请求。

## 五、使用 Effect 请求数据时要注意什么？

请求可能过期、组件可能卸载，或者用户快速切换查询条件。要避免旧请求覆盖新结果。

~~~jsx
useEffect(() => {
  const controller = new AbortController();

  async function loadUser() {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`请求失败：${response.status}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      if (error.name !== "AbortError") setError(error);
    }
  }

  loadUser();
  return () => controller.abort();
}, [userId]);
~~~

真实项目还要考虑 loading、error、空数据、重试、缓存和竞态处理。复杂数据请求通常可以交给 React Router 数据能力或专门的数据请求库管理。

## 六、不要滥用 useEffect ⭐⭐⭐

### 不需要 Effect 的情况一：根据现有状态计算数据

不推荐：

~~~jsx
const [price, setPrice] = useState(100);
const [count, setCount] = useState(2);
const [total, setTotal] = useState(200);

useEffect(() => {
  setTotal(price * count);
}, [price, count]);
~~~

推荐直接计算：

~~~jsx
const total = price * count;
~~~

### 不需要 Effect 的情况二：响应用户点击

用户点击按钮后执行的业务动作，通常直接写在事件处理函数中，而不是先更新一个标志位，再通过 Effect 监听标志位执行。

### 需要 Effect 的典型情况

当需要与 React 之外的系统建立或维护同步关系时，才考虑 Effect。

## 七、useEffect 与 useLayoutEffect

| 对比 | useEffect | useLayoutEffect |
|---|---|---|
| 主要用途 | 与外部系统同步 | 读取布局并在浏览器绘制前同步调整 |
| 执行时机 | 提交后执行，通常不阻塞绘制 | DOM 更新后、浏览器重绘前 |
| 对性能影响 | 通常较小 | 可能阻塞浏览器绘制 |
| 常见场景 | 请求、订阅、事件监听 | 测量元素尺寸并立即修正位置 |

不要为了“更早执行”就全部改成 `useLayoutEffect`。

## 八、为什么开发环境 Effect 可能执行额外一轮？

在 StrictMode 下，React 开发环境可能执行额外的 setup → cleanup → setup 流程，用来检查清理逻辑是否正确。

如果 Effect 不能正确清理订阅、连接或定时器，就可能暴露出重复监听等问题。正确解决方式是让 Effect 可重复建立和清理，而不是依赖“只执行一次”的假设。

## 九、面试重点与自测

- [ ] useEffect 解决什么问题？
- [ ] 依赖数组为空、不传、传入依赖分别代表什么？
- [ ] Effect 为什么需要清理函数？
- [ ] 依赖项应该如何确定？
- [ ] 为什么不建议用 Effect 计算派生数据？
- [ ] useEffect 和 useLayoutEffect 有什么区别？
- [ ] StrictMode 下为什么可能出现额外执行？
- [ ] 请求数据时如何处理组件卸载和竞态问题？

## 十、参考资料

- [React：Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [React：You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React：useEffect](https://react.dev/reference/react/useEffect)
- [React：useLayoutEffect](https://react.dev/reference/react/useLayoutEffect)

---
**学习标准：** 能判断哪些逻辑需要 Effect，理解依赖和清理机制，并能处理订阅、请求及组件卸载问题。
