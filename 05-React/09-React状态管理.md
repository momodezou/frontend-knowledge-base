# React 状态管理：组件数据应该放在哪里？

> 状态管理不是把所有数据塞进一个全局 Store，而是根据数据被谁使用、变化有多频繁、是否需要跨页面共享，选择合适的位置。

## 一、先分清常见状态类型 ⭐⭐⭐

| 状态类型 | 示例 | 常见放置位置 |
|---|---|---|
| 局部 UI 状态 | 弹窗开关、输入框内容 | 组件 useState |
| 多组件共享状态 | 购物车数量、筛选条件 | 状态提升、Context 或 Store |
| 复杂业务状态 | 多步骤流程、复杂表单 | useReducer 或外部 Store |
| 服务端数据 | 用户列表、订单详情 | 请求层或服务端状态管理库 |
| URL 状态 | 当前页码、搜索关键词 | 路由参数和查询参数 |

不要把“接口返回的数据”和“用户临时交互状态”混为一谈。服务端数据通常还涉及缓存、重新验证、请求状态和失效策略。

## 二、什么时候只用 useState？

如果数据只在一个组件中使用，直接使用 useState 往往最简单：

~~~jsx
function Dialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>打开</button>
      {open && <div role="dialog">弹窗内容</div>}
    </>
  );
}
~~~

## 三、多个组件共享：状态提升

如果兄弟组件需要同一份数据，把状态放到最近共同父组件，再通过 props 和回调传递。适合组件数量不多、数据流清晰的场景。

## 四、Context：跨层级共享

Context 可以避免层层转发 props，适合主题、登录用户、语言等跨层级数据。

但 Context 并不是完整的状态管理解决方案：它本身不提供复杂状态更新规范、缓存、持久化或调试时间旅行等能力。

## 五、useReducer：复杂状态更新

当状态更新有多个动作，或状态之间存在明确转换规则时，可以把更新逻辑集中到 reducer：

~~~jsx
function reducer(state, action) {
  switch (action.type) {
    case "add": return [...state, action.item];
    case "remove": return state.filter((item) => item.id !== action.id);
    case "clear": return [];
    default: return state;
  }
}
~~~

它让“发生了什么动作”和“状态如何变化”分开，更方便测试和维护。

## 六、常见外部状态管理方案

### 1. Redux Toolkit

适合状态流转较复杂、团队需要统一规范、调试和中间件生态的项目。

核心概念：Store 集中保存状态；Slice 定义某一块状态和更新逻辑；Action 描述发生了什么；Reducer 根据 Action 计算新状态；Selector 读取和派生状态。

Redux Toolkit 通过 Immer 让 reducer 中可以使用看起来像修改的写法，但底层会生成不可变更新；这不代表普通 React State 可以随意直接修改。

### 2. Zustand

API 相对轻量，适合希望用较少样板代码管理跨组件共享状态的项目。

### 3. 其他方案

Jotai、MobX 等也各有适用场景。选择时要考虑团队熟悉度、项目复杂度、调试能力、生态和维护成本。

## 七、服务端状态与客户端状态

服务端状态通常来自 API，有自己的生命周期：请求中、成功、失败、缓存与过期、重新请求与失效，以及多组件共享同一份查询结果。

TanStack Query、SWR 等库专门解决服务端数据的获取、缓存和同步问题。它们和 Redux/Zustand 这类客户端状态方案关注点并不完全相同。

## 八、如何选择？一个实用判断流程

1. 只有一个组件使用？先用 useState。
2. 少量兄弟组件共享？考虑状态提升。
3. 跨层级、变化不频繁？考虑 Context。
4. 更新规则复杂？考虑 useReducer。
5. 多模块共享、业务复杂？考虑外部 Store。
6. 数据主要来自服务器并需要缓存、刷新和失效？考虑服务端状态库。
7. 状态需要被分享或刷新后保留？考虑 URL 参数或持久化方案。

## 九、常见误区

- 全局 Store 不是越大越好。
- 不要把可直接从其他状态计算出的值重复保存，避免数据不一致。
- 不要把所有 API 响应都无差别塞进全局客户端 Store。
- 选择库之前先明确要解决的问题。
- 本地持久化数据需要考虑版本兼容、过期和敏感信息安全。

## 十、面试重点与自测

- [ ] React 项目有哪些常见状态类型？
- [ ] 什么时候使用 useState、useReducer、Context？
- [ ] Redux Toolkit 和 Zustand 的定位是什么？
- [ ] 什么是服务端状态？为什么它和客户端 UI 状态不同？
- [ ] TanStack Query / SWR 主要解决什么问题？
- [ ] 为什么不应该把所有状态都放到全局 Store？
- [ ] 如何选择合适的状态管理方案？

## 十一、参考资料

- [React：Managing State](https://react.dev/learn/managing-state)
- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [Zustand 官方文档](https://zustand.docs.pmnd.rs/)
- [TanStack Query 官方文档](https://tanstack.com/query/latest)

---
**学习标准：** 能根据状态的范围、复杂度和数据来源选择管理方式，并能解释客户端状态与服务端状态的区别。
