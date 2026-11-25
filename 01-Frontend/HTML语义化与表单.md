# HTML 语义化与表单：把网页结构写正确

> **一句话理解**：HTML 不只是“能显示出来”，还要让浏览器、搜索引擎和辅助技术都知道内容**是什么**。本篇重点掌握语义化、表单、可访问性以及高频易错点。

## 一、HTML、CSS、JavaScript 分别负责什么？ ⭐⭐⭐

把网页比作一间房子：

- **HTML** 是房子的结构和功能区域：哪里是门、哪里是厨房。
- **CSS** 负责装修和布局：颜色、大小、位置。
- **JavaScript** 负责交互：按按钮开灯、提交表单。

HTML 是一种**标记语言**，不是编程语言。写好 HTML 结构，能让样式和交互更容易维护。

## 二、什么是语义化？为什么重要？ ⭐⭐⭐

语义化就是使用有明确含义的标签表达内容，而不是所有东西都写成 `div`。

| 标签 | 表示什么 | 典型场景 |
| --- | --- | --- |
| `header` | 页头或章节头部 | 网站品牌、文章标题区域 |
| `nav` | 主要导航区域 | 顶部菜单、目录 |
| `main` | 页面主要内容 | 一页中的核心内容（通常一个可见 main） |
| `article` | 可独立分发的内容 | 文章、论坛帖子、独立资讯 |
| `section` | 有主题的一组内容 | 页面中有标题的一个章节 |
| `aside` | 与主要内容间接相关的内容 | 侧边栏、相关文章 |
| `footer` | 页脚或章节尾部 | 版权、补充信息 |
| `button` | 执行动作 | 提交、删除、展开 |
| `a` | 跳转到其他资源或位置 | 页面链接、锚点导航 |

对比：

```html
<!-- 不推荐：所有内容都没有表达语义 -->
<div class="header">我的网站</div>
<div class="menu">文章 | 关于</div>
<div class="content">正文</div>

<!-- 更合适：让标签说出自己的用途 -->
<header><h1>我的网站</h1></header>
<nav aria-label="主导航"><a href="/articles">文章</a></nav>
<main><article><h2>正文标题</h2><p>正文内容……</p></article></main>
```

### 为什么语义化重要？

1. **可访问性**：屏幕阅读器更容易理解页面结构。
2. **可维护性**：接手代码的人更容易判断每个区域做什么。
3. **浏览器原生能力**：按钮支持键盘操作和焦点；表单支持原生验证。
4. **搜索理解**：结构有助于搜索引擎理解内容，但语义化不意味着一定提高排名。

**易错点**：`section` 不是“任何一块 div 的替代品”，通常应有明确主题；`article` 应当相对独立；`main` 不应随意嵌套在 `article` 内当通用容器。

## 三、标题、列表、图片的正确使用 ⭐⭐

### 标题层级

`h1` 到 `h6` 是标题等级。应按内容结构合理使用，不要为了字体大小选择标题标签；字体外观交给 CSS。

```html
<h1>前端学习指南</h1>
<section>
  <h2>HTML</h2>
  <h3>语义化</h3>
</section>
```

不必机械认为“所有页面只能有一个 h1”是 HTML 解析的硬性规定，但一个清晰的页面主标题通常更容易理解。

### 图片和替代文本

```html
<img src="/images/chart.png" alt="2026 年每月订单数量柱状图">
```

- 有实际信息的图片：`alt` 用文字传达关键信息。
- 纯装饰图片：可用 `alt=""`，避免屏幕阅读器重复朗读。
- 图片无法加载时，替代文本也有帮助。

### 列表

- `ul`：无顺序列表，如功能清单。
- `ol`：有顺序列表，如步骤流程。
- `dl`：术语和解释，如术语表。

## 四、表单：从输入到提交 ⭐⭐⭐

表单不只是摆几个 `input`。它负责收集用户输入，并与浏览器默认行为、校验和服务端通信配合。

```html
<form action="/register" method="post">
  <fieldset>
    <legend>创建账户</legend>

    <label for="email">邮箱</label>
    <input
      id="email"
      name="email"
      type="email"
      autocomplete="email"
      required
    >

    <label for="password">密码</label>
    <input
      id="password"
      name="password"
      type="password"
      autocomplete="new-password"
      minlength="8"
      required
    >

    <button type="submit">注册</button>
    <button type="reset">重置</button>
  </fieldset>
</form>
```

