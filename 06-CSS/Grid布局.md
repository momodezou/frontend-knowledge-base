# CSS Grid 布局

> Grid 是二维布局系统，适合同时控制行和列。重点掌握轨道、网格线、`fr`、`minmax()`、自动放置以及 `auto-fit` / `auto-fill` 的区别。

## 一、Grid 基本概念 ⭐⭐⭐

```css
.container {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 16px;
}
```

- Grid 容器：设置 `display: grid` 的元素。
- Grid 项目：容器的直接子元素。
- Grid 轨道：行或列。
- Grid 线：轨道之间的分隔线。
- Grid 单元格：一行与一列交叉形成的区域。
- Grid 区域：由多个单元格组成的矩形区域。

Grid 同时控制行和列，Flex 更偏向单轴上的项目分配。实际项目可以组合使用。

## 二、定义行列与 `fr` ⭐⭐⭐

```css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 2fr;
  gap: 12px;
}
```

`fr` 表示可用剩余空间的比例单位，不是简单的百分比。轨道还会受内容最小尺寸、固定尺寸和最大尺寸约束。

### `repeat()` 与 `minmax()`

```css
.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
```

- `repeat(3, ...)`：重复轨道定义。
- `minmax(200px, 1fr)`：轨道最小 200px，最大可分配剩余空间。
- `minmax(0, 1fr)`：允许轨道缩到 0，常用于避免长内容撑破布局。

**易错点：** `1fr` 轨道并不总能像预期一样缩小；项目内容的最小尺寸可能影响轨道。遇到长文本或宽表格，可考虑 `minmax(0, 1fr)`，并在项目上设置 `min-width: 0`。

## 三、显式网格与隐式网格

- 显式网格：由 `grid-template-columns`、`grid-template-rows`、`grid-template-areas` 定义。
- 隐式网格：项目超出显式网格时，浏览器自动创建的轨道。
- `grid-auto-rows` / `grid-auto-columns`：控制隐式轨道尺寸。
- `grid-auto-flow`：控制自动放置方向，可设置 `row`、`column`，也可使用 `dense`。

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto);
  grid-auto-flow: row;
}
```

`dense` 可能让后出现的较小项目填入前面空洞，视觉顺序可能与 DOM 顺序不同。涉及内容顺序、键盘操作和可访问性时要谨慎。

## 四、网格线与区域 ⭐⭐

```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

也可以通过网格线定位：

```css
.item {
  grid-column: 1 / 3;
  grid-row: 2 / 4;
}
```

## 五、`auto-fill` 与 `auto-fit` ⭐⭐⭐

两者都能根据容器空间自动重复轨道，区别在于空轨道是否保留。

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
```

- `auto-fill`：尽可能创建轨道，空轨道仍保留。
- `auto-fit`：创建后折叠没有项目占据的空轨道，让已有项目可以扩展。

当卡片数量不足以填满一行时，`auto-fit` 通常更适合让卡片拉伸填满空间；`auto-fill` 适合希望保留网格列槽位的场景。

## 六、对齐属性

| 属性 | 作用 |
|---|---|
| `justify-items` | 网格项目在单元格内的行内轴对齐 |
| `align-items` | 网格项目在单元格内的块轴对齐 |
| `place-items` | `align-items` 与 `justify-items` 简写 |
| `justify-content` | 整个网格在容器行内轴的分布 |
| `align-content` | 整个网格在容器块轴的分布 |
| `place-content` | `align-content` 与 `justify-content` 简写 |
| `justify-self` / `align-self` | 单个项目的对齐 |

**易错点：** `items` 通常对齐项目在各自单元格内的位置；`content` 通常控制整个网格轨道集合在容器中的分布。

## 七、Grid 与 Flex 如何选择？

- 页面整体有明确行列结构、需要二维区域布局：优先考虑 Grid。
- 导航栏、按钮组、工具栏、单行或单列组件：优先考虑 Flex。
- 复杂页面可以外层 Grid、内部 Flex，不必二选一。

## 八、面试自测

- [ ] Grid 与 Flex 的核心区别是什么？
- [ ] `fr` 单位如何分配空间？
- [ ] 显式网格和隐式网格有什么区别？
- [ ] `repeat()`、`minmax()` 如何配合使用？
- [ ] `auto-fit` 和 `auto-fill` 有什么区别？
- [ ] 为什么有时 `1fr` 仍然会被长内容撑开？
- [ ] `justify-items` 与 `justify-content` 有什么区别？

## 九、参考资料

- [MDN：Grid 布局基础概念](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout)
- [MDN：Grid Layout](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_grid_layout)
- [CSS Grid Layout 规范](https://www.w3.org/TR/css-grid-2/)

---
**复习标准：** 能独立使用 Grid 实现响应式卡片、后台管理页面框架和复杂表单布局，并解释自动轨道的行为。
