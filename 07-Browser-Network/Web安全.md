# Web 安全：前端开发必须了解的常见攻击与防护

> Web 安全不是“前端加个判断就够了”。真正的安全需要前端、后端、浏览器和部署配置共同配合。前端开发尤其要理解 XSS、CSRF、点击劫持和敏感信息保护。

## 一、XSS：跨站脚本攻击 ⭐⭐⭐

XSS 全称 Cross-Site Scripting。攻击者设法让恶意脚本在其他用户的浏览器中执行。

通俗理解：网站本来只应该展示正常内容，但攻击者把恶意 JavaScript 混进页面，浏览器却把它当成正常代码执行了。

### 1. 存储型 XSS

攻击者把恶意内容提交到网站并被保存，例如评论、昵称、文章内容。

其他用户打开页面时，恶意内容被读取并执行。

### 2. 反射型 XSS

恶意内容通过 URL 参数或请求数据进入服务器响应，服务器没有正确处理，导致脚本在用户打开特定链接时执行。

### 3. DOM 型 XSS

问题发生在前端代码中：JavaScript 从不可信来源读取内容，再通过危险 DOM API 插入页面。

~~~javascript
// 危险示例：把不可信字符串当作 HTML 解析
const value = new URLSearchParams(location.search).get("name");
document.querySelector("#app").innerHTML = value;
~~~

更安全的文本展示方式：

~~~javascript
const value = new URLSearchParams(location.search).get("name");
document.querySelector("#app").textContent = value ?? "";
~~~

## 二、如何防范 XSS？⭐⭐⭐

1. **输出编码**：根据 HTML、属性、URL、JavaScript 等不同上下文进行正确编码。
2. **避免危险 DOM API**：不要把不可信字符串直接放入 innerHTML、outerHTML、insertAdjacentHTML 等位置。
3. **富文本必须消毒**：如果业务确实需要 HTML，使用经过维护的 HTML Sanitizer 库，配置允许的标签和属性。
4. **使用 CSP**：限制页面可以执行哪些脚本、加载哪些资源。
5. **使用 Trusted Types**：在支持的浏览器中帮助约束危险 DOM 注入入口。
6. **Cookie 设置 HttpOnly**：减少脚本直接读取会话 Cookie 的机会。

注意：HttpOnly 不能阻止 XSS 本身。如果页面已经被注入脚本，攻击者仍可能以用户身份发起请求、读取页面可见数据或执行页面操作。

## 三、CSRF：跨站请求伪造 ⭐⭐⭐

CSRF 全称 Cross-Site Request Forgery。

通俗理解：用户已经登录某个网站，浏览器保存了登录 Cookie。攻击者诱导用户访问恶意页面，恶意页面借用浏览器自动携带的登录凭据，向目标网站发起用户不知情的请求。

例如用户登录了转账网站，恶意页面试图诱导浏览器提交一笔转账请求。

### CSRF 为什么能发生？

因为某些身份凭据（尤其 Cookie）会由浏览器按规则自动附加到请求上。服务器如果只凭 Cookie 判断身份，却没有验证请求是否来自可信操作，就可能被利用。

## 四、如何防范 CSRF？⭐⭐⭐

- **CSRF Token**：服务端生成不可预测的令牌，前端在受保护请求中提交，服务端验证。
- **SameSite Cookie**：限制 Cookie 在跨站请求中的携带范围。
- **Origin / Referer 校验**：对敏感操作检查请求来源信息。
- **重新验证身份**：转账、修改密码等高风险操作可以要求再次验证。
- **避免用 GET 改变业务状态**：安全方法不应承担删除、转账等状态变更操作。

SameSite 常见值：

| 值 | 大致含义 |
|---|---|
| Strict | 更严格地限制跨站请求携带 |
| Lax | 允许部分顶级导航场景携带，通常是常见默认选择 |
| None | 允许跨站携带，但要求 Secure |

具体行为还受浏览器策略和 Cookie 上下文影响。

## 五、XSS 与 CSRF 的区别 ⭐⭐⭐

| 对比 | XSS | CSRF |
|---|---|---|
| 核心问题 | 恶意脚本在目标站点页面执行 | 借用用户身份发起非预期请求 |
| 攻击重点 | 页面脚本执行环境 | 用户浏览器自动携带的凭据 |
| 常见入口 | 不可信内容被当作 HTML/脚本执行 | Cookie 自动携带且缺少请求来源验证 |
| 主要防护 | 输出编码、消毒、CSP、Trusted Types | CSRF Token、SameSite、Origin 校验 |

