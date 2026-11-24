# Browser & Network 知识体系

## 一、分类介绍

本目录用于系统整理浏览器工作原理、Web 网络通信机制、HTTP 协议、浏览器缓存、安全机制及前端性能优化相关知识。

学习目标：

- [x] 理解浏览器整体架构和工作流程
- [x] 掌握浏览器页面加载与渲染机制
- [x] 理解 DOM、CSSOM、渲染树及合成机制
- [x] 掌握 HTTP / HTTPS 和常见网络协议
- [x] 理解浏览器缓存策略
- [x] 掌握跨域及 Web 安全相关知识
- [x] 能够分析和优化页面加载性能

## 二、知识地图

### 1. 浏览器基础

- [x] 浏览器整体架构
- [x] 浏览器多进程架构
- [x] 浏览器主进程
- [x] 渲染进程
- [x] GPU 进程
- [x] 网络进程
- [x] 浏览器与服务器通信
- [x] 浏览器地址栏输入 URL 后发生了什么

### 2. 浏览器渲染机制

- [x] URL 解析
- [x] DNS 解析
- [x] TCP 连接
- [x] HTTP 请求
- [x] HTML 解析
- [x] DOM 树构建
- [x] CSSOM 树构建
- [x] 渲染树构建
- [x] Layout 布局
- [x] Paint 绘制
- [x] Composite 合成
- [x] 页面首次渲染流程
- [x] 重排（Reflow）
- [x] 重绘（Repaint）
- [x] 图层与合成机制

### 3. JavaScript 与浏览器交互

- [x] JavaScript 执行机制与浏览器交互
- [x] 浏览器事件循环相关交互（语言层面的 Event Loop 详细知识统一归档到 02-JavaScript）
- [x] 宏任务与微任务（详细知识统一归档到 02-JavaScript）
- [x] requestAnimationFrame
- [x] requestIdleCallback
- [x] MutationObserver
- [x] IntersectionObserver
- [x] ResizeObserver
- [x] DOM 事件机制
- [x] 事件捕获与冒泡
- [x] 事件委托
- [x] 事件循环与页面渲染的关系（详细知识统一归档到 02-JavaScript）

### 4. HTTP 与 HTTPS

- [x] HTTP 基础概念
- [x] HTTP 请求与响应
- [x] HTTP 请求方法
- [x] HTTP 状态码
- [x] HTTP 请求头与响应头
- [x] HTTP/1.0
- [x] HTTP/1.1
- [x] HTTP/2
- [x] HTTP/3
- [x] HTTPS 工作原理
- [x] SSL / TLS 握手
- [x] 对称加密与非对称加密
- [x] 数字证书
- [x] HTTP 与 HTTPS 的区别
- [x] WebSocket

### 5. TCP / IP 网络协议

- [x] OSI 七层模型
- [x] TCP/IP 四层模型
- [x] TCP 与 UDP
- [x] TCP 三次握手
- [x] TCP 四次挥手
- [x] TCP 可靠传输
- [x] 滑动窗口
- [x] 拥塞控制
- [x] DNS 解析过程
- [x] IP 地址（基础概念）
- [x] CDN 基础原理

### 6. 浏览器缓存

- [x] 浏览器缓存机制
- [x] 强缓存
- [x] 协商缓存
- [x] Cache-Control
- [x] Expires
- [x] ETag
- [x] Last-Modified
- [x] If-None-Match
- [x] If-Modified-Since
- [x] 304 状态码
- [x] Memory Cache
- [x] Disk Cache
- [x] Service Worker
- [x] PWA 缓存策略

### 7. 跨域与通信

- [x] 同源策略
- [x] 跨域问题
- [x] CORS
- [x] 简单请求
- [x] 预检请求 OPTIONS
- [x] JSONP
- [x] 反向代理
- [x] postMessage
- [x] iframe 通信
- [x] Cookie 跨域携带
- [x] SameSite

### 8. Web 安全

- [x] XSS 攻击
- [x] CSRF 攻击
- [x] 点击劫持
- [x] SQL 注入基础
- [x] 中间人攻击
- [x] HTTPS 安全机制
- [x] CSP 内容安全策略
- [x] Cookie 安全属性
- [x] Token 安全
- [x] 前端常见安全防护

### 9. 浏览器存储

- [x] Cookie
- [x] LocalStorage
- [x] SessionStorage
- [x] IndexedDB
- [x] Cache Storage
- [x] Web Storage API
- [x] 不同存储方式的区别
- [x] 存储容量与生命周期
- [x] 敏感数据存储安全

### 10. Web 性能优化

- [x] 页面加载性能指标
- [x] DNS 预解析
- [x] Preload
- [x] Prefetch
- [x] 资源压缩
- [x] 图片优化
- [x] 懒加载
- [x] CDN 加速
- [x] HTTP 缓存优化
- [x] 代码分割
- [x] Tree Shaking
- [x] 首屏加载优化
- [x] Core Web Vitals
- [x] LCP、INP、CLS
- [x] Performance API
- [x] Lighthouse 性能分析

## 三、文档导航

| 文件 | 内容 | 状态 |
|---|---|---|
| [浏览器架构.md](./浏览器架构.md) | 浏览器多进程架构 | 已整理 |
| [浏览器渲染机制.md](./浏览器渲染机制.md) | DOM、CSSOM、Layout、Paint | 已整理 |
| [URL输入到页面展示.md](./URL输入到页面展示.md) | 完整页面加载流程 | 已整理 |
| [浏览器事件机制.md](./浏览器事件机制.md) | DOM 事件与观察者 API | 已整理 |
| [HTTP协议.md](./HTTP协议.md) | HTTP 请求、响应及状态码 | 已整理 |
| [HTTPS与TLS.md](./HTTPS与TLS.md) | HTTPS 加密与握手 | 已整理 |
| [TCP与UDP.md](./TCP与UDP.md) | 网络传输协议 | 已整理 |
| [DNS解析.md](./DNS解析.md) | DNS 查询过程 | 已整理 |
| [浏览器缓存.md](./浏览器缓存.md) | 强缓存与协商缓存 | 已整理 |
| [跨域与CORS.md](./跨域与CORS.md) | 跨域机制与解决方案 | 已整理 |
| [Web安全.md](./Web安全.md) | XSS、CSRF 等 | 已整理 |
| [浏览器存储.md](./浏览器存储.md) | Cookie、Storage、IndexedDB | 已整理 |
| [Web性能优化.md](./Web性能优化.md) | 性能指标与优化方案 | 已整理 |

## 四、推荐学习顺序

1. 浏览器整体架构
2. URL 输入到页面展示的完整过程
3. 浏览器渲染机制
4. JavaScript 与浏览器交互
5. HTTP / HTTPS
6. TCP / IP 与 DNS
7. 浏览器缓存
8. 跨域与通信
9. 浏览器存储
10. Web 安全
11. Web 性能优化

## 五、学习建议

每篇文档建议按以下顺序学习：

1. 先看通俗解释，弄清楚这个技术解决什么问题。
2. 再看工作流程，能自己画出流程图。
3. 结合代码示例理解浏览器或网络行为。
4. 完成面试自测，不看答案用自己的话讲出来。
5. 在实际项目中找一个对应场景，验证知识点。

## 六、参考资料

- [MDN Web 文档](https://developer.mozilla.org/zh-CN/docs/Web)
- [Chrome Developers](https://developer.chrome.com/docs)
- [web.dev](https://web.dev/)
- [HTTP 官方规范](https://httpwg.org/specs/)

持续更新中。
