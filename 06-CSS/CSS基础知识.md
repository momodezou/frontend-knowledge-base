# CSS 基础知识：高频考点与易错点

> 聚焦 CSS 基础中最常见、最容易混淆的知识：层叠与优先级、选择器、继承、单位、伪类与伪元素、CSS 变量。布局细节分别见《盒模型》《Flex布局》《Grid布局》等专题。

## 一、CSS 如何决定最终样式：层叠规则 ⭐⭐⭐

多个 CSS 规则同时作用于同一个元素时，浏览器通过**层叠（Cascade）**决定最终值。不要把“优先级”简单理解成只比较选择器权重。

理解顺序：

1. **相关性**：规则是否匹配元素、媒体条件是否成立。
2. **来源与重要性**：浏览器默认样式、用户样式、作者样式，以及 `!important` 等重要性规则。
3. **层叠层（Cascade Layers）**：同一来源和重要性下，层叠层顺序会影响胜出规则。
4. **选择器优先级（Specificity）**：在前面条件相同的竞争规则之间比较。
5. **作用域接近度与源码顺序**：现代 `@scope` 场景会考虑作用域接近度；仍相同时，后声明的规则胜出。

**面试易错：** 选择器优先级不是整个层叠算法的第一步。一个优先级更高的普通作者规则，也不一定能覆盖另一个来源或重要性更高的声明。

## 二、选择器与优先级 ⭐⭐⭐

| 类型 | 示例 | 说明 |
|---|---|---|
| 类型选择器 | `div` | 选择指定标签 |
| 类选择器 | `.active` | 选择 class |
| ID 选择器 | `#app` | 选择 id |
| 属性选择器 | `[disabled]` | 根据属性匹配 |
| 后代 / 子代 | `.box p` / `.box > p` | 后代 / 直接子元素 |
| 相邻 / 后续兄弟 | `h2 + p` / `h2 ~ p` | 后一个兄弟 / 后续兄弟 |
| 伪类 | `:hover`、`:focus` | 描述元素状态 |
| 伪元素 | `::before`、`::after` | 创建或选中元素的特定部分 |

常见优先级可以记为三列：`ID - CLASS - TYPE`。

- ID 选择器：第一列。
- 类、属性、伪类：第二列。
- 标签、伪元素：第三列。
- 通配符 `*`、组合符和 `:where()` 本身不增加优先级。
- `:is()`、`:not()`、`:has()` 本身不额外增加权重，其参数列表中优先级最高的选择器参与计算。
- 内联样式不属于这三列，通常高于普通作者样式；`!important` 还会改变层叠优先关系。

```css
#app .card p { color: red; } /* 1-1-1 */
.card p       { color: blue; } /* 0-1-1，前者胜出 */

:where(#app) .card { margin: 0; }
/* :where() 内部选择器不增加优先级 */
```

**建议：** 优先通过清晰的组件作用域、低权重选择器和合理的样式组织解决冲突，不要依赖不断叠加选择器或滥用 `!important`。

## 三、继承、初始值与层叠关键字 ⭐⭐

并非所有 CSS 属性都会继承。

- 常见继承属性：`color`、`font-family`、`font-size`、`line-height`、`visibility`。
- 常见非继承属性：`margin`、`padding`、`border`、`width`、`height`、`background`。
- `inherit`：强制使用父元素计算值。
- `initial`：使用属性规范定义的初始值。
- `unset`：继承属性按 `inherit` 处理，非继承属性按 `initial` 处理。
- `revert`：回退到当前来源之前的层叠结果，常用于恢复浏览器或用户样式影响。

```css
.parent { color: #333; border: 1px solid; }
.child {
  color: inherit;
  border: initial;
  font: unset;
}
```

**易错点：** 子元素没有写 `color` 时可能继承父元素；但子元素不会因为父元素有 `margin` 就自动得到相同 margin。