XSS 和 CSRF 不是互斥关系。若攻击者已经成功执行同源 XSS，可能绕过部分 CSRF 防护，因此防 XSS 同样重要。

## 六、点击劫持（Clickjacking）

攻击者把真实网站嵌入到透明或伪装的 iframe 中，让用户以为点击的是页面上的普通按钮，实际点击的却是被嵌入网站的敏感操作。

常见防护：

~~~http
Content-Security-Policy: frame-ancestors 'self'
~~~

或使用 X-Frame-Options（较旧但仍可能遇到）：

~~~http
X-Frame-Options: SAMEORIGIN
~~~

frame-ancestors 可以控制哪些来源能够把页面嵌入 iframe。它应由服务端响应头配置。

## 七、SQL 注入基础

SQL 注入通常发生在后端：攻击者把恶意输入拼接进 SQL 语句，改变原本查询逻辑。

危险思路：

~~~javascript
// 伪代码：后端直接拼接用户输入到 SQL
const sql = "SELECT * FROM users WHERE name = '" + input + "'";
~~~

正确方向是后端使用参数化查询或预编译语句，不要把用户输入直接拼进 SQL 语句。

前端校验只能改善用户体验，不能代替服务端安全校验。

## 八、中间人攻击（MITM）

中间人攻击是攻击者插入通信双方之间，尝试窃听或篡改通信。

HTTPS/TLS 通过加密、完整性保护和证书身份验证降低这类风险。若用户忽略证书警告、设备被安装恶意根证书或终端本身被攻陷，风险仍可能存在。

## 九、Cookie 安全属性 ⭐⭐⭐

~~~http
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/
~~~

- **HttpOnly**：JavaScript 不能通过 document.cookie 读取该 Cookie。
- **Secure**：只通过安全连接发送。
- **SameSite**：控制跨站请求中 Cookie 的携带行为。
- **Path / Domain**：限制 Cookie 的适用路径和域。
- **Max-Age / Expires**：控制生命周期。

不要把敏感会话凭据随意放在 URL 查询参数中，因为 URL 可能进入历史记录、日志和 Referer 等位置。

## 十、Token 安全

Token 是一种身份或授权凭据的承载形式，常见 JWT 只是其中一种格式。

前端需要注意：

- 不要把 Token 写进 URL。
- 不要在日志、错误上报中泄露 Token。
- localStorage 中的 Token 可被同源 XSS 读取。
- HttpOnly Cookie 可以减少脚本直接读取凭据的风险，但需要配合 CSRF 防护。
- Token 应设置合理过期时间、刷新和撤销策略。
- 服务端必须校验 Token 的签名、有效期、受众等必要信息，不能只解析其中的内容。

## 十一、前端安全检查清单

- 不把用户输入直接拼接到 innerHTML。
- 富文本内容使用可信消毒方案。
- 敏感操作由后端进行权限验证。
- 登录态 Cookie 使用合适的 HttpOnly、Secure、SameSite。
- 对敏感写操作进行 CSRF 防护。
- 配置合理 CSP，减少脚本注入影响。
- 不把密钥、服务端凭据写进前端打包产物。
- 对第三方依赖进行版本和安全审查。

## 十二、面试重点与自测

- [ ] XSS 是什么？存储型、反射型、DOM 型有什么区别？
- [ ] 为什么 textContent 通常比 innerHTML 更适合显示普通文本？
- [ ] HttpOnly 能否彻底防止 XSS？
- [ ] CSRF 为什么会利用浏览器自动携带 Cookie 的特点？
- [ ] CSRF Token 和 SameSite 分别解决什么问题？
- [ ] XSS 和 CSRF 的核心区别是什么？
- [ ] 点击劫持是什么？如何防护？
- [ ] SQL 注入主要应该由哪一层防护？
- [ ] HttpOnly、Secure、SameSite 分别有什么作用？

## 十三、参考资料

- [MDN：Web 安全](https://developer.mozilla.org/en-US/docs/Web/Security)
- [OWASP：Cross Site Scripting Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP：Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [MDN：CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)

---
**学习标准：** 能区分 XSS 与 CSRF，能解释各类攻击的发生条件，并能从前端和服务端两个角度提出防护措施。
