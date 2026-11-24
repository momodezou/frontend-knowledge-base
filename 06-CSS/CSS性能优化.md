# CSS 性能与渲染优化

> CSS 性能优化的核心不是背诵“某个属性一定快”，而是理解浏览器渲染阶段，定位实际瓶颈，再用测量结果验证优化效果。

## 一、浏览器如何处理 CSS ⭐⭐⭐

页面渲染可粗略理解为：

1. 解析 HTML，构建 DOM。
2. 解析 CSS，构建 CSSOM。
3. 根据 DOM 与 CSSOM 计算样式。
4. 生成布局所需结构并计算几何信息（Layout）。
5. 绘制（Paint）。
6. 合成（Composite），最终呈现到屏幕。

实际浏览器实现比这条简化流程复杂，某些阶段可能并行、跳过或重复执行。

**重点：** CSS 会影响样式计算、布局、绘制和合成。修改不同属性可能触发不同工作，不能把所有样式变化都统称为重排。

## 二、重排、重绘与合成 ⭐⭐⭐

| 阶段 | 含义 | 常见触发示例 |
|---|---|---|
| 样式计算 | 计算元素最终使用的样式 | class 变化、匹配规则变化 |
| 重排 / Layout | 重新计算元素几何位置和尺寸 | width、height、位置、字体尺寸变化 |
| 重绘 / Paint | 重新绘制像素 | 颜色、阴影、背景等变化 |
| 合成 / Composite | 合成不同绘制层 | 某些 transform、opacity 更新 |

通常可以这样理解：

- **重排**可能影响后续绘制与合成，成本通常较高。
- **重绘**不一定重新计算布局，但需要重新绘制受影响区域。
- **合成**在适合的场景下可以避免重新布局和绘制，但不意味着完全没有成本。

不要绝对化地说某个属性在所有浏览器、所有场景下都只触发某一个阶段；实际结果应通过 DevTools 验证。

## 三、减少不必要的布局与绘制 ⭐⭐⭐

### 1. 避免频繁改变几何属性做动画

```css
/* 更适合做位移动画的方式 */
.panel {
  transition: transform 0.2s ease;
}

.panel.open {
  transform: translateX(0);
}
```

相比持续修改 `left`、`top`、`width` 等布局属性，`transform` 在很多场景中更容易由合成阶段处理。

### 2. 避免布局抖动（Layout Thrashing）

JavaScript 中交替读写布局信息，可能反复触发同步布局：

```javascript
// 不推荐：读写交替，可能导致多次同步布局
items.forEach((item) => {
  const width = item.offsetWidth;
  item.style.width = `${width + 10}px`;
});
```

尽量先批量读取，再批量写入：

```javascript
const widths = items.map((item) => item.offsetWidth);

items.forEach((item, index) => {
  item.style.width = `${widths[index] + 10}px`;
});
```

### 3. 合理批量更新样式

可以通过切换 class、更新 CSS 自定义属性或使用明确的组件状态减少零散 DOM 样式写入。

## 四、合理使用 contain、content-visibility 与 will-change ⭐⭐⭐

### `contain`

```css
.widget {
  contain: layout paint;
}
```

`contain` 用于声明元素子树在布局、绘制等方面的隔离边界，可能让浏览器更容易进行局部优化；但也可能影响定位、尺寸计算和绘制溢出，需要理解具体 containment 类型。

### `content-visibility`

```css
.long-section {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
```

对屏幕外的大块内容，`content-visibility: auto` 可让浏览器跳过部分渲染工作。`contain-intrinsic-size` 可提供估算尺寸，减少跳过渲染时的布局跳动。

### `will-change`

```css
.card {
  will-change: transform;
}
```

它是对浏览器的优化提示，不是强制创建 GPU 图层的命令。长期给大量元素设置 `will-change` 可能增加内存和合成开销。

**原则：** 先发现性能问题，再针对少数目标元素使用，并在不需要时移除。

## 五、减少 CSS 资源与样式计算成本 ⭐⭐

- 删除无用 CSS，避免加载大量不使用的样式。
- 按页面或路由组织样式，避免把所有页面样式无差别打入首屏。
- 避免过度复杂、难以维护的选择器和深层嵌套。
- 组件样式保持清晰边界，减少意外覆盖和重复规则。
- 关键首屏样式可根据实际项目评估内联或优先加载策略。
- 字体文件选择合适格式、字重和子集，避免不必要的资源下载。

**易错点：** 不要把“选择器从右向左匹配”简化成“后代选择器一定很慢”。现代浏览器有多种优化，真实瓶颈应以性能分析为准。

## 六、动画与用户体验优化

- 优先对 `transform`、`opacity` 等适合合成的属性做动画。
- 避免大量元素同时执行复杂滤镜、阴影和模糊。
- 使用 `prefers-reduced-motion` 尊重用户减少动态效果的偏好。
- 不要为了追求动画流畅而给所有元素添加 `translateZ(0)` 或 `will-change`。

## 七、如何定位 CSS 性能问题？

建议流程：

1. 在 Chrome DevTools Performance 中录制卡顿场景。
2. 查看是否存在频繁 Layout、Paint 或长任务。
3. 使用 Rendering 面板中的 Paint flashing、Layout Shift Regions 等辅助观察。
4. 检查是否由动画、长列表、复杂阴影、字体加载或同步布局导致。
5. 每次只改一个关键点，重复录制并比较。

常用工具：

- Chrome DevTools Performance。
- Lighthouse。
- Performance API。
- Rendering 面板。
- Web Vitals 指标（LCP、INP、CLS，整体指标不只由 CSS 决定）。

## 八、面试自测

- [ ] 浏览器渲染大致经过哪些阶段？
- [ ] 重排、重绘、合成分别是什么？
- [ ] 为什么 transform、opacity 常用于动画？
- [ ] 什么是布局抖动？如何避免？
- [ ] contain 与 content-visibility 有什么作用？
- [ ] will-change 为什么不能随意滥用？
- [ ] 如何使用 DevTools 定位页面卡顿？

## 九、参考资料

- [MDN：CSS 性能优化](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS)
- [MDN：CSS containment](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment)
- [Chrome：Rendering performance](https://web.dev/articles/rendering-performance)
- [web.dev：Optimize INP](https://web.dev/articles/optimize-inp)

---
**复习标准：** 能说清渲染阶段，能借助 DevTools 定位问题，并根据测量结果选择合适的 CSS 优化手段。
