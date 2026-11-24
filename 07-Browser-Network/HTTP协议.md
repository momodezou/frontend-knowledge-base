# HTTP 协议：前端如何和服务器交流？

> 可以把 HTTP 理解成浏览器和服务器之间的一套“通信格式与办事规则”：客户端说明要什么，服务器说明处理结果是什么。

## 一、HTTP 是什么？⭐⭐⭐

HTTP 全称 HyperText Transfer Protocol，超文本传输协议，是应用层协议。

它采用经典的客户端—服务器模式：

1. 浏览器（客户端）发起请求。
2. 服务器接收请求并处理。
3. 服务器返回响应。
4. 浏览器根据响应展示页面或处理数据。

HTTP 本身是无状态协议：服务器不会仅凭 HTTP 协议自动记住上一次请求的业务状态。Cookie、Session、Token 等机制可以帮助应用维持登录状态。

## 二、HTTP 请求由什么组成？

HTTP/1.1 的请求可以直观理解为：

~~~http
POST /api/users HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer token-value

{"name":"Tom"}
~~~

主要包括：

- **请求行**：请求方法、路径、HTTP 版本。
- **请求头**：告诉服务器请求的附加信息。
- **空行**：分隔请求头与请求体。
- **请求体**：可选，常用于提交数据。

## 三、HTTP 响应由什么组成？

~~~http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{"id":1,"name":"Tom"}
~~~

主要包括状态行、响应头、空行和响应体。响应体可以没有，例如 204 响应。

## 四、常见 HTTP 请求方法 ⭐⭐⭐

| 方法 | 通俗理解 | 常见用途 |
|---|---|---|
| GET | 获取 | 查询数据 |
| POST | 提交/创建 | 新增数据、提交表单 |
| PUT | 整体替换 | 用新表示替换目标资源 |
| PATCH | 局部修改 | 只修改部分字段 |
| DELETE | 删除 | 删除资源 |
| HEAD | 只看响应头 | 检查资源信息，不返回响应体 |
| OPTIONS | 询问支持什么 | 查看通信选项，也常用于 CORS 预检 |

### 安全性与幂等性

- **安全方法**：按协议语义，客户端请求不应要求服务器改变资源状态。GET 是安全方法。
- **幂等方法**：同样的请求执行一次或多次，预期最终效果相同。GET、PUT、DELETE 通常具有幂等语义。
- POST 通常不保证幂等；业务系统可以通过幂等键等方式设计重复提交保护。

注意：幂等不代表每次响应内容完全一样，也不代表服务器内部绝对没有日志等副作用。

## 五、HTTP 状态码 ⭐⭐⭐

状态码第一位代表大类：

| 范围 | 类别 | 含义 |
|---|---|---|
| 1xx | 信息响应 | 请求处理过程中的提示 |
| 2xx | 成功 | 请求被成功接收、理解或处理 |
| 3xx | 重定向 | 需要进一步操作或使用缓存结果 |
| 4xx | 客户端错误 | 请求存在问题或无权访问 |
| 5xx | 服务端错误 | 服务器处理请求时出错 |

常见状态码：

| 状态码 | 含义 | 常见场景 |
|---|---|---|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 成功，但没有响应体 |
| 301 | Moved Permanently | 永久重定向 |
| 302 | Found | 临时重定向 |
| 304 | Not Modified | 资源未变化，可使用缓存 |
| 400 | Bad Request | 请求格式或参数不正确 |
| 401 | Unauthorized | 缺少或无效的身份认证凭据 |
| 403 | Forbidden | 服务器理解请求，但拒绝授权访问 |
| 404 | Not Found | 资源不存在或服务器不愿披露 |
| 405 | Method Not Allowed | 当前资源不支持该方法 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器内部错误 |
| 502 | Bad Gateway | 网关收到上游无效响应 |
| 503 | Service Unavailable | 服务暂时不可用 |
| 504 | Gateway Timeout | 网关等待上游超时 |

