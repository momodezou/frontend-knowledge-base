# Props 与 State：组件的数据从哪里来？

> Props 像别人交给组件的参数，State 像组件自己需要记住的状态。两者决定了组件显示什么内容。

## 一、Props 是什么？⭐⭐⭐

Props 是父组件传给子组件的数据。子组件通过参数接收：

~~~jsx
function UserCard({ name, age }) {
  return <p>{name}，{age} 岁</p>;
}

function App() {
  return <UserCard name="小明" age={20} />;
}
~~~

Props 可以是字符串、数字、对象、数组、函数，甚至另一个 React 组件。

**重要：Props 是只读的。** 子组件不应该直接修改父组件传进来的对象或数组。如果需要改变数据，应由数据所有者提供回调函数。

## 二、State 是什么？⭐⭐⭐

State 是组件内部需要记住、并且会随着用户操作或业务过程变化的数据。

~~~jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>点击了 {count} 次</button>;
}
~~~

调用 `setCount` 会请求 React 更新状态，并在后续渲染中使用新状态。普通局部变量变化不会自动触发组件重新渲染，因此不能用普通变量代替需要驱动 UI 的 State。

## 三、Props 和 State 的区别

| 对比 | Props | State |
|---|---|---|
| 数据来源 | 父组件传入 | 组件自身管理，或由状态管理机制提供 |
| 是否可直接修改 | 不可以 | 也不能直接修改，应使用 setter/dispatch |
| 主要用途 | 配置子组件、传递数据 | 保存会变化且影响 UI 的数据 |
| 更新来源 | 父组件传入新值 | 组件触发状态更新 |

两者都会影响组件渲染。不要把 Props 简单理解为“永远不变”，父组件可以在下一次渲染时传入新 Props。

## 四、父子组件如何共享数据？

常见方式是：**数据放在共同需要它的最近父组件中，子组件通过 Props 接收数据，通过回调通知父组件修改。**

~~~jsx
import { useState } from "react";

function SearchInput({ value, onChange }) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} />;
}

function SearchPage() {
  const [keyword, setKeyword] = useState("");
  return (
    <>
      <SearchInput value={keyword} onChange={setKeyword} />
      <p>当前搜索：{keyword}</p>
    </>
  );
}
~~~

这叫状态提升（Lifting State Up）。多个组件需要共享同一份状态时，可以把状态放到它们最近的共同父组件。

## 五、受控组件与非受控组件

### 1. 受控组件

表单值由 React State 管理：

~~~jsx
function NameForm() {
  const [name, setName] = useState("");
  return <input value={name} onChange={(event) => setName(event.target.value)} />;
}
~~~

优点：数据变化可预测，便于校验、联动和提交。

### 2. 非受控组件

表单值主要由 DOM 自己维护，React 需要时通过 ref 读取：

~~~jsx
function NameForm() {
  const inputRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    console.log(inputRef.current.value);
  }

  return <form onSubmit={handleSubmit}><input ref={inputRef} defaultValue="小明" /><button>提交</button></form>;
}
~~~

受控和非受控不是谁绝对更好。复杂表单通常更容易使用受控方式统一管理；简单场景或与第三方 DOM 库集成时，非受控方式也有价值。

## 六、Props 默认值与解构

函数组件可以使用参数默认值：

~~~jsx
function Button({ text = "确定", disabled = false }) {
  return <button disabled={disabled}>{text}</button>;
}
~~~

默认值只在对应 prop 为 `undefined` 时生效；传入 `null` 不会触发默认值。

## 七、易错点

1. 不要直接修改 Props。
2. 不要直接修改 State 中的对象和数组。
3. 不要把所有数据都放在最顶层；状态应尽量靠近真正使用它的组件。
4. 不需要影响 UI 的临时变量不一定要放进 State。
5. Props 变化不代表组件内部所有 State 都自动重置；必要时可通过组件 `key` 表达不同身份。

## 八、面试重点与自测

- [ ] Props 和 State 有什么区别？
- [ ] 为什么 Props 是只读的？
- [ ] 普通变量为什么不能代替 State？
- [ ] 什么是状态提升？
- [ ] 父组件如何让子组件修改数据？
- [ ] 受控组件和非受控组件有什么区别？
- [ ] 哪些数据不适合放进 State？
- [ ] 如何避免多个组件维护同一份互相冲突的数据？

## 九、参考资料

- [React：Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component)
- [React：Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- [React：Managing State](https://react.dev/learn/managing-state)

---
**学习标准：** 能区分 Props 与 State，理解单向数据流、状态提升和受控表单。
