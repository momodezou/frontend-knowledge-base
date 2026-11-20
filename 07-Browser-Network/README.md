
# Browser & Network 知识体系

## 一、分类介绍

本目录用于系统整理浏览器工作原理、Web 网络通信机制、HTTP 协议、浏览器缓存、安全机制及前端性能优化相关知识。

学习目标：

- 理解浏览器整体架构和工作流程
- 掌握浏览器页面加载与渲染机制
- 理解 DOM、CSSOM、渲染树及合成机制
- 掌握 HTTP / HTTPS 和常见网络协议
- 理解浏览器缓存策略
- 掌握跨域及 Web 安全相关知识
- 能够分析和优化页面加载性能

## 二、知识地图

### 1. 浏览器基础

- [ ] 浏览器整体架构
- [ ] 浏览器多进程架构
- [ ] 浏览器主进程
- [ ] 渲染进程
- [ ] GPU 进程
- [ ] 网络进程
- [ ] 浏览器与服务器通信
- [ ] 浏览器地址栏输入 URL 后发生了什么

### 2. 浏览器渲染机制

- [ ] URL 解析
- [ ] DNS 解析
- [ ] TCP 连接
- [ ] HTTP 请求
- [ ] HTML 解析
- [ ] DOM 树构建
- [ ] CSSOM 树构建
- [ ] 渲染树构建
- [ ] Layout 布局
- [ ] Paint 绘制
- [ ] Composite 合成
- [ ] 页面首次渲染流程
- [ ] 重排（Reflow）
- [ ] 重绘（Repaint）
- [ ] 图层与合成机制

### 3. JavaScript 与浏览器交互

- [ ] JavaScript 执行机制
- [ ] 浏览器事件循环
- [ ] 宏任务与微任务
- [ ] requestAnimationFrame
- [ ] requestIdleCallback
- [ ] MutationObserver
- [ ] IntersectionObserver
- [ ] ResizeObserver
- [ ] DOM 事件机制
- [ ] 事件捕获与冒泡
- [ ] 事件委托
- [ ] 事件循环与页面渲染的关系

注：JavaScript 语言层面的 Event Loop 详细知识统一归档到 02-JavaScript。

### 4. HTTP 与 HTTPS

- [ ] HTTP 基础概念
- [ ] HTTP 请求与响应
- [ ] HTTP 请求方法
- [ ] HTTP 状态码
- [ ] HTTP 请求头与响应头
- [ ] HTTP/1.0
- [ ] HTTP/1.1
- [ ] HTTP/2
- [ ] HTTP/3
- [ ] HTTPS 工作原理
- [ ] SSL / TLS 握手
- [ ] 对称加密与非对称加密
- [ ] 数字证书
- [ ] HTTP 与 HTTPS 的区别
- [ ] WebSocket

### 5. TCP / IP 网络协议

- [ ] OSI 七层模型
- [ ] TCP/IP 四层模型
- [ ] TCP 与 UDP
- [ ] TCP 三次握手
- [ ] TCP 四次挥手
- [ ] TCP 可靠传输
- [ ] 滑动窗口
- [ ] 拥塞控制
- [ ] DNS 解析过程
- [ ] IP 地址
- [ ] CDN 基础原理

### 6. 浏览器缓存

- [ ] 浏览器缓存机制
- [ ] 强缓存
- [ ] 协商缓存
- [ ] Cache-Control
- [ ] Expires
- [ ] ETag
- [ ] Last-Modified
- [ ] If-None-Match
- [ ] If-Modified-Since
- [ ] 304 状态码
- [ ] Memory Cache
- [ ] Disk Cache
- [ ] Service Worker
- [ ] PWA 缓存策略

### 7. 跨域与通信

- [ ] 同源策略
- [ ] 跨域问题
- [ ] CORS
- [ ] 简单请求
- [ ] 预检请求 OPTIONS
- [ ] JSONP
- [ ] 反向代理
- [ ] postMessage
- [ ] iframe 通信
- [ ] Cookie 跨域携带
- [ ] SameSite

### 8. Web 安全

- [ ] XSS 攻击
- [ ] CSRF 攻击
- [ ] 点击劫持
- [ ] SQL 注入基础
- [ ] 中间人攻击
- [ ] HTTPS 安全机制
- [ ] CSP 内容安全策略
- [ ] Cookie 安全属性
- [ ] Token 安全
- [ ] 前端常见安全防护

### 9. 浏览器存储

- [ ] Cookie
- [ ] LocalStorage
- [ ] SessionStorage
- [ ] IndexedDB
- [ ] Cache Storage
- [ ] Web Storage API
- [ ] 不同存储方式的区别
- [ ] 存储容量与生命周期
- [ ] 敏感数据存储安全

### 10. Web 性能优化

- [ ] 页面加载性能指标
- [ ] DNS 预解析
- [ ] Preload
- [ ] Prefetch
- [ ] 资源压缩
- [ ] 图片优化
- [ ] 懒加载
- [ ] CDN 加速
- [ ] HTTP 缓存优化
- [ ] 代码分割
- [ ] Tree Shaking
- [ ] 首屏加载优化
- [ ] Core Web Vitals
- [ ] LCP、INP、CLS
- [ ] Performance API
- [ ] Lighthouse 性能分析

## 三、文档导航

| 文件 | 内容 | 状态 |
|---|---|---|
| 浏览器架构.md | 浏览器多进程架构 | 待整理 |
| 浏览器渲染机制.md | DOM、CSSOM、Layout、Paint | 待整理 |
| URL输入到页面展示.md | 完整页面加载流程 | 待整理 |
| 浏览器事件机制.md | DOM 事件与观察者 API | 待整理 |
| HTTP协议.md | HTTP 请求、响应及状态码 | 待整理 |
| HTTPS与TLS.md | HTTPS 加密与握手 | 待整理 |
| TCP与UDP.md | 网络传输协议 | 待整理 |
| DNS解析.md | DNS 查询过程 | 待整理 |
| 浏览器缓存.md | 强缓存与协商缓存 | 待整理 |
| 跨域与CORS.md | 跨域机制与解决方案 | 待整理 |
| Web安全.md | XSS、CSRF 等 | 待整理 |
| 浏览器存储.md | Cookie、Storage、IndexedDB | 待整理 |
| Web性能优化.md | 性能指标与优化方案 | 待整理 |

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

## 五、参考资料

- [MDN Web 文档](https://developer.mozilla.org/zh-CN/docs/Web)
- [Chrome Developers](https://developer.chrome.com/docs)
- [web.dev](https://web.dev/)
- [HTTP 官方规范](https://httpwg.org/specs/)

持续更新中。