**401 和 403 的区别：** 401 通常表示需要有效身份凭据；403 表示服务器拒绝当前访问。不要把它们都简单说成“没登录”。

## 六、常见请求头和响应头

| Header | 作用 |
|---|---|
| Host | HTTP/1.1 中指定目标主机 |
| Accept | 客户端希望接收的媒体类型 |
| Content-Type | 当前消息体是什么类型 |
| Authorization | 认证凭据 |
| Cookie | 客户端向服务器发送 Cookie |
| Set-Cookie | 服务器要求浏览器设置 Cookie |
| Cache-Control | 缓存策略 |
| ETag | 资源版本标识符 |
| If-None-Match | 协商缓存时询问资源是否变化 |
| Origin | 发起请求的源，常用于 CORS |
| Referer | 表示请求来源页面信息，可能受策略限制 |

## 七、HTTP/1.0、HTTP/1.1、HTTP/2、HTTP/3 ⭐⭐⭐

### HTTP/1.0

早期 HTTP 版本，典型实现中每个请求常建立独立连接，连接复用能力有限。

### HTTP/1.1

- 默认支持持久连接（Keep-Alive）。
- 引入更完善的缓存控制和范围请求等能力。
- 同一连接可以连续处理多个请求，但传统管线化存在队头阻塞等问题。
- 浏览器常通过多个连接并发请求资源。

### HTTP/2

- 使用二进制分帧。
- 多路复用：一个连接中可以交错传输多个流。
- 头部压缩（HPACK）。
- 支持服务器推送，但现代浏览器和生态中该能力已不再是常用方案。

HTTP/2 缓解了 HTTP 层面的队头阻塞，但底层仍使用 TCP；TCP 丢包可能影响同一连接上的多个流。

### HTTP/3

- 基于 QUIC，底层使用 UDP。
- QUIC 在传输层实现可靠传输、拥塞控制和流管理。
- 不同流之间的传输隔离更好，避免 TCP 单连接丢包造成的跨流队头阻塞。
- TLS 1.3 与 QUIC 握手集成。

**好记版：** HTTP/1.1 主要靠持久连接和多连接；HTTP/2 在一条 TCP 连接上多路复用；HTTP/3 使用 QUIC，减少 TCP 层队头阻塞影响。

## 八、HTTP 是无状态的，为什么网站能记住登录？

1. 用户登录。
2. 服务器验证账号密码。
3. 服务器通过 Set-Cookie 或响应数据建立会话凭据。
4. 后续请求浏览器按 Cookie 规则携带凭据。
5. 服务器据此识别用户。

这属于在无状态 HTTP 之上构建会话状态。

## 九、WebSocket 是什么？

HTTP 主要是请求—响应模式。WebSocket 建立连接后，客户端和服务器可以在同一连接上双向发送消息，适合聊天、实时通知、在线协作等场景。

经典 WebSocket 握手从 HTTP Upgrade 请求开始；安全版本使用 wss。

## 十、面试重点与自测

- [ ] HTTP 为什么是无状态协议？
- [ ] 请求报文和响应报文由哪些部分组成？
- [ ] GET 和 POST 有什么区别？
- [ ] PUT 和 PATCH 有什么区别？
- [ ] 安全方法与幂等方法有什么区别？
- [ ] 301、302、304 分别是什么？
- [ ] 401 和 403 有什么区别？
- [ ] HTTP/1.1、HTTP/2、HTTP/3 的主要区别是什么？
- [ ] HTTP/2 为什么仍可能受到 TCP 队头阻塞影响？
- [ ] WebSocket 适合什么业务场景？

## 十一、参考资料

- [MDN：HTTP 概览](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/Overview)
- [MDN：HTTP 请求方法](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)
- [MDN：HTTP 状态码](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status)
- [HTTP Semantics（RFC 9110）](https://www.rfc-editor.org/rfc/rfc9110)

---
**学习标准：** 能读懂常见请求与响应，能解释方法、状态码和 HTTP 各版本的关键差异。