## 四、CSS 单位：px、%、em、rem、vw、vh ⭐⭐⭐

| 单位 | 参照基准 | 常见用途与注意点 |
|---|---|---|
| `px` | CSS 像素 | 边框、精细尺寸；不是物理屏幕像素 |
| `%` | 由具体属性定义 | 宽度通常相对包含块；高度百分比需要明确的高度参照 |
| `em` | 对字体大小相关属性通常相对当前元素字体大小；其他属性按规范定义 | 组件内部尺寸；嵌套时容易累乘 |
| `rem` | 根元素（通常是 `html`）字体大小 | 全局比例尺寸 |
| `vw` / `vh` | 视口宽度 / 高度的 1% | 视口相关布局 |
| `dvh` / `svh` / `lvh` | 动态 / 小 / 大视口高度的 1% | 移动端地址栏变化场景 |

```css
html { font-size: 16px; }
.panel { width: 20rem; } /* 320px */
.title { font-size: 1.5em; }
.hero { min-height: 100vh; }
```

**常见误区：**

- `1rem` 不等于固定 16px；它取决于根元素计算后的字体大小。
- `em` 并非所有属性都简单相对父元素字体大小，需看属性的百分比/相对单位定义。
- `height: 100%` 不一定生效，百分比高度通常需要可确定的包含块高度。
- CSS 像素与设备物理像素不是一回事，高清屏幕可能一个 CSS 像素对应多个设备像素。

## 五、伪类与伪元素 ⭐⭐

- **伪类**：选择已有元素在某种状态或结构位置下的情况，例如 `:hover`、`:focus-visible`、`:first-child`、`:nth-child()`。
- **伪元素**：选中元素的特定部分或生成可样式化的虚拟子内容，例如 `::before`、`::after`、`::placeholder`、`::selection`。

```css
.button:hover { background: #1677ff; }
.button:focus-visible { outline: 2px solid #1677ff; }

.badge::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
```

**易错点：** `::before` 和 `::after` 通常需要 `content` 才会生成；生成内容不适合承载重要信息或替代语义化 HTML。

## 六、CSS 自定义属性与计算函数 ⭐⭐⭐

CSS 自定义属性（常称 CSS 变量）可以参与层叠和继承，运行时可通过 JavaScript 修改。

```css
:root {
  --color-primary: #1677ff;
  --space-md: 16px;
}

.button {
  color: white;
  background: var(--color-primary, #1677ff);
  padding: calc(var(--space-md) / 2) var(--space-md);
  border-radius: 8px;
}

@media (prefers-color-scheme: dark) {
  :root { --color-primary: #4c9aff; }
}
```

常用函数：

- `calc()`：混合不同单位进行计算。
- `min()` / `max()`：在多个值中取最小 / 最大值。
- `clamp(min, preferred, max)`：限制一个流体值的上下界。

```css
.page-title {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
}
```

**易错点：** `var()` 的回退值主要在自定义属性未定义或无效时使用；若变量存在但代入后导致属性值无效，不要把它当成通用的类型校验机制。

## 七、面试自测

- [ ] CSS 层叠顺序是什么？为什么不能只比较选择器优先级？
- [ ] `:where()`、`:is()`、`:not()`、`:has()` 对优先级有什么影响？
- [ ] 哪些常见属性会继承？`border` 会继承吗？
- [ ] `em` 与 `rem` 有什么区别？
- [ ] `100vh` 在移动端为什么可能出现高度问题？
- [ ] 伪类和伪元素有什么区别？
- [ ] CSS 自定义属性与 Sass 变量有什么区别？

## 八、参考资料

- [MDN：CSS 层叠](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Cascade)
- [MDN：选择器优先级](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity)
- [MDN：CSS 自定义属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
- [MDN：CSS 值与单位](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Styling_basics/Values_and_units)

---
**复习标准：** 能解释规则、准确判断代码最终样式，并能在项目中用低复杂度的方式组织 CSS。
