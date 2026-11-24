# 跨域与 CORS：为什么浏览器不让页面随便读取别的网站数据？

> 可以把同源策略理解成浏览器给网页设置的“安全边界”。CORS 则是服务器明确告诉浏览器：哪些来源可以读取我的响应。

## 一、什么是同源策略？⭐⭐⭐

浏览器的同源策略（Same-Origin Policy）是一项重要安全机制，用来限制一个源的脚本随意读取另一个源的资源。

一个源由三个部分组成：

1. 协议（scheme）
2. 主机名（host）
3. 端口（port）

三者都相同，才算同源。

例如页面地址：

~~~text
https://app.example.com:443
~~~

| 目标地址 | 是否同源 | 原因 |
|---|---|---|
| https://app.example.com/page | 是 | 协议、主机、端口相同 |
| http://app.example.com | 否 | 协议不同 |
| https://api.example.com | 否 | 主机不同 |
| https://app.example.com:8443 | 否 | 端口不同 |

**注意：** 路径不同不影响源判断；子域名不同通常就是不同源。

## 二、为什么会有跨域问题？

假设用户登录了银行网站，随后访问一个恶意网站。如果恶意网站能随意读取银行页面的数据，就可能窃取用户信息。

同源策略限制网页脚本读取其他源的敏感响应，降低这类风险。

跨域不是说浏览器完全不能向其他域名发送请求。很多跨源请求可以发出，只是浏览器可能不允许当前页面的 JavaScript 读取响应内容。

## 三、什么是 CORS？⭐⭐⭐

CORS 全称 Cross-Origin Resource Sharing，跨源资源共享。

它是一套基于 HTTP 响应头的机制：服务器通过响应头告诉浏览器，哪些源可以读取响应。

例如服务器返回：

~~~http
Access-Control-Allow-Origin: https://app.example.com
~~~

意思是允许来自这个源的网页读取响应。

CORS 不是前端代码单方面就能开启的功能。核心授权信息需要服务端正确返回。

## 四、简单请求与预检请求 ⭐⭐⭐

### 1. 简单请求

符合 CORS 简单请求条件的请求，浏览器通常可以直接发送，不需要先发 OPTIONS 预检。

典型条件包括：

- 请求方法是 GET、HEAD 或 POST。
- 手动设置的请求头只使用 CORS safelisted headers。
- Content-Type 属于允许的简单类型，例如 application/x-www-form-urlencoded、multipart/form-data 或 text/plain。
- 没有触发其他需要预检的条件。

例如普通 GET 请求可能属于简单请求：

~~~javascript
fetch("https://api.example.com/list");
~~~

浏览器发送请求后，检查服务器返回的 CORS 响应头。如果不允许当前源，JavaScript 读取响应会被阻止。

### 2. 预检请求（Preflight）

如果请求不符合简单请求条件，浏览器会先发送 OPTIONS 请求，询问服务器是否允许真正的请求。

例如：

~~~javascript
fetch("https://api.example.com/users", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "X-Token": "abc"
  },
  body: JSON.stringify({ name: "Tom" })
});
~~~

浏览器可能先发：

~~~http
OPTIONS /users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type,x-token
~~~

服务器允许时返回类似：

~~~http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: PUT
Access-Control-Allow-Headers: Content-Type, X-Token
Access-Control-Max-Age: 600
~~~

预检通过后，浏览器才继续发送真正的 PUT 请求。

## 五、常见 CORS 响应头

| 响应头 | 作用 |
|---|---|
| Access-Control-Allow-Origin | 允许哪个源读取响应 |
| Access-Control-Allow-Methods | 预检时允许哪些方法 |
| Access-Control-Allow-Headers | 预检时允许哪些请求头 |
| Access-Control-Allow-Credentials | 是否允许凭据模式 |
| Access-Control-Max-Age | 预检结果可以缓存多久 |
| Access-Control-Expose-Headers | 允许前端脚本读取哪些非 safelisted 响应头 |

## 六、携带 Cookie 的跨域请求 ⭐⭐⭐

前端 fetch 默认 credentials 为 same-origin。跨源请求如果要携带 Cookie，通常需要：

~~~javascript
fetch("https://api.example.com/profile", {
  credentials: "include"
});
~~~

服务端需要返回明确的源：

~~~http
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
~~~

**重要限制：** 允许凭据时，Access-Control-Allow-Origin 不能使用通配符 *，需要返回明确的允许源。

即使 CORS 配置正确，Cookie 是否真的发送还受 Cookie 的 Domain、Path、Secure、SameSite 等属性和浏览器第三方 Cookie 策略影响。

## 七、CORS 常见错误排查

1. 先看浏览器 Console 中具体的 CORS 报错。
2. 在 Network 中检查真正请求和 OPTIONS 预检请求。
3. 确认服务器是否返回 Access-Control-Allow-Origin。
4. 有自定义请求头或非简单方法时，检查预检响应中的 Methods 和 Headers。
5. 携带 Cookie 时，检查 credentials、Allow-Credentials 和 Cookie 的 SameSite/Secure。
6. 如果使用 CDN 或代理，检查它是否正确转发并缓存 CORS 响应头。

不要用前端设置一个请求头就期待绕过 CORS，浏览器安全策略不是这样工作的。

## 八、常见跨域解决方案

### 1. CORS（推荐的标准方案）

服务端配置允许的来源、方法、请求头和凭据策略。

### 2. 开发环境反向代理

例如 Vite 开发服务器代理：

~~~javascript
export default {
  server: {
    proxy: {
      "/api": {
        target: "https://api.example.com",
        changeOrigin: true
      }
    }
  }
};
~~~

浏览器请求的是本地开发服务器同源地址，由开发服务器代为请求后端。

注意：开发代理主要解决开发环境问题；生产环境需要由真实网关、Nginx 或后端部署对应代理配置。

### 3. JSONP（历史方案）

JSONP 利用 script 标签可以跨源加载脚本的特点，通过回调函数接收数据。

局限：

- 主要支持 GET。
- 返回内容必须是可执行 JavaScript。
- 不适合现代通用 API。
- 必须信任返回脚本，否则存在执行恶意代码的风险。

### 4. postMessage

不同源窗口、iframe 或窗口之间可以使用 postMessage 通信。

~~~javascript
// 发送方
iframe.contentWindow.postMessage(
  { type: "HELLO" },
  "https://child.example.com"
);

// 接收方
window.addEventListener("message", (event) => {
  if (event.origin !== "https://parent.example.com") return;
  console.log(event.data);
});
~~~

不要随意使用 "*" 作为 targetOrigin，也不要不校验 event.origin 就信任消息。

## 九、面试重点与自测

- [ ] 什么是同源策略？源由哪三部分组成？
- [ ] 跨域请求一定不能发出去吗？
- [ ] CORS 是由前端还是服务端配置？
- [ ] 简单请求与预检请求有什么区别？
- [ ] OPTIONS 预检请求会携带哪些信息？
- [ ] 携带 Cookie 的跨域请求需要什么配置？
- [ ] 为什么 Allow-Credentials 为 true 时不能把 Allow-Origin 设为 *？
- [ ] 开发环境代理为什么可以解决本地跨域？
- [ ] JSONP 有什么局限？
- [ ] postMessage 为什么必须校验 origin？

## 十、参考资料

- [MDN：跨源资源共享（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/CORS)
- [MDN：同源策略](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [MDN：Fetch credentials](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials)
- [Vite：Server Proxy](https://vite.dev/config/server-options#server-proxy)

---
**学习标准：** 能判断同源与跨源，能读懂 OPTIONS 预检过程，并能按是否携带 Cookie 正确配置 CORS。
