# JSX 与组件：React 页面是怎样拆分出来的？

> React 的核心思想是组件化：把页面拆成一个个可复用的小部件，再组合成完整界面。JSX 是描述这些界面的常用写法。

## 一、什么是组件？⭐⭐⭐

组件（Component）就是一段可复用的 UI。一个按钮、一张用户卡片、一个导航栏，甚至整个页面，都可以是组件。

~~~jsx
function Welcome() {
  return <h1>欢迎使用知识库</h1>;
}

function App() {
  return <main><Welcome /><Welcome /></main>;
}
~~~

组件名必须以大写字母开头。`<Welcome />` 会被识别为自定义组件，`<div>` 则是 HTML 标签。

**通俗理解：** 页面像搭积木。每个组件负责一块内容，组合起来就是页面。

## 二、JSX 是什么？⭐⭐⭐

JSX 是 JavaScript 的一种语法扩展，让我们可以在 JavaScript 中写类似 HTML 的界面描述。

~~~jsx
const name = "小明";

function Greeting() {
  return <h1>你好，{name}</h1>;
}
~~~

花括号 `{}` 可以放入 JavaScript 表达式，例如变量、函数调用、三元表达式和数组方法。JSX 不是浏览器原生 HTML，构建工具会把它转换为 React 能理解的元素描述。

## 三、JSX 与 HTML 的常见区别

| HTML | JSX | 说明 |
|---|---|---|
| `class` | `className` | 使用 DOM 属性名 |
| `for` | `htmlFor` | 常用于 label 关联表单控件 |
| `onclick="..."` | `onClick={handler}` | 传入函数，而不是字符串 |
| `<img>` | `<img />` | JSX 标签必须正确闭合 |
| 多个并列根节点 | 使用 Fragment 或父元素包裹 | 组件需要返回一个整体 |

~~~jsx
function Profile() {
  return (
    <>
      <label htmlFor="username">用户名</label>
      <input id="username" className="input" />
    </>
  );
}
~~~

Fragment（片段）可以把多个节点组合起来，而不额外创建一个真实 DOM 容器。

## 四、JSX 中的条件渲染

常见写法有三种：

~~~jsx
function Status({ loading, user }) {
  if (loading) return <p>加载中...</p>;

  return (
    <section>
      {user ? <p>你好，{user.name}</p> : <p>请先登录</p>}
      {user && <button>进入个人中心</button>}
    </section>
  );
}
~~~

**易错点：** `&&` 左边如果是数字 `0`，表达式可能渲染出 `0`。例如 `{list.length && <List />}` 在列表为空时会显示 0。可以改为 `{list.length > 0 && <List />}`。

## 五、列表渲染与 key ⭐⭐⭐

通常使用 `map()` 把数组转换成组件：

~~~jsx
const users = [{ id: 1, name: "小明" }, { id: 2, name: "小红" }];

function UserList() {
  return (
    <ul>
      {users.map((user) => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
~~~

`key` 帮助 React 在同一组兄弟节点中识别元素身份，判断哪些项目新增、删除或移动。

- key 应稳定且唯一，通常使用数据 ID。
- 不要在列表顺序可能变化时随意使用数组下标。
- key 只用于 React 协调，不会作为普通 prop 自动传给子组件。
- 不需要给页面上所有组件设置全局唯一 key，只需要在同级列表中正确标识。

## 六、组件组合与 children

父组件可以通过 `children` 接收组件标签内部的内容：

~~~jsx
function Panel({ title, children }) {
  return <section><h2>{title}</h2><div>{children}</div></section>;
}

function App() {
  return (
    <Panel title="学习进度">
      <p>今天完成了 React 基础学习。</p>
      <button>查看详情</button>
    </Panel>
  );
}
~~~

这种方式适合弹窗、卡片、布局容器等通用组件。

## 七、组件设计建议

- 一个组件尽量有清晰、单一的职责。
- 把重复 UI 抽成组件，但不要为了复用而过度拆分。
- 通过 props 配置组件，而不是在组件内部写死业务数据。
- 组件渲染逻辑尽量保持纯净：相同输入应得到相同 UI。
- 事件处理、请求和订阅等副作用不要直接放在组件渲染过程里。

## 八、面试重点与自测

- [ ] React 组件是什么？为什么组件名要大写？
- [ ] JSX 是什么？它和 HTML 有什么区别？
- [ ] JSX 中为什么使用 `className` 和 `htmlFor`？
- [ ] Fragment 有什么作用？
- [ ] React 如何实现条件渲染和列表渲染？
- [ ] key 有什么作用？为什么不建议在动态列表中使用 index？
- [ ] `children` 通常用于什么场景？
- [ ] 为什么组件渲染逻辑应该保持纯净？

## 九、参考资料

- [React：Describing the UI](https://react.dev/learn/describing-the-ui)
- [React：Quick Start](https://react.dev/learn)
- [React：Rendering Lists](https://react.dev/learn/rendering-lists)

---
**学习标准：** 能独立写出组件，理解 JSX、条件渲染、列表 key 和 children，并能把一块页面拆成职责清晰的组件。
