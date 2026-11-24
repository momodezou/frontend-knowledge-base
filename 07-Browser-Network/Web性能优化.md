# Web 性能优化：怎样让页面打开更快、操作更流畅？

> 性能优化不是“把代码压缩一下”就结束了。要先知道用户慢在哪里，再选择合适的方法，最后用数据验证有没有变好。

## 一、先理解前端性能的几个方向 ⭐⭐⭐

一个网页的性能可以粗略分成：

1. **加载性能**：页面多久能显示主要内容？
2. **交互性能**：点击、输入、滚动时是否响应及时？
3. **视觉稳定性**：页面加载时会不会突然跳动？
4. **资源效率**：是否下载了太多 JS、CSS、图片和字体？
5. **运行稳定性**：是否存在长任务、内存泄漏和频繁布局？

不要只盯着一个“页面加载完成时间”。用户可能已经看到主要内容，但页面仍在下载其他资源；也可能页面很快出现，却点击后卡顿。

## 二、Core Web Vitals：最重要的用户体验指标 ⭐⭐⭐

Core Web Vitals（核心 Web 指标）目前主要包括：

| 指标 | 衡量什么 | 良好标准 |
|---|---|---|
| LCP | 最大内容元素出现速度，反映主要内容加载体验 | ≤ 2.5 秒 |
| INP | 用户交互到页面给出下一次视觉反馈的响应情况 | ≤ 200 毫秒 |
| CLS | 页面意外布局偏移程度 | ≤ 0.1 |

这些“良好”阈值通常按真实用户数据的第 75 百分位评估，并分别看移动端和桌面端。

### 1. LCP（Largest Contentful Paint）

LCP 表示视口中最大内容元素的渲染时间，常见候选包括大图、视频封面或大块文本。

优化方向：

- 不要让首屏关键图片懒加载。
- 压缩首屏图片，使用合适尺寸和现代格式。
- 必要时使用 preload 提前加载关键图片或字体。
- 缩短服务器响应时间。
- 减少阻塞首屏渲染的 CSS 和 JavaScript。
- 让关键内容尽早出现在 HTML 中。

### 2. INP（Interaction to Next Paint）

INP 衡量用户点击、触摸、键盘输入等交互后，页面多久能给出下一次视觉反馈。

优化方向：

- 拆分长 JavaScript 任务。
- 避免一次性处理大量数据。
- 将非紧急工作延后。
- 减少复杂同步布局和布局抖动。
- 让事件处理函数尽快完成关键反馈。
- 必要时使用 Web Worker 承担计算任务。

INP 已取代 FID 成为 Core Web Vitals 的交互指标。FID 是历史指标，面试时要知道这个变化。

### 3. CLS（Cumulative Layout Shift）

CLS 衡量页面意外布局偏移。例如图片加载后突然撑开空间，导致用户刚要点击的按钮被挤走。

优化方向：

- 图片和视频预先声明宽高或 aspect-ratio。
- 广告、推荐位预留固定空间。
- 避免在已有内容上方突然插入内容。
- 字体加载时关注字体替换造成的布局变化。
- 动画尽量使用 transform，而不是反复改变布局尺寸。

## 三、其他常见性能指标

| 指标 | 含义 | 用途 |
|---|---|---|
| TTFB | Time to First Byte，收到响应第一个字节的时间 | 观察网络、服务端响应速度 |
| FCP | First Contentful Paint，首次绘制文本、图片等内容 | 观察页面开始出现内容的时间 |
| DOMContentLoaded | DOM 解析完成并满足事件触发条件的时间点 | 观察文档解析阶段 |
| load | 页面 load 事件触发时间 | 观察依赖资源加载情况 |
| TBT | Total Blocking Time，实验室环境中长任务阻塞时间的累计指标 | 辅助分析主线程阻塞 |

不要把 TTFB、FCP、load 等都称为 Core Web Vitals，它们是其他有价值的诊断指标。

