# CSS 动画与变换

> 重点掌握 transition、transform、animation 的使用差异，以及动画对布局、绘制和合成的影响。

## 一、transition 与 animation 的区别 ⭐⭐⭐

| 对比 | transition | animation |
|---|---|---|
| 触发方式 | 通常需要属性值发生变化 | 可自动播放，也可由状态控制 |
| 关键帧 | 只有起始/目标状态 | 可用 `@keyframes` 定义多个阶段 |
| 循环 | 不直接提供循环配置 | 支持循环次数 |
| 暂停/方向 | 能力有限 | 支持暂停、方向、填充模式等 |
| 常见场景 | hover、展开、颜色变化 | loading、进度效果、复杂连续动画 |

### transition 示例

```css
.button {
  background: #1677ff;
  transform: translateY(0);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.button:hover {
  background: #0958d9;
  transform: translateY(-2px);
}
```

### animation 示例

```css
@keyframes pulse {
  0%   { transform: scale(1); opacity: 1; }
  50%  { transform: scale(1.08); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}

.loading {
  animation: pulse 1s ease-in-out infinite;
}
```

## 二、transition 常用属性 ⭐⭐

- `transition-property`：需要过渡的属性。
- `transition-duration`：持续时间。
- `transition-timing-function`：速度曲线。
- `transition-delay`：延迟时间。
- `transition`：简写。

常见曲线：`linear`、`ease`、`ease-in`、`ease-out`、`ease-in-out`、`cubic-bezier()`、`steps()`。

**易错点：** 不是所有属性都能平滑插值；`display` 等离散属性不能按普通数值属性的方式进行连续过渡。不要默认 `transition: all`，它可能让不希望动画的属性也产生过渡，并增加调试成本。

## 三、transform 变换 ⭐⭐⭐

常用函数：

- `translate()`：平移。
- `scale()`：缩放。
- `rotate()`：旋转。
- `skew()`：倾斜。
- `transform-origin`：变换原点。
- `perspective()` / `perspective`：透视效果。

```css
.card {
  transform: translateY(-4px) scale(1.02);
  transform-origin: center;
}
```

**重要：** transform 改变的是视觉变换结果，不会像修改普通布局尺寸那样重新安排周围元素的位置。transform 还可能创建层叠上下文，并影响后代 fixed 元素的包含块。

## 四、animation 核心属性 ⭐⭐⭐

```css
.element {
  animation-name: move;
  animation-duration: 1s;
  animation-timing-function: ease-in-out;
  animation-delay: 0s;
  animation-iteration-count: 3;
  animation-direction: alternate;
  animation-fill-mode: both;
  animation-play-state: running;
}
```

- `animation-iteration-count`：次数，`infinite` 表示无限循环。
- `animation-direction`：`normal`、`reverse`、`alternate`、`alternate-reverse`。
- `animation-fill-mode`：动画前后如何应用关键帧样式；`forwards` 保留结束状态，`backwards` 在 delay 期间应用起始关键帧，`both` 同时具备两者效果。
- `animation-play-state`：`running` / `paused`。

**易错点：** `forwards` 保留的是动画结束时的关键帧效果，不代表元素原始 CSS 被永久改写。

## 五、动画性能：优先 transform 与 opacity ⭐⭐⭐

浏览器渲染大致涉及样式计算、布局（Layout）、绘制（Paint）和合成（Composite）。不同属性可能触发不同阶段。

- 修改 `width`、`height`、`top` 等布局相关属性，可能触发布局和后续绘制。
- 修改 `background-color` 等绘制属性，通常需要重新绘制。
- `transform`、`opacity` 在适合的情况下可由合成阶段处理，通常更容易获得流畅动画，但并非保证永远不触发其他工作。

```css
.panel {
  transition: transform 0.25s ease;
}

.panel.open {
  transform: translateX(0);
}
```

`will-change` 是性能提示，不是万能加速开关。过早、过多使用会消耗内存和合成资源，应该在确有性能问题且测量验证后谨慎使用。

## 六、配合 JavaScript 动画

需要根据滚动位置、物理模拟或复杂交互逐帧更新时，可使用 `requestAnimationFrame()`：

```javascript
let startTime;

function step(timestamp) {
  if (startTime === undefined) startTime = timestamp;

  const progress = Math.min((timestamp - startTime) / 500, 1);
  element.style.transform = `translateX(${progress * 200}px)`;

  if (progress < 1) {
    requestAnimationFrame(step);
  }
}

requestAnimationFrame(step);
```

不要使用固定 `setInterval` 假设每次回调都刚好对应一帧。动画应基于时间戳计算进度，并在不再需要时停止后续帧请求。

## 七、无障碍与减少动态效果

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

真实项目应按产品需求保留必要状态反馈，避免简单粗暴地隐藏所有动效。

## 八、面试自测

- [ ] transition 与 animation 有什么区别？
- [ ] transform 为什么常用于高性能动画？
- [ ] transform 是否会影响文档流？
- [ ] animation-fill-mode 有哪些值？
- [ ] `will-change` 有什么作用和风险？
- [ ] 为什么不推荐对所有属性使用 `transition: all`？
- [ ] requestAnimationFrame 与 setInterval 做动画有什么区别？
- [ ] 如何尊重用户减少动态效果的系统偏好？

## 九、参考资料

- [MDN：CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
- [MDN：CSS Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions)
- [MDN：CSS 与 JavaScript 动画性能](https://developer.mozilla.org/en-US/docs/Web/Performance/CSS_JavaScript_animation_performance)
- [MDN：prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

---
**复习标准：** 能选择合适的动画技术，解释哪些属性可能触发布局/绘制，并能制作可访问、可暂停且性能可控的动效。
