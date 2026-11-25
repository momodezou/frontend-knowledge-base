# React Router：React 单页应用如何管理路由？

> 路由负责根据当前 URL 决定显示哪个页面。React Router 是 React 生态中常见的路由方案，可以实现页面切换、嵌套路由、参数读取和导航。

## 一、为什么需要前端路由？⭐⭐⭐

传统多页应用中，点击链接常常请求服务器返回新的 HTML 页面。单页应用（SPA）通常由一个 HTML 入口启动，之后根据 URL 变化切换组件内容，减少整页刷新。

前端路由主要负责 URL 与页面组件映射、页面跳转和前进后退、参数读取、嵌套路由，以及路由级数据加载（取决于使用的模式）。

## 二、基本路由配置

下面是 React Router 常见声明式写法示意，具体 import 包名和 API 以项目安装的版本为准：

~~~jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() {
  return <h1>首页</h1>;
}

function About() {
  return <h1>关于我们</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
~~~

## 三、常见路由组件和 Hook

| API | 作用 |
|---|---|
| BrowserRouter | 使用浏览器 History API 管理路由 |
| Routes / Route | 声明路由匹配关系 |
| Link | 声明式导航 |
| NavLink | 可根据当前路由设置激活状态 |
| Outlet | 渲染嵌套路由的子路由 |
| useNavigate | 通过代码跳转 |
| useParams | 读取动态路径参数 |
| useSearchParams | 读取和修改查询参数 |

## 四、动态路由参数

~~~jsx
<Route path="/users/:userId" element={<UserDetail />} />

function UserDetail() {
  const { userId } = useParams();
  return <p>用户 ID：{userId}</p>;
}
~~~

访问 `/users/100` 时，`userId` 就是 `"100"`。路径参数通常是字符串，需要时再转换成数字并校验。

## 五、查询参数

例如 `/products?page=2&keyword=phone`，可以通过 useSearchParams 读取：

~~~jsx
const [searchParams, setSearchParams] = useSearchParams();

const page = searchParams.get("page");
const keyword = searchParams.get("keyword");
~~~

查询参数适合表达分页、筛选、搜索词等可分享、可收藏的页面状态。

## 六、嵌套路由与 Outlet

后台系统通常有统一布局：侧边栏、顶部导航保持不变，右侧内容随路由变化。

~~~jsx
function DashboardLayout() {
  return (
    <div className="layout">
      <aside>侧边栏</aside>
      <main><Outlet /></main>
    </div>
  );
}
~~~

路由可以把 DashboardLayout 作为父路由，再配置用户管理、订单管理等子路由。

## 七、编程式导航

~~~jsx
function Login() {
  const navigate = useNavigate();

  function handleSuccess() {
    navigate("/dashboard", { replace: true });
  }

  return <button onClick={handleSuccess}>登录成功后进入首页</button>;
}
~~~

`navigate("/path")` 跳转到指定地址；`replace: true` 替换当前历史记录，而不是新增一条。

## 八、路由权限控制要注意什么？

前端路由守卫可以控制用户是否显示某些页面，例如未登录时跳转登录页。

但**前端路由权限不是安全边界**。用户可以直接构造请求或修改前端代码。真正的数据访问权限必须由后端接口校验。

## 九、BrowserRouter 与 HashRouter

| 对比 | BrowserRouter | HashRouter |
|---|---|---|
| URL 形式 | `/users/1` | `/#/users/1` |
| 实现基础 | History API | URL hash |
| 服务器配置 | 刷新深层路由时通常要配置回退到入口 HTML | 通常不需要服务器处理 hash 路径 |
| URL 美观度 | 更简洁 | 带 `#` |

使用 BrowserRouter 时，如果用户直接访问 `/users/1` 或刷新该页面，服务器需要把请求正确回退到 SPA 入口文件，否则可能返回 404。

## 十、面试重点与自测

- [ ] 什么是前端路由？SPA 为什么需要路由？
- [ ] BrowserRouter 和 HashRouter 有什么区别？
- [ ] Link 和普通 a 标签有什么区别？
- [ ] useNavigate、useParams、useSearchParams 分别做什么？
- [ ] 什么是嵌套路由？Outlet 有什么作用？
- [ ] 为什么 BrowserRouter 需要服务器配置 history fallback？
- [ ] 前端路由权限能否代替后端鉴权？

## 十一、参考资料

- [React Router 官方文档](https://reactrouter.com/)
- [React Router：Declarative Routing](https://reactrouter.com/start/declarative/routing)
- [MDN：History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API)

---
**学习标准：** 能配置常见路由，理解动态参数、嵌套路由、编程式导航，并知道前端权限不能替代后端鉴权。
