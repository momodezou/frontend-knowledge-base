# BFC：块级格式化上下文

> BFC（Block Formatting Context）是 CSS 布局中的重要概念。面试重点不是背诵定义，而是理解它如何影响浮动、margin 折叠和普通块布局。

## 一、什么是 BFC ⭐⭐⭐

BFC 是页面可视化 CSS 布局中的一种块级格式化上下文。可以把它理解为一个相对独立的布局区域，区域内部的块级盒子按块格式化规则布局，部分布局行为不会与外部区域互相影响。

BFC 不是简单的“加一个属性就清除浮动”，而是一种布局环境。

## 二、如何创建 BFC ⭐⭐⭐

常见方式：

```css
.container {
  display: flow-root; /* 语义清晰，常用于创建 BFC */
}
```

其他常见触发方式包括：

- 根元素（`html`）。
- 浮动元素（`float` 不为 `none`）。
- 绝对定位元素（`position: absolute` 或 `fixed`）。
- `display: inline-block`、部分表格相关 display 值。
- `overflow` 不为 `visible` 或 `clip` 的块级盒子（如 `hidden`、`auto`、`scroll`）。
- Flex 容器和 Grid 容器会建立相应的格式化上下文；其项目也有独立的布局规则。

**推荐：** 只想建立一个 BFC 来管理内部浮动时，优先考虑 `display: flow-root`。不要机械地使用 `overflow: hidden`，因为它可能裁剪阴影、下拉菜单或超出容器的内容。

## 三、BFC 的典型布局特征 ⭐⭐⭐

### 1. BFC 会包含内部浮动

```html
<div class="container">
  <div class="float">浮动内容</div>
</div>
```

```css
.container {
  display: flow-root;
  border: 1px solid #999;
}

.float {
  float: left;
  width: 120px;
  height: 80px;
}
```

容器建立 BFC 后，其计算高度会考虑内部浮动元素，不会像普通块容器那样出现高度塌陷。

### 2. BFC 不与外部浮动区域重叠

```css
.float {
  float: left;
  width: 120px;
  height: 100px;
}

.content {
  display: flow-root;
}
```

`content` 建立独立格式化上下文后，会避开外部浮动元素所占据的区域。

### 3. BFC 内部的垂直 margin 不与外部发生折叠

BFC 边界会影响普通块级 margin 折叠规则。例如建立 BFC 的容器与其子元素之间，不会按普通父子块格式化场景发生相同的 margin 折叠。

**注意：** BFC 内部两个普通块级兄弟之间仍可能发生 margin 折叠。不要把它理解为“BFC 内完全禁止 margin 合并”。

## 四、BFC 与清除浮动 ⭐⭐⭐

传统 clearfix 写法：

```css
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
```

现代布局中，如果目标是让容器包含浮动子元素，可以使用：

```css
.container {
  display: flow-root;
}
```

两者都是常见解决方案，但机制和适用场景不同。`flow-root` 更直接表达“建立新的块格式化上下文”。

## 五、BFC、IFC 与其他格式化上下文

- **BFC**：块级格式化上下文，关注块级盒子的布局。
- **IFC**：行内格式化上下文，行内级盒子沿行排列，形成 line box。
- **FFC**：Flex 格式化上下文。
- **GFC**：Grid 格式化上下文。

不要把 BFC 与层叠上下文（Stacking Context）混为一谈：BFC 主要影响布局，层叠上下文主要影响绘制顺序和 z-index 的比较。一个元素可能同时建立 BFC 和层叠上下文，但二者不是同一个概念。

## 六、常见误区

1. `overflow: hidden` 能触发 BFC，但它还会改变溢出裁剪行为。
2. `position: relative` 本身通常不会创建 BFC。
3. `z-index` 不是创建 BFC 的通用方式。
4. BFC 不等于“绝对隔离”：它对布局有约束，但不意味着内部所有视觉效果、定位或事件都与外部完全隔离。
5. Flex/Grid 容器建立的是对应格式化上下文，不能把所有现代布局都简单说成普通 BFC。

## 七、面试自测

- [ ] 什么是 BFC？它解决了哪些布局问题？
- [ ] 哪些属性或布局方式可以创建 BFC？
- [ ] BFC 为什么可以包含浮动元素？
- [ ] BFC 如何影响外部浮动与 margin 折叠？
- [ ] `overflow: hidden` 创建 BFC 有什么副作用？
- [ ] BFC 与层叠上下文有什么区别？
- [ ] `display: flow-root` 适合解决什么问题？

## 八、参考资料

- [MDN：Block formatting context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_display/Block_formatting_context)
- [MDN：display: flow-root](https://developer.mozilla.org/en-US/docs/Web/CSS/display)

---
**复习标准：** 能够用示意图解释 BFC 的三个典型效果，并能根据场景选择 `flow-root`、clearfix 或其他布局方式。
