# Flex 布局

> Flexbox 是一维布局模型，适合处理一行或一列中的空间分配、对齐和顺序。重点掌握主轴/交叉轴、伸缩计算和常见易错点。

## 一、Flex 基本概念 ⭐⭐⭐

```css
.container {
  display: flex;
}
```

- **Flex 容器（container）**：设置 `display: flex` 的元素。
- **Flex 项目（item）**：容器的直接子元素。
- **主轴（main axis）**：由 `flex-direction` 决定。
- **交叉轴（cross axis）**：与主轴垂直。

```css
.container {
  display: flex;
  flex-direction: row; /* 主轴水平，默认值 */
}
```

`row`、`row-reverse`、`column`、`column-reverse` 会改变主轴方向。不要把主轴固定理解成水平方向。

## 二、主轴与交叉轴对齐 ⭐⭐⭐

| 属性 | 作用轴 | 常见取值 |
|---|---|---|
| `justify-content` | 主轴 | `flex-start`、`center`、`space-between`、`space-around`、`space-evenly` |
| `align-items` | 交叉轴 | `stretch`、`center`、`flex-start`、`flex-end`、`baseline` |
| `align-content` | 多行时的交叉轴 | `center`、`space-between`、`stretch` 等 |
| `align-self` | 单个项目的交叉轴 | 覆盖容器的 `align-items` |

```css
.container {
  display: flex;
  justify-content: center; /* 主轴居中 */
  align-items: center;     /* 交叉轴居中 */
}
```

**高频易错：**

- `align-content` 主要用于多行 Flex 容器，控制多条 flex line 在交叉轴上的分布；单行时通常看不到它的效果。
- `align-items` 控制每一条 flex line 内项目的交叉轴对齐。
- `align-self` 只影响当前项目。
- `align-items: stretch` 只有在项目交叉轴尺寸为 `auto` 且相关约束允许时才会拉伸。

## 三、换行与项目顺序

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
```

- `nowrap`：不换行（默认）。
- `wrap`：空间不足时换行。
- `wrap-reverse`：换行方向反转。
- `order`：改变项目的视觉排列顺序，默认 `0`。

**注意：** `order` 不会改变 DOM 顺序，也不应被用来制造与键盘焦点、屏幕阅读顺序不一致的页面。重要内容顺序优先通过 DOM 结构表达。

## 四、flex-grow、flex-shrink、flex-basis ⭐⭐⭐

这是 Flex 面试最常见的计算点。

| 属性 | 含义 | 默认值 |
|---|---|---|
| `flex-grow` | 有剩余空间时，项目按比例分配额外空间 | `0` |
| `flex-shrink` | 空间不足时，项目按比例收缩 | `1` |
| `flex-basis` | 分配剩余空间前的基础尺寸 | `auto` |

```css
.item-a { flex: 1; }
.item-b { flex: 2; }
```

当存在正的剩余空间且其他条件相同，A、B 的 grow 因子为 1:2，因此额外空间按 1:2 分配。它们最终宽度不一定是 1:2，因为还取决于基础尺寸和约束。

### 1. `flex-basis` 与 width

- `flex-basis` 是主轴方向的基础尺寸。
- `flex-basis` 为非 `auto` 时，通常优先于主轴方向的 `width` / `height` 作为 flex base size。
- `flex-basis: auto` 会参考主轴尺寸属性等确定基础尺寸。

### 2. `flex` 简写

常见写法：

```css
.item {
  flex: 1;       /* 常见浏览器计算语义相当于 1 1 0% */
}

.item-auto {
  flex: auto;    /* 1 1 auto */
}

.item-fixed {
  flex: none;    /* 0 0 auto，不伸不缩 */
}
```

不同简写值含义不同。`flex: 1` 不是“宽度等于父容器的 1 份”这么简单，它会影响基础尺寸和剩余空间分配。

## 五、Flex 项目不收缩、溢出与 `min-width: 0` ⭐⭐⭐

一个常见问题：左侧内容很长，右侧区域被挤出容器。

Flex 项目默认的最小尺寸可能基于内容最小尺寸，长文本、宽表格或图片可能阻止它继续收缩。

```css
.layout {
  display: flex;
}

.main {
  flex: 1;
  min-width: 0; /* 允许主区域收缩到内容最小尺寸以下 */
  overflow: auto;
}

.sidebar {
  flex: 0 0 240px;
}
```

**面试易错：** `flex-shrink: 1` 不意味着项目一定能缩到任意小；`min-width` / `min-height` 等最小尺寸约束仍会生效。

## 六、常见 Flex 布局

### 水平垂直居中

```css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### 左侧固定、右侧自适应

```css
.page {
  display: flex;
  gap: 16px;
}

.sidebar {
  flex: 0 0 240px;
}

.content {
  flex: 1;
  min-width: 0;
}
```

### 底部按钮靠右

```css
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

## 七、面试自测

- [ ] Flex 的主轴和交叉轴由什么决定？
- [ ] `justify-content` 与 `align-items` 分别控制什么？
- [ ] `align-content` 与 `align-items` 有什么区别？
- [ ] `flex: 1`、`flex: auto`、`flex: none` 有什么区别？
- [ ] `flex-basis` 与 `width` 谁优先？
- [ ] 为什么 Flex 子项设置了 `flex-shrink: 1` 仍然可能溢出？
- [ ] 为什么管理系统的主内容区经常需要 `min-width: 0`？

## 八、参考资料

- [MDN：Flexbox 基础概念](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox)
- [MDN：Flex 属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex)
- [CSS Flexible Box Layout 规范](https://www.w3.org/TR/css-flexbox-1/)

---
**复习标准：** 能独立实现侧边栏 + 自适应内容区、水平垂直居中和多行卡片布局，并解释伸缩计算及最小尺寸问题。
