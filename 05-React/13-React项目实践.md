# React 项目实践：如何把知识组织成可维护的应用？

> 学会 React API 只是开始。真正的项目能力还包括组件拆分、路由组织、接口管理、状态设计、错误处理、测试和团队协作。

## 一、一个常见项目结构

下面是一个可参考的结构，不是唯一标准：

~~~text
src/
├── app/                 # 应用入口、全局 Provider、路由
├── assets/              # 图片、字体等静态资源
├── components/          # 通用组件
├── features/            # 按业务功能组织的模块
│   ├── users/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   └── orders/
├── hooks/               # 跨业务复用的自定义 Hooks
├── services/            # 请求封装和 API 基础配置
├── store/               # 全局客户端状态
├── utils/               # 通用工具函数
└── styles/              # 全局样式
~~~

小项目可以更简单；项目变大后，可以按业务模块组织代码，避免一个目录堆积所有组件。

## 二、组件如何拆分？

可以从三个问题判断：

1. 这块 UI 是否有独立职责？
2. 是否会在多个地方复用？
3. 是否有独立的状态、交互或复杂逻辑？

例如用户管理页面可以拆成 UserPage（页面组合和数据流）、UserFilter（筛选条件）、UserTable（表格展示）、UserForm（新增和编辑表单）和 ConfirmDialog（确认弹窗）。

不要把每一个 `<div>` 都拆成组件。组件拆分应提高可读性和复用性，而不是制造过多跳转。

## 三、请求层如何组织？

不要在每个组件中重复拼接 URL、处理 Token、判断错误码。可以把请求逻辑封装到 service 层：

~~~javascript
export async function getUsers(params, signal) {
  const query = new URLSearchParams(params);
  const response = await fetch(`/api/users?${query}`, { signal });

  if (!response.ok) {
    throw new Error(`获取用户失败：${response.status}`);
  }

  return response.json();
}
~~~

组件负责调用请求、显示 loading/error/data；公共请求配置、认证处理和错误转换由统一请求层负责。

实际项目还要处理超时、取消、重试、并发请求、登录失效和接口数据校验。

## 四、接口状态要完整

一个列表页面至少要考虑：初始加载中、加载成功且有数据、加载成功但为空、请求失败、重新加载、筛选条件变化，以及组件切换或卸载时请求取消。

不要只写一个 `data`，否则用户可能分不清“没有数据”和“还没加载”。

## 五、表单设计

常见表单能力：

- 受控输入与字段状态。
- 必填、格式和范围校验。
- 提交中禁用重复提交。
- 服务端错误提示。
- 提交成功后的反馈和页面更新。
- 离开页面时未保存内容的处理。

简单表单可以用 State 管理；字段很多、校验复杂时，可以考虑成熟表单库，避免自己重复实现所有边界情况。

## 六、路由与页面布局

建议把路由配置、布局和页面组件分开：

- 公共布局：导航栏、侧边栏、页脚。
- 页面路由：用户列表、用户详情、订单详情等。
- 错误页面：404、无权限、系统错误。
- 路由级懒加载：减少首屏加载代码。

前端路由权限只负责界面体验，后端接口仍必须验证用户身份和操作权限。

## 七、状态管理的项目实践

先判断状态属于哪一类：

- 页面内部交互：useState。
- 组件间共享：状态提升或 Context。
- 复杂业务状态：useReducer 或外部 Store。
- 服务端数据：TanStack Query、SWR 等数据管理方案。
- 可分享的筛选和分页：URL 查询参数。

不要因为项目里安装了 Redux 或 Zustand，就把所有变量都放到全局 Store。

## 八、错误边界与异常处理

React Error Boundary 可以捕获子组件渲染过程中的部分错误，并显示备用 UI。

它不能捕获所有错误，例如普通事件处理器中的错误、任意异步回调中的错误和服务端错误，需要在相应位置单独处理。

项目中应区分接口请求失败、表单校验失败、组件渲染异常、路由不存在、用户权限不足，以及网络断开或服务不可用。

## 九、测试与质量保障

建议按层次考虑：

- 单元测试：测试工具函数和纯逻辑。
- 组件测试：测试用户看到的内容和交互。
- 端到端测试：验证完整业务流程。
- 静态检查：ESLint、TypeScript。
- 代码格式：Prettier 等工具。

测试应优先验证用户可观察的行为，而不是过度依赖组件内部实现细节。

## 十、可访问性与体验

- 使用语义化 HTML。
- 表单控件关联 label。
- 交互元素支持键盘操作。
- 弹窗正确管理焦点。
- 图片提供合适的 alt。
- 加载、错误和成功状态提供清晰反馈。
- 不只依赖颜色表达状态。

## 十一、项目复盘建议

每完成一个重要功能，可以记录业务需求和边界条件、组件拆分与数据流设计、状态管理和接口方案、关键技术选型及原因、遇到的问题和定位过程、性能安全与可访问性考虑，以及最终效果与后续改进点。

这类记录可以沉淀到知识库的 `12-Project-Practice`，避免 React 理论目录和真实项目经验混在一起。

## 十二、面试重点与自测

- [ ] React 项目通常如何组织目录？
- [ ] 如何判断一个 UI 是否应该抽成组件？
- [ ] 为什么建议统一封装请求层？
- [ ] 列表接口需要考虑哪些状态？
- [ ] 如何组织大型表单？
- [ ] Error Boundary 能捕获哪些错误，不能捕获哪些错误？
- [ ] 如何选择客户端状态和服务端状态方案？
- [ ] React 项目如何进行单元、组件和端到端测试？
- [ ] 前端路由权限为什么不能代替后端权限？

## 十三、参考资料

- [React：Thinking in React](https://react.dev/learn/thinking-in-react)
- [React：Managing State](https://react.dev/learn/managing-state)
- [React：Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TanStack Query](https://tanstack.com/query/latest)

---
**学习标准：** 能把 React 核心知识应用到一个真实业务模块，说明组件、路由、请求、状态、错误处理和测试方案。