## 四、资源加载优化 ⭐⭐⭐

### 1. DNS 预解析：dns-prefetch

提前解析指定域名，减少后续 DNS 查询等待：

~~~html
<link rel="dns-prefetch" href="//cdn.example.com">
~~~

适合页面确定会访问的第三方域名，但不要对大量无关域名都添加。

### 2. 预连接：preconnect

不仅提前做 DNS，还尝试提前建立连接：

~~~html
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
~~~

建立连接需要消耗资源，因此只对关键第三方源使用。

### 3. 预加载：preload

告诉浏览器尽早加载当前页面很快就需要的关键资源：

~~~html
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
~~~

适合首屏关键字体、关键图片等。不要 preload 所有资源，否则会抢占带宽，反而影响真正重要的资源。

### 4. 预获取：prefetch

为可能在未来页面或操作中需要的资源提前下载：

~~~html
<link rel="prefetch" href="/next-page.js" as="script">
~~~

它通常优先级较低，适合有较高概率马上会用到的下一步资源。浏览器可能根据网络和数据节省策略调整或忽略提示。

### 四种方式对比

| 提示 | 主要做什么 | 适合场景 |
|---|---|---|
| dns-prefetch | 提前解析域名 | 确定会访问的外部域名 |
| preconnect | 提前建立连接 | 关键 CDN、API 源 |
| preload | 尽早加载当前页面关键资源 | 首屏关键图片、字体 |
| prefetch | 提前获取未来可能使用的资源 | 下一路由或后续页面 |

## 五、资源体积优化 ⭐⭐⭐

### 1. 压缩文本资源

- HTML、CSS、JavaScript 使用 Gzip 或 Brotli 等压缩。
- 删除无用代码和注释。
- 合理配置静态资源缓存。
- 使用 CDN 分发静态文件。

压缩传输体积不等于减少 JavaScript 执行时间；两者要分别分析。

### 2. 图片优化

- 根据显示尺寸提供合适分辨率。
- 使用 WebP、AVIF 等现代格式（需考虑兼容策略）。
- 使用 srcset 和 sizes 让浏览器选择合适资源。
- 对首屏以外图片使用 loading="lazy"。
- 为图片声明 width、height 或 aspect-ratio，减少布局偏移。

~~~html
<img
  src="/images/card-800.webp"
  srcset="/images/card-400.webp 400w, /images/card-800.webp 800w"
  sizes="(max-width: 600px) 100vw, 400px"
  width="800"
  height="600"
  alt="商品图片"
  loading="lazy"
>
~~~

注意：首屏 LCP 图片通常不要懒加载，否则可能推迟最大内容绘制。

### 3. 字体优化

- 只加载需要的字重。
- 使用 WOFF2 等合适格式。
- 必要时拆分字体子集。
- 关键字体可以评估 preload。
- 使用 font-display 控制字体加载期间的显示行为。

## 六、JavaScript 加载与执行优化 ⭐⭐⭐

### 1. async 与 defer

~~~html
<script src="/analytics.js" async></script>
<script src="/app.js" defer></script>
~~~

- 普通 script：HTML 解析遇到它时通常会暂停解析，等待脚本下载并执行。
- async：脚本下载不阻塞 HTML 解析；下载完成后尽快执行，执行时可能打断 HTML 解析；多个 async 脚本不保证执行顺序。
- defer：脚本并行下载，HTML 解析完成后、DOMContentLoaded 之前按文档顺序执行。
- module 脚本默认具有 defer 类似的延迟执行行为，除非使用 async 等特殊配置。

### 2. 代码分割（Code Splitting）

把一个很大的 JS 包拆成多个较小的文件，按路由或功能按需加载。

~~~javascript
const module = await import("./heavy-chart.js");
module.renderChart();
~~~

这样用户不必在首屏下载所有页面和功能的代码。

### 3. Tree Shaking

构建工具在静态分析模块依赖时，尽量删除没有被使用的导出代码。

