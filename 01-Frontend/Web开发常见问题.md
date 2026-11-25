# Web 开发常见问题：从现象到原因的排查指南

> 这是一份**排查手册**，不是单纯的面试题。排错不要一上来就猜原因，先确定问题出在网络、脚本、样式、浏览器状态，还是部署环境。

## 一、遇到问题先做什么？ ⭐⭐⭐

推荐一个通用流程：

```text
复现问题
   ↓
记录发生条件（网址、环境、操作、设备）
   ↓
看 Console / Network / Elements / Performance
   ↓
提出一两个最可能的原因
   ↓
一次只改变一个关键条件进行验证
   ↓
修复并补充回归测试
```

**核心习惯：先拿证据，再下结论。** 例如“接口不通”，要先看究竟是 DNS、CORS、404、401、500，还是超时，不要一概认为是后端坏了。

## 二、问题 1：页面打开后白屏 ⭐⭐⭐

**常见原因：**

- JavaScript 运行时报错，应用初始化中断。
- JS/CSS 资源 404 或被浏览器安全策略阻止。
- 构建产物的资源基础路径不正确。
- 路由配置与部署服务器不匹配。
- 页面一直处于 Loading，异常没处理。

**排查步骤：**

1. 打开 DevTools → **Console**，看是否有 Uncaught 错误。
2. 打开 **Network**，过滤 JS/CSS，看是否有 404/403/500。
3. 检查页面 HTML 是否真的加载、根节点是否存在。
4. 如果仅生产环境出问题，核对构建的资源路径、环境变量和静态服务器配置。
5. 如果只有部分路由刷新白屏，重点检查 SPA History 路由回退配置。

**面试表达：** 先定位资源问题还是 JS 初始化问题，再根据 Network/Console 证据缩小范围。

## 三、问题 2：接口请求失败，到底是谁的问题？ ⭐⭐⭐

| 现象 | 可能原因 | 优先检查 |
| --- | --- | --- |
| 404 | 路径错误、资源不存在 | URL、网关路由 |
| 401 | 未提供有效认证凭据 | 登录态、Cookie、Authorization |
| 403 | 当前请求未获授权 | 权限、访问策略 |
| 500 | 服务端内部异常 | 响应体、服务端日志 |
| CORS 报错 | 浏览器拒绝脚本读取跨源响应 | Origin、预检与响应头 |
| `net::ERR_NAME_NOT_RESOLVED` | DNS 无法解析域名 | 域名与 DNS |
| 请求长时间等待 | 网络不稳定或服务端慢 | Timing、超时、服务链路 |

**易错：** `fetch()` 遇到 404/500 通常不会自动进入 `catch`；它仍会 resolve 一个 Response，需要检查 `response.ok`。

```javascript
try {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  console.log(result);
} catch (error) {
  console.error('请求失败：', error);
}
```

## 四、问题 3：刷新子路由后出现 404 ⭐⭐⭐

典型现象：点击菜单进入 `/orders` 正常，但手动刷新 `/orders` 却返回 404。

**原因**：使用 HTML5 History 模式时，刷新会向服务器直接请求 `/orders`；服务器如果只认识 `/index.html`，就可能返回 404。

**解决思路**：静态服务器对前端路由路径设置回退到 `index.html`（但 API 路径与真实静态资源不应无条件回退）。

注意：Hash 模式的 `#/orders` 片段通常不会发送给服务器，因此不会遇到完全相同的服务器路由问题。

## 五、问题 4：DOM 查找是 null，事件绑定失败 ⭐⭐⭐

```javascript
const button = document.querySelector('#save');
button.addEventListener('click', save); // button 可能是 null
```

**原因候选**：

- 选择器拼写错。
- 脚本执行时元素尚未解析。
- 元素被条件渲染删除。
- 元素存在于 iframe 或 Shadow DOM 中。

**解决思路**：检查 Elements 面板；使用合适的脚本执行时机；对可能不存在的元素加判断；框架项目要尊重组件生命周期。

```javascript
const button = document.querySelector('#save');
button?.addEventListener('click', save);
```

但不能只用 `?.` 掩盖本应存在却找不到的元素；开发时仍应查明原因。

## 六、问题 5：样式不生效或被覆盖 ⭐⭐⭐

排查顺序：

1. **Elements → Styles** 检查规则是否命中。
2. 看是否被其他选择器或 `!important` 覆盖。
3. 看组件是否使用 scoped CSS、CSS Modules 或 Shadow DOM。
4. 看是否存在媒体查询、层叠层（@layer）、继承等影响。
5. 看最终 **Computed** 样式，而不是只看源码中写了什么。

**易错**：把 `z-index: 99999` 当作万能药。若元素位于较低的层叠上下文，子元素再大也可能无法盖过外部上下文。

## 七、问题 6：页面出现横向滚动或布局被撑开 ⭐⭐⭐

常见来源：

- 固定宽度容器比屏幕宽。
- 图片或长英文文本无法换行。
- Flex/Grid 项目受到默认最小尺寸约束。
- `width: 100%` 再叠加 padding（content-box）。

```css
.main { flex: 1; min-width: 0; }
img { max-width: 100%; height: auto; }
.long-text { overflow-wrap: anywhere; }
```

