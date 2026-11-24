# CSS 工程化

> CSS 工程化关注样式如何组织、复用、隔离、构建和维护。重点掌握预处理器、PostCSS、模块化、命名规范、设计令牌和样式覆盖策略。

## 一、为什么需要 CSS 工程化 ⭐⭐⭐

项目规模变大后，常见问题包括：

- 全局选择器互相污染。
- 选择器优先级不断升高，难以覆盖。
- 颜色、间距、字号等重复定义。
- 样式文件难以拆分和维护。
- 多人协作时命名冲突。
- 第三方组件样式覆盖困难。

工程化的目标是降低冲突、重复和维护成本，而不是单纯增加工具。

## 二、Sass / SCSS 与 Less ⭐⭐⭐

预处理器提供变量、嵌套、混入、函数等能力，通常在构建阶段编译成 CSS。

```scss
$primary: #1677ff;

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button {
  @include flex-center;
  background: $primary;

  &:hover {
    opacity: 0.9;
  }
}
```

常见能力：

- 变量：复用构建期常量。
- Nesting：组织相关选择器。
- Mixin：复用样式片段。
- Function：封装计算逻辑。
- Partial / Import 或模块系统：拆分样式文件。

**Sass 变量与 CSS 自定义属性区别：**

| 对比 | Sass 变量 | CSS 自定义属性 |
|---|---|---|
| 生效阶段 | 构建时 | 浏览器运行时 |
| 是否保留在 CSS | 通常编译为具体值 | 保留 `--name` |
| 是否参与层叠和继承 | 否 | 是 |
| 能否被 JS 直接读取修改 | 编译后通常不存在 | 可以通过 CSSOM 读取和修改 |
| 主题动态切换 | 需生成不同样式或配合变量 | 很适合运行时主题 |

## 三、PostCSS ⭐⭐

PostCSS 是基于插件处理 CSS 的工具平台，不等同于 Sass/Less 预处理器。

常见用途：

- Autoprefixer：根据目标浏览器添加必要前缀。
- CSS 语法转换：配合相应插件转换新语法。
- 压缩：移除冗余字符和规则。
- 兼容性处理：结合 Browserslist 指定目标环境。

```json
{
  "browserslist": [
    "defaults",
    "not dead"
  ]
}
```

实际项目应按用户环境和产品支持范围配置目标浏览器，不要无依据地添加大量前缀。

## 四、CSS 模块化与样式隔离 ⭐⭐⭐

### 1. CSS Modules

CSS Modules 通常在构建阶段将局部类名转换为唯一标识，减少全局命名冲突。

```jsx
import styles from "./Button.module.css";

export function Button() {
  return <button className={styles.button}>提交</button>;
}
```

### 2. Vue Scoped CSS

```vue
<template>
  <button class="button">提交</button>
</template>

<style scoped>
.button {
  color: white;
}
</style>
```

Vue 的 scoped 样式通过编译时添加属性选择器等方式实现局部作用域，并不是浏览器原生 Shadow DOM。子组件根节点、插槽内容和深度选择器有各自的作用规则，不能理解成完全隔离。

### 3. CSS-in-JS

在组件代码中定义样式，常见于 React 生态。它便于组件化和动态样式，但需要关注运行时开销、服务端渲染、调试和样式生成策略。

## 五、CSS 命名规范：BEM ⭐⭐

BEM 由 Block、Element、Modifier 组成：

```css
.card {}
.card__title {}
.card__image {}
.card--featured {}
```

- Block：独立组件，例如 `card`。
- Element：组件内部组成部分，例如 `card__title`。
- Modifier：组件或元素的状态/变体，例如 `card--featured`。

BEM 的价值是命名清晰、减少冲突，不是必须在所有项目中机械使用。Vue scoped、CSS Modules 等方案也可以结合团队规范使用。

## 六、CSS Reset 与 Normalize ⭐⭐

浏览器有默认样式，不同元素可能有默认 margin、字体、列表样式等。

- Reset：更激进地重置默认样式，再由项目重新定义。
- Normalize：尽量保留合理默认行为，同时统一不同浏览器的差异。

常见基础样式：

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
}

img,
svg,
video {
  max-width: 100%;
}
```

不要无差别重置所有元素的所有属性，以免破坏表单控件、可访问性和浏览器合理默认行为。

## 七、设计令牌与样式架构 ⭐⭐⭐

使用 CSS 自定义属性统一管理主题和间距：

```css
:root {
  --color-primary: #1677ff;
  --color-text: #1f1f1f;
  --color-border: #d9d9d9;
  --space-sm: 8px;
  --space-md: 16px;
  --radius-md: 8px;
}

[data-theme="dark"] {
  --color-text: #f5f5f5;
  --color-border: #434343;
}
```

推荐按职责组织：

- `tokens`：颜色、字号、间距、层级等设计令牌。
- `base`：基础元素样式、Reset。
- `layout`：页面布局。
- `components`：组件样式。
- `utilities`：少量通用工具类。
- `themes`：主题变量。

现代 CSS 还可以使用 `@layer` 管理样式优先层：

```css
@layer reset, base, components, utilities;

@layer base {
  body { margin: 0; }
}

@layer components {
  .button { border-radius: 8px; }
}
```

层叠层会参与层叠优先级判断，适合管理第三方样式、基础样式和组件样式之间的关系。不要只依赖选择器权重解决所有覆盖问题。

## 八、面试自测

- [ ] Sass/Less 与 CSS 自定义属性有什么区别？
- [ ] PostCSS 是什么？Autoprefixer 做什么？
- [ ] CSS Modules 如何避免类名冲突？
- [ ] Vue scoped 是 Shadow DOM 吗？
- [ ] BEM 命名规范解决什么问题？
- [ ] Reset 与 Normalize 有什么区别？
- [ ] 如何组织大型项目的颜色、间距和主题变量？
- [ ] CSS Cascade Layers 解决什么问题？

## 九、参考资料

- [Sass 官方文档](https://sass-lang.com/documentation/)
- [Less 官方文档](https://lesscss.org/)
- [PostCSS 官方文档](https://postcss.org/)
- [CSS Modules](https://github.com/css-modules/css-modules)
- [MDN：CSS 层叠层](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

---
**复习标准：** 能解释项目中的样式隔离与构建流程，能设计清晰的样式目录、命名规范和主题变量。
