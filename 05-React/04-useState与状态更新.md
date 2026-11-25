# useState 与状态更新：React 为什么不会立刻改变变量？

> useState 用来保存组件状态。理解它最重要的一点是：每次渲染拿到的是当次状态的快照，调用 setter 是请求下一次更新，不是直接改掉当前变量。

## 一、useState 的基本用法 ⭐⭐⭐

~~~jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>当前数量：{count}</button>;
}
~~~

`useState(initialValue)` 返回当前这次渲染的 State 和更新 State 的函数。调用更新函数后，React 会安排组件重新渲染，下一次渲染得到新的 State。

## 二、为什么 setState 后立刻读取还是旧值？⭐⭐⭐

~~~jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count); // 当前事件处理函数里仍然是旧快照
  }

  return <button onClick={handleClick}>{count}</button>;
}
~~~

通俗理解：当前函数就像拿到了一张“本轮数据快照”。调用 setter 是通知 React 下一轮更新，当前这张快照不会被原地改写。

## 三、连续更新为什么可能只增加一次？

~~~jsx
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
~~~

三次调用都基于同一轮渲染中的旧 `count`，所以最终可能只得到 `count + 1`。

如果新状态依赖旧状态，使用函数式更新：

~~~jsx
function handleClick() {
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
}
~~~

React 会按队列顺序把更新函数应用到前一个计算结果上，最终增加 3。

## 四、State 中的对象和数组要不可变更新 ⭐⭐⭐

不要直接修改原对象：

~~~javascript
// 不推荐
user.name = "小红";
setUser(user);
~~~

推荐创建新对象：

~~~javascript
setUser((prev) => ({ ...prev, name: "小红" }));
~~~

数组同理：

~~~javascript
// 添加
setList((prev) => [...prev, newItem]);

// 删除
setList((prev) => prev.filter((item) => item.id !== targetId));

// 更新某一项
setList((prev) =>
  prev.map((item) => item.id === targetId ? { ...item, done: true } : item)
);
~~~

原因：React 需要通过新旧值比较判断是否需要更新。直接修改原对象会破坏状态快照，也可能让更新无法按预期被发现。

## 五、函数组件的 State setter 不会自动合并对象

类组件的 `this.setState` 对对象 State 有浅合并行为；函数组件的 `useState` setter 不会自动合并对象。

~~~jsx
const [form, setForm] = useState({ name: "", age: 18 });

setForm((prev) => ({
  ...prev,
  name: "小明"
}));
~~~

## 六、惰性初始化

如果初始值计算比较昂贵，可以传入函数：

~~~jsx
const [items, setItems] = useState(() => createInitialItems());
~~~

函数会在初始化时用于计算初始状态，而不是每次渲染都重新执行初始化逻辑。

## 七、状态重置与组件身份

如果某个组件需要在切换对象时完全重置内部状态，可以用不同的 `key` 表达不同组件身份：

~~~jsx
<UserEditor key={userId} userId={userId} />
~~~

当 key 改变时，React 会把它视为新的组件实例，旧实例状态被销毁，新实例重新初始化。

## 八、批处理（Batching）

React 会把同一轮事件中多个状态更新合并处理，减少不必要的重复渲染。现代 React 也支持更多场景下的自动批处理。

批处理不意味着状态更新函数可以随便写成依赖旧快照的形式；依赖旧值时仍应使用函数式更新。

## 九、面试重点与自测

- [ ] useState 返回什么？
- [ ] 为什么调用 setter 后立刻读取 State 还是旧值？
- [ ] 连续调用三次 `setCount(count + 1)` 为什么可能只增加 1？
- [ ] 函数式更新解决什么问题？
- [ ] 为什么不能直接修改 State 对象或数组？
- [ ] useState setter 会自动合并对象吗？
- [ ] 什么是惰性初始化？
- [ ] 如何在切换数据对象时重置组件状态？

## 十、参考资料

- [React：State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
- [React：Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [React：Updating Objects in State](https://react.dev/learn/updating-objects-in-state)
- [React：Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)

---
**学习标准：** 能解释 State 快照、函数式更新、不可变更新和批处理，并能正确更新对象与数组。