**关键知识：**

- `name`：决定表单数据提交时的字段名称。只有 `id` 没有 `name`，不代表会提交。
- `label for` 与 `input id`：建立标签与输入框关联，点击文字也能聚焦输入框。
- `type=email`：启用邮箱格式相关的原生验证与输入体验，但不能替代服务端验证。
- `required`、`minlength`：提供浏览器端约束校验。
- `method="get"`：数据通常体现在 URL 查询参数中，适合搜索；不适合提交密码。
- `method="post"`：表单数据放在请求体中，仍然**需要 HTTPS** 才能保护传输链路。
- `fieldset` + `legend`：给相关表单控件分组，便于理解。

### 高频易错：按钮默认类型

```html
<form>
  <button>保存草稿</button>       <!-- 默认通常是 submit -->
  <button type="button">预览</button> <!-- 不触发表单提交 -->
</form>
```

不要忘记为普通操作按钮写 `type="button"`，否则容易误触发表单提交。

## 五、原生表单校验与 JavaScript 校验 ⭐⭐⭐

```javascript
const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  event.preventDefault(); // 阻止浏览器默认跳转提交
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  console.log(data); // 后续按业务提交到 API
});
```

**注意：**

- 原生表单校验改善用户体验，但用户仍可能绕过浏览器，服务端必须重新校验。
- `input` 事件通常在用户编辑时触发；`change` 更偏向值被用户提交/确认后的变化。
- 自定义错误提示要与输入控件关联，不要只靠颜色提示。

## 六、可访问性：不仅是给少数人使用 ⭐⭐⭐

可访问性（Accessibility，a11y）意味着让键盘、屏幕阅读器、不同设备上的用户都能顺利操作。

**先从四个习惯开始：**

1. 需要执行操作时使用 `button`，需要导航时使用 `a href`。
2. 表单控件有清晰、可关联的 `label`。
3. 保留可见焦点状态，不随意写 `outline: none`。
4. 弹窗/菜单要考虑键盘操作、焦点管理与关闭行为。

```html
<!-- 错误倾向：div 自定义按钮，键盘和语义需自己补齐 -->
<div onclick="save()">保存</div>

<!-- 更好：原生按钮 -->
<button type="button" onclick="save()">保存</button>
```

ARIA 可以补充原生 HTML 没有的语义，但**能用原生标签就不要先用 ARIA 模拟**。

## 七、真实项目常见问题

| 现象 | 常见原因 | 建议排查 |
| --- | --- | --- |
| 按钮一点击就刷新页面 | 表单内 `button` 默认提交 | 检查 `type` |
| 提交数据缺少某个字段 | 输入框没有 `name` 或被 disabled | 检查 `FormData` |
| 点击文字不能聚焦输入框 | label 与 input 没关联 | 核对 `for` / `id` |
| 图片显示不出替代说明 | `alt` 缺失或无意义 | 写有信息价值的替代文本 |
| 屏幕阅读器难以导航 | 全部使用 div，缺乏标题和地标 | 用语义标签与合理标题层级 |

## 八、面试自测

- [ ] 什么是 HTML 语义化？它解决什么问题？
- [ ] `div`、`section`、`article` 有何区别？
- [ ] `button` 与 `a` 应如何选择？
- [ ] `label`、`name`、`id` 的作用分别是什么？
- [ ] GET 和 POST 表单提交有什么区别？
- [ ] 为什么前端表单校验不能代替服务端校验？
- [ ] 为什么要注意按钮的默认 `type`？
- [ ] 如何改善表单的键盘与屏幕阅读器体验？

## 九、参考资料

- [MDN：HTML](https://developer.mozilla.org/zh-CN/docs/Web/HTML)
- [MDN：HTML 表单指南](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms)
- [MDN：无障碍访问](https://developer.mozilla.org/zh-CN/docs/Web/Accessibility)
- [web.dev：学习 HTML](https://web.dev/learn/html)

---
**掌握标准：** 不看笔记能够写出语义清晰、带标签关联与基础校验的表单，并解释为什么这样写。
