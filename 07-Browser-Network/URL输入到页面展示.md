# URL 输入到页面展示：浏览器打开网页的完整过程

> 这是浏览器面试中非常经典的一道综合题。回答时不要只背“DNS、TCP、HTTP、渲染”，要能讲清每一步在解决什么问题。

## 一、先看整体流程 ⭐⭐⭐

~~~text
输入 URL
  |
解析 URL，判断是搜索词还是网址
  |
检查缓存、Service Worker等可能的拦截或复用路径
  |
DNS查询：域名对应哪个IP？
  |
建立连接：TCP，或HTTP/3使用QUIC
  |
HTTPS场景进行TLS握手
  |
发送HTTP请求
  |
服务器处理并返回响应
  |
浏览器解析HTML，构建DOM
  |
加载CSS、JS、图片等资源
  |
样式计算、Layout、Paint、Composite
  |
页面呈现并持续响应用户操作
~~~

这是一条帮助记忆的主线。真实浏览器可能复用连接、命中缓存、使用代理、Service Worker 或预加载，因此部分步骤可能被跳过或并行。

## 二、第一步：解析 URL

URL 是 Uniform Resource Locator，统一资源定位符。

例如：

~~~text
https://www.example.com:443/products?id=10#detail
~~~

| 部分 | 示例 | 含义 |
|---|---|---|
| 协议 | https | 使用什么协议访问 |
| 主机名 | www.example.com | 目标域名 |
| 端口 | 443 | 服务端口，HTTPS 默认端口 |
| 路径 | /products | 请求哪个资源 |
| 查询参数 | id=10 | 传递额外参数 |
| 片段 | #detail | 页面内定位信息，通常不会发送给服务器 |

浏览器还要判断用户输入的是完整 URL，还是搜索关键词。

## 三、第二步：检查缓存和已有能力

发起网络请求前，浏览器可能先检查：

- 当前资源是否能从强缓存直接使用。
- 是否存在可复用的网络连接。
- 是否由 Service Worker 接管请求。
- 是否有预加载、预连接等提前建立的资源。

因此并不是每次打开网页都必须重新 DNS 查询、建立 TCP 连接、下载所有资源。

## 四、第三步：DNS 查询，找到服务器 IP

用户输入的是域名，人类容易记住域名，网络通信通常需要 IP 地址。

DNS 就像互联网的电话簿：把域名解析成 IP 地址。

浏览器或操作系统可能先查本地缓存、hosts 文件，再向 DNS 解析器查询。详细流程见《DNS解析.md》。

## 五、第四步：建立网络连接

### HTTP/1.1、HTTP/2 常见情况

通常通过 TCP 建立可靠连接。TCP 会先进行三次握手，确认通信双方能够收发数据。

### HTTPS

在 TCP 连接建立后，还需要进行 TLS 握手，协商加密参数并验证服务器证书。

### HTTP/3

HTTP/3 基于 QUIC，QUIC 使用 UDP 作为底层传输，并在协议中实现可靠传输、拥塞控制和 TLS 1.3 集成等能力。它不是“UDP 不可靠所以 HTTP/3 不可靠”。

## 六、第五步：发送 HTTP 请求

浏览器发送请求，告诉服务器：

- 想访问哪个路径。
- 使用什么请求方法。
- 能接受什么内容格式。
- 是否携带 Cookie 等信息。
- 请求体中是否有提交的数据。

例如：

~~~http
GET /products?id=10 HTTP/1.1
Host: www.example.com
Accept: text/html
~~~

实际 HTTP/2 和 HTTP/3 在线路上的编码方式与 HTTP/1.1 文本格式不同，但请求语义类似。

## 七、第六步：服务器处理并返回响应

服务器可能经历：

1. Web 服务器接收请求。
2. 路由层判断请求交给哪个接口。
3. 业务逻辑处理。
4. 查询数据库或其他服务。
5. 生成 HTML 或 JSON 等响应。
6. 返回状态码、响应头和响应体。

例如：

~~~http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: max-age=60
~~~

响应体中可能是 HTML，也可能是 JSON、图片、脚本或其他资源。

## 八、第七步：浏览器解析和渲染页面

拿到 HTML 后，浏览器通常会边接收边解析：

1. HTML 解析成 DOM。
2. 发现 CSS、JavaScript、图片等外部资源并发起请求。
3. 解析 CSS，构建 CSSOM。
4. 执行会影响解析流程的脚本。
5. 根据 DOM 和样式计算渲染所需结构。
6. Layout 计算位置和尺寸。
7. Paint 绘制。
8. Raster 和 Composite 等步骤将内容呈现到屏幕。

浏览器解析 HTML 时可能发现新的资源，因此页面往往不是等 HTML 完全下载完才开始请求 CSS、JS 和图片。

## 九、DOMContentLoaded 和 load 的区别 ⭐⭐⭐

### DOMContentLoaded

HTML 文档解析完成，并且延迟执行的脚本（例如 defer 脚本和模块脚本）执行完成后触发。它不要求所有图片等资源都加载完成。

### load

页面依赖的资源加载完成后触发，例如图片、样式表、脚本等资源。

~~~javascript
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM解析完成");
});

window.addEventListener("load", () => {
  console.log("页面及相关资源加载完成");
});
~~~

**好记版：**

- DOMContentLoaded：HTML 结构准备好了。
- load：页面依赖的资源也基本加载完成了。

不要把 DOMContentLoaded 理解为“所有图片和异步请求都结束”。

## 十、面试回答模板

“用户输入 URL 后，浏览器先解析 URL，并根据情况检查缓存和 Service Worker。随后通过 DNS 获取服务器 IP，建立网络连接。HTTP/1.1 和 HTTP/2 通常使用 TCP，HTTPS 还会进行 TLS 握手；HTTP/3 使用 QUIC。连接准备好后浏览器发送 HTTP 请求，服务器处理并返回响应。浏览器拿到 HTML 后解析 DOM，同时加载 CSS、JS、图片等资源，构建 CSSOM，计算样式和布局，再经过绘制、栅格化和合成，最终把页面显示出来。过程中浏览器还会持续处理用户事件和后续资源加载。”

## 十一、面试自测

- [ ] URL 由哪些部分组成？
- [ ] DNS 解析解决什么问题？
- [ ] TCP 三次握手发生在什么阶段？
- [ ] HTTPS 为什么还需要 TLS 握手？
- [ ] HTTP/3 与 HTTP/2 的底层传输有什么区别？
- [ ] 浏览器拿到 HTML 后为什么还要请求很多资源？
- [ ] DOMContentLoaded 和 load 有什么区别？
- [ ] 哪些情况会让浏览器跳过 DNS 或连接建立？

## 十二、参考资料

- [MDN：关键渲染路径](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
- [MDN：HTTP 概览](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)
- [MDN：浏览器如何工作](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work)

---
**学习标准：** 能用 1～2 分钟讲清 URL 到页面显示的主流程，并能解释缓存、DNS、TCP/TLS、HTTP 和渲染各自解决的问题。
