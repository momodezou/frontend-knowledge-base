# 05-React —— React 知识体系

> 系统整理 React 的基础语法、组件模型、Hooks、路由、状态管理、渲染原理、性能优化与项目实践。

## 一、学习目标

- 理解 React 组件化和声明式 UI 的开发思想。
- 掌握 JSX、Props、State 和 Hooks 的日常使用。
- 能够设计组件间的数据流和状态管理方案。
- 掌握 React Router 的常见配置与页面组织方式。
- 理解虚拟 DOM、Fiber、Render 与 Commit 的基本关系。
- 能够分析常见渲染问题并进行有依据的性能优化。
- 能将 React 知识应用到真实业务项目中。

## 二、知识地图

### 1. JSX 与组件

- [x] React 组件的概念与函数组件
- [x] JSX 语法及其与 HTML 的区别
- [x] JSX 中的 JavaScript 表达式
- [x] 条件渲染与列表渲染
- [x] key 的作用与使用注意事项
- [x] Fragment
- [x] children 与组件组合
- [x] 组件职责划分与复用

### 2. Props 与 State

- [x] Props 的概念与传递方式
- [x] Props 只读原则
- [x] State 的概念
- [x] Props 与 State 的区别
- [x] 父子组件通信
- [x] 状态提升
- [x] 受控组件与非受控组件
- [x] 表单状态管理

### 3. Hooks 基础

- [x] Hooks 出现的意义
- [x] Hooks 的调用规则
- [x] useState
- [x] useEffect
- [x] useMemo
- [x] useCallback
- [x] useRef
- [x] useContext
- [x] useReducer
- [x] 自定义 Hooks
- [x] StrictMode 开发环境检查

### 4. State 更新机制

- [x] useState 基本用法
- [x] State 快照
- [x] 状态更新与重新渲染
- [x] 函数式更新
- [x] 更新对象与数组
- [x] 不可变数据原则
- [x] 批处理（Batching）
- [x] 惰性初始化
- [x] 组件身份与 State 重置

### 5. Effect 与副作用

- [x] useEffect 基本用法
- [x] 依赖数组
- [x] Effect 清理函数
- [x] 事件监听与定时器清理
- [x] 异步请求与竞态处理
- [x] useEffect 与 useLayoutEffect
- [x] StrictMode 下的 Effect 行为
- [x] 避免不必要的 Effect

### 6. Hooks 性能能力

- [x] useMemo 缓存计算结果
- [x] useCallback 缓存函数
- [x] React.memo
- [x] 依赖数组与陈旧闭包
- [x] 识别过度优化
- [x] React Profiler 基础使用

### 7. 自定义 Hooks 与 Context

- [x] 自定义 Hook 的设计与复用
- [x] 自定义 Hook 与共享状态的区别
- [x] Props Drilling
- [x] createContext 与 Provider
- [x] useContext
- [x] Context 更新机制
- [x] Context 与 useReducer 组合

### 8. React Router

- [x] 前端路由与 SPA
- [x] BrowserRouter 与 HashRouter
- [x] Routes 与 Route
- [x] Link 与 NavLink
- [x] 动态路由参数
- [x] 查询参数
- [x] 嵌套路由与 Outlet
- [x] useNavigate
- [x] 前端路由权限与后端鉴权边界
- [x] History Fallback

### 9. React 状态管理

- [x] 局部状态与共享状态
- [x] 状态提升
- [x] Context
- [x] useReducer
- [x] Redux Toolkit
- [x] Zustand
- [x] 客户端状态与服务端状态
- [x] TanStack Query / SWR
- [x] 状态管理方案选型

### 10. 虚拟 DOM 与 Fiber

- [x] React Element 与虚拟 DOM 概念
- [x] Reconciliation（协调）
- [x] Diff 基本规则
- [x] key 与组件身份
- [x] Fiber 数据结构
- [x] Fiber 与渲染调度
- [x] Render 阶段
- [x] Commit 阶段
- [x] 并发渲染的基本理解

### 11. React 渲染机制

- [x] 组件重新渲染
- [x] 触发渲染的常见原因
- [x] Render 与 Commit
- [x] 组件执行与 DOM 更新的区别
- [x] State 保留与重置
- [x] StrictMode
- [x] React DevTools Profiler

### 12. React 性能优化

- [x] React.memo
- [x] useMemo 与 useCallback
- [x] 状态合理放置
- [x] 列表稳定 key
- [x] 虚拟列表
- [x] React.lazy 与 Suspense
- [x] 路由级代码分割
- [x] useTransition
- [x] 减少不必要的 Effect
- [x] Profiler 性能分析