Tree Shaking 通常更依赖 ES Module 的静态结构。动态副作用、全局副作用和不合适的包配置可能影响效果。

### 4. 减少主线程长任务

- 大数据处理分批执行。
- 非 UI 密集型计算可考虑 Web Worker。
- 大列表使用虚拟滚动。
- 避免在输入事件中做大量同步计算。
- 将非紧急任务安排到合适时机。

## 七、懒加载与虚拟列表

### 图片懒加载

图片接近可视区域再加载，减少首屏请求量。原生 loading="lazy" 适合很多普通图片场景；需要更精细控制时可用 IntersectionObserver。

### 虚拟列表

页面实际可能有几千条数据，但屏幕一次只能显示几十条。虚拟列表只渲染可视区域附近的少量节点，降低 DOM 数量和布局成本。

注意虚拟列表要处理滚动高度、动态行高、键盘可访问性和滚动定位等问题。

## 八、CDN 与缓存优化

- 静态资源放到 CDN，缩短用户到资源节点的网络距离。
- 带内容 hash 的文件名可以设置较长缓存。
- HTML 入口文件通常设置较短缓存或协商缓存。
- 合理使用 Cache-Control、ETag 和 Service Worker。
- API 是否缓存需要结合数据实时性和用户隐私判断。

## 九、如何用工具分析性能？

### Chrome DevTools

- **Network**：看请求数量、资源大小、耗时、缓存命中、连接和响应头。
- **Performance**：看主线程、长任务、Layout、Paint 和交互耗时。
- **Lighthouse**：做实验室环境审计，给出性能和最佳实践建议。
- **Coverage**：观察 CSS/JS 使用覆盖情况，辅助发现未使用代码。

### Performance API

~~~javascript
// 查看页面导航性能信息
const navigation = performance.getEntriesByType("navigation")[0];
console.log(navigation);

// 观察最大内容绘制候选
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log("LCP candidate:", entry.startTime);
  }
});

observer.observe({
  type: "largest-contentful-paint",
  buffered: true
});
~~~

真实项目还应结合真实用户监控（RUM），而不只看本地 Lighthouse 分数。

## 十、推荐的性能优化工作流程

1. 先确定用户遇到的是加载慢、交互卡顿还是布局跳动。
2. 用 Network、Performance、Lighthouse 或真实用户数据定位瓶颈。
3. 找到影响最大的资源、脚本或布局问题。
4. 一次优先解决一类问题，避免同时改很多地方而无法判断效果。
5. 在相同设备、网络和页面状态下复测。
6. 持续监控指标，防止后续版本回退。

## 十一、面试重点与自测

- [ ] LCP、INP、CLS 分别衡量什么？良好阈值是多少？
- [ ] FID 和 INP 有什么关系？
- [ ] dns-prefetch、preconnect、preload、prefetch 有什么区别？
- [ ] 为什么首屏关键图片不应该随意 lazy-load？
- [ ] async 和 defer 有什么区别？
- [ ] 代码分割和 Tree Shaking 分别解决什么问题？
- [ ] 图片优化如何同时考虑体积、清晰度和 CLS？
- [ ] 虚拟列表为什么能提升长列表性能？
- [ ] 如何用 Performance 面板分析页面卡顿？
- [ ] 为什么 Lighthouse 分数不能完全代表真实用户体验？

## 十二、参考资料

- [web.dev：Web Vitals](https://web.dev/articles/vitals)
- [web.dev：Optimize LCP](https://web.dev/articles/optimize-lcp)
- [web.dev：Optimize INP](https://web.dev/articles/optimize-inp)
- [web.dev：Optimize CLS](https://web.dev/articles/optimize-cls)
- [MDN：关键渲染路径](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
- [MDN：Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

---
**学习标准：** 能说清核心性能指标，能按加载、交互、视觉稳定性分别制定优化方案，并能使用 DevTools 和 Performance API 验证效果。