不要简单用 `body { overflow-x: hidden }` 把问题盖掉，这可能裁剪重要内容。

## 八、问题 7：图片/字体没有加载 ⭐⭐

**先看 Network：**

- 404：文件路径或部署基础路径错误。
- 403：访问权限不足。
- Mixed Content：HTTPS 页面请求 HTTP 资源被限制。
- CORS：跨源字体等资源可能需要正确的 CORS 响应头。
- 资源虽加载但不显示：检查 CSS、宽高、可见性与布局。

开发环境可用的相对路径，在生产环境部署到子路径后不一定正确；应结合构建工具配置核对资源 base 路径。

## 九、问题 8：重复请求、竞态条件与旧结果覆盖新结果 ⭐⭐⭐

场景：用户快速输入“A”后又输入“AB”。搜索 A 的请求比 AB 晚返回，页面最后却显示 A 的结果。

这叫**竞态条件（Race Condition）**：多个异步任务完成顺序不确定。

常用处理方式之一是取消旧请求：

```javascript
let controller;

async function search(keyword) {
  controller?.abort();
  controller = new AbortController();
  const signal = controller.signal;

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`, {
      signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!signal.aborted) render(data);
  } catch (error) {
    if (error.name !== 'AbortError') console.error(error);
  }
}
```

如果请求已在服务器处理，取消浏览器请求不代表服务端操作被自动撤销。涉及支付、下单等写操作仍需要服务端幂等与正确业务约束。

## 十、问题 9：缓存导致部署后还是旧页面 ⭐⭐⭐

可能原因：

- HTML 入口文件设置了过长的强缓存。
- JS/CSS 文件名没变化，但内容变了。
- CDN 缓存没有更新。
- Service Worker 继续返回旧资源。

排查时打开 Network 查看资源是否来自缓存，以及响应头 `Cache-Control`、`ETag` 等。对带内容哈希的静态资源可以设置较长缓存，而 HTML 入口通常应该及时验证更新。

**注意**：DevTools 的 Disable cache 不能代表所有真实用户缓存情况，Service Worker 的缓存也需要单独检查。

## 十一、问题 10：页面操作卡顿，应该从哪里入手？ ⭐⭐⭐

先判断卡在什么阶段：

- 请求慢：Network Timing，接口或资源下载耗时。
- JS 慢：Performance 中长任务、脚本计算耗时。
- 布局慢：反复 Layout、同步读取几何信息。
- 绘制慢：复杂阴影、滤镜、大量元素绘制。
- 大列表：DOM 数量过多，考虑分页或虚拟列表。

**不要只凭感觉说“框架太慢”。** 把性能问题复现、录制、定位，才能找到实际瓶颈。

## 十二、问题 11：模块导入报错 ⭐⭐

典型错误：

- 文件只导出了 default，却使用 `{ name }` 按命名导入。
- 浏览器 `<script>` 没有 `type="module"`，却使用静态 import。
- 浏览器直接用 `file://` 加载原生模块，触发安全策略限制。
- 生产构建路径或文件大小写不一致，在 Linux 服务器上报 404。

检查 Console 的具体报错和 Network 加载的文件路径，区分“语法问题”“导出类型不匹配”和“资源加载失败”。

## 十三、面试中如何讲一次真实排错？

推荐按 **现象 → 假设 → 证据 → 修复 → 验证** 五步：

1. 现象：部署后某个二级页面刷新出现 404。
2. 假设：前端 History 路由没有配置服务器回退。
3. 证据：Network 中请求 `/orders` 返回 404，直接访问首页正常。
4. 修复：网关将非 API、非静态资源的前端路由请求回退到 `index.html`。
5. 验证：刷新多个二级页面正常，静态资源和 API 错误仍能正确返回。

这比只说“我改了 Nginx 配置就好了”更能体现分析能力。

## 十四、问题排查工具速查

| 工具 | 优先用来查什么 |
| --- | --- |
| Console | JS 运行时错误、未捕获异常、安全策略提示 |
| Network | 状态码、请求头、响应头、资源大小、耗时 |
| Elements / Computed | DOM 结构、最终样式、层叠冲突 |
| Performance | 主线程卡顿、布局、绘制、长任务 |
| Application | Cookie、Storage、Service Worker 和缓存 |
| Sources | 断点调试、调用栈、源码映射 |

## 十五、面试自测

- [ ] 页面白屏，你会先打开哪个 DevTools 面板？为什么？
- [ ] API 返回 404 和浏览器报 CORS，如何区别？
- [ ] SPA 子路由刷新 404 的根本原因是什么？
- [ ] `querySelector` 返回 null 有哪些可能原因？
- [ ] 为什么 z-index 设置很大仍可能被遮挡？
- [ ] 如何处理旧搜索请求覆盖新搜索结果？
- [ ] 为什么部署后可能一直看到旧 JS？
- [ ] 讲一个你能用“现象—证据—修复—验证”说明的问题。

## 十六、参考资料

- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [MDN：Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
- [MDN：History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)
- [MDN：HTTP 缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Guides/Caching)

---
**掌握标准：** 遇到页面、请求或样式异常时，能用工具和证据逐层排查，不靠反复猜测与试错。