### 13. React 项目实践

- [x] 项目目录组织
- [x] 组件拆分与复用
- [x] 请求层封装
- [x] Loading / Error / Empty 状态
- [x] 表单设计
- [x] 路由与布局
- [x] 状态管理方案落地
- [x] Error Boundary
- [x] 单元测试、组件测试与 E2E
- [x] 可访问性与项目复盘

## 三、文档导航

| 文件 | 主要内容 | 状态 |
|---|---|---|
| [01-JSX与组件.md](./01-JSX与组件.md) | JSX、组件、条件与列表渲染 | 已整理 |
| [02-Props与State.md](./02-Props与State.md) | Props、State、组件通信与表单 | 已整理 |
| [03-Hooks基础与规则.md](./03-Hooks基础与规则.md) | Hooks 分类、规则、useRef、useReducer | 已整理 |
| [04-useState与状态更新.md](./04-useState与状态更新.md) | State 快照、函数式更新、不可变更新 | 已整理 |
| [05-useEffect与副作用.md](./05-useEffect与副作用.md) | Effect、依赖、清理与请求处理 | 已整理 |
| [06-useMemo与useCallback.md](./06-useMemo与useCallback.md) | memo 与缓存优化 | 已整理 |
| [07-自定义Hooks与Context.md](./07-自定义Hooks与Context.md) | 逻辑复用、跨层级数据共享 | 已整理 |
| [08-React Router.md](./08-React Router.md) | 路由配置、参数、嵌套与导航 | 已整理 |
| [09-React状态管理.md](./09-React状态管理.md) | useReducer、Context、Redux、Zustand | 已整理 |
| [10-虚拟DOM与Fiber.md](./10-虚拟DOM与Fiber.md) | 协调、Fiber、Render 与 Commit | 已整理 |
| [11-React渲染机制.md](./11-React渲染机制.md) | 组件更新、渲染触发与 State 保留 | 已整理 |
| [12-React性能优化.md](./12-React性能优化.md) | 渲染优化、虚拟列表、代码分割 | 已整理 |
| [13-React项目实践.md](./13-React项目实践.md) | 项目结构、请求、表单、测试与复盘 | 已整理 |

## 四、推荐学习顺序

建议按下面顺序学习，不必一开始就钻进 Fiber 源码：

1. **组件基础：** JSX 与组件 → Props 与 State。
2. **日常开发：** Hooks 基础 → useState → useEffect。
3. **逻辑复用：** useMemo / useCallback → 自定义 Hooks 与 Context。
4. **应用组织：** React Router → React 状态管理。
5. **底层原理：** 虚拟 DOM 与 Fiber → React 渲染机制。
6. **工程实践：** React 性能优化 → React 项目实践。

## 五、文档编写与学习规范

每篇知识文档尽量遵循统一结构：

1. 核心概念：先说明它是什么、解决什么问题。
2. 工作原理：用流程或生活化例子解释。
3. 代码示例：尽量给出简洁、可理解的示例。
4. 实际场景：说明什么时候应该使用。
5. 易错点：记录常见误区和边界情况。
6. 面试自测：用问题检验是否真正理解。
7. 参考资料：优先引用 React 官方文档。

学习时建议：
- 先理解问题，再记 API。
- 每个核心知识点至少手写一个小例子。
- 不只看组件是否显示，还要理解状态和数据如何流动。
- 性能优化先测量，再动手，不要盲目使用 memo。
- React 版本、React Router 版本和构建工具可能影响 API 写法，实际项目以对应版本文档为准。

## 六、与其他目录的边界

- `02-JavaScript`：整理 JavaScript 语言本身，例如闭包、原型、Promise 和事件循环。
- `03-TypeScript`：整理类型系统和 React + TypeScript 类型实践。
- `06-CSS`：整理 CSS 布局、样式和动画。
- `07-Browser-Network`：整理浏览器机制、HTTP、网络、安全和性能基础。
- `10-Engineering`：整理 Vite、Webpack、测试工具和工程化配置。
- `12-Project-Practice`：沉淀真实项目中的架构方案、业务难点和复盘。
- `13-Interview`：整理筛选后的高频面试题和综合回答。

本目录重点记录 React 框架本身的概念、机制和通用实践，避免重复维护其他专题。

## 七、官方参考资料

- [React 官方文档](https://react.dev/)
- [React Learn](https://react.dev/learn)
- [React API Reference](https://react.dev/reference/react)
- [React Router 官方文档](https://reactrouter.com/)
- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)

持续更新中。
