# DOM 与 BOM：JavaScript 怎样操作网页和浏览器？

> **通俗理解**：DOM 是“网页内部的结构和内容”，BOM 是“浏览器提供的窗口及导航等能力”。两者都能通过 JavaScript 访问，但关注的对象不同。

## 一、DOM 和 BOM 的区别 ⭐⭐⭐

| 项目 | DOM | BOM |
| --- | --- | --- |
| 全称 | Document Object Model | Browser Object Model（常见教学叫法，不是单一标准规范） |
| 主要对象 | `document` | `window`、`location`、`history`、`navigator` 等 |
| 主要功能 | 查询、创建、修改节点；处理页面内容 | 地址导航、历史记录、窗口、设备/浏览器信息等 |
| 比喻 | 房间里的家具和布局结构 | 管理整栋房子的门牌、窗户和设备 |

### DOM 是一棵树

```html
<div id="app">
  <h1>标题</h1>
  <button>点击</button>
</div>
```

```text
Document
└─ div#app
   ├─ h1
   └─ button
```

DOM 节点不只包含元素，还包含文本、注释等。`Node` 是更宽泛的节点概念，`Element` 代表元素节点。

## 二、查询 DOM：高频且容易混淆 ⭐⭐⭐

```javascript
const app = document.querySelector('#app');
const buttons = document.querySelectorAll('button');
const first = document.getElementById('app');
```

| 方法 | 返回值 | 注意点 |
| --- | --- | --- |
| `querySelector` | 第一个匹配的 Element 或 null | 使用 CSS 选择器 |
| `querySelectorAll` | 静态 NodeList | 获取后新增元素不会自动加入该 NodeList |
| `getElementById` | 一个 Element 或 null | 根据 id 查找 |
| `getElementsByClassName` | 动态 HTMLCollection | DOM 变化时集合会随之更新 |

**易错代码：**

```javascript
const list = document.querySelectorAll('.item'); // 静态列表
// 之后又添加了一个 .item，list.length 不会自动增加
const liveList = document.getElementsByClassName('item'); // 动态集合
```

动态集合在遍历时修改 DOM，可能导致索引变化，造成漏处理或重复处理。

## 三、修改内容与安全性 ⭐⭐⭐

```javascript
const result = document.querySelector('#result');
result.textContent = '<b>你好</b>'; // 原样显示文本，不当作 HTML 解析
result.innerHTML = '<b>你好</b>';   // 把字符串解析为 HTML 元素
```

- `textContent`：适合显示普通文本、用户输入、API 返回的字符串。
- `innerHTML`：适合确实需要插入经过信任或正确消毒的 HTML 内容。
- `innerText`：与渲染后的可见文本更有关联，可能受样式与布局影响。

**易错点：** 不要把用户提供的内容直接拼接进 `innerHTML`，可能引发 XSS。与具体 HTML 注入防护相关的深入知识归到 Web 安全专题。

## 四、增删节点和批量更新 ⭐⭐⭐

```javascript
const list = document.querySelector('#list');
const fragment = document.createDocumentFragment();

for (const label of ['JavaScript', 'HTML', 'CSS']) {
  const li = document.createElement('li');
  li.textContent = label;
  fragment.append(li);
}
list.append(fragment);
```

常见 API：

- `createElement()`：创建元素。
- `append()`、`prepend()`：追加到末尾或开头。
- `remove()`：移除元素。
- `replaceWith()`：替换元素。
- `classList.add/remove/toggle()`：操作 class。
- `dataset`：读取/修改 `data-*` 属性。

DocumentFragment 可以作为临时容器帮助组织节点；**性能好坏仍应通过实际测量判断**，不要理解为用它就一定只触发一次重排。

## 五、事件基础与事件委托 ⭐⭐⭐

```html
<ul id="tasks">
  <li><button type="button" data-action="remove">删除 A</button></li>
  <li><button type="button" data-action="remove">删除 B</button></li>
</ul>
```

```javascript
const tasks = document.querySelector('#tasks');

tasks.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const button = target.closest('button[data-action="remove"]');
  if (!button || !tasks.contains(button)) return;
  button.closest('li')?.remove();
});
```

这叫**事件委托**：监听器绑在父元素上，通过事件传播处理子元素。动态追加的按钮通常也能被统一处理。

- `event.target`：实际触发事件的目标。
- `event.currentTarget`：当前监听器所绑定的对象。
- `preventDefault()`：阻止可取消的默认行为。
- `stopPropagation()`：阻止继续传播，但不等于取消默认行为。

复杂的捕获、冒泡和观察者 API 详见 `07-Browser-Network/浏览器事件机制.md`。

## 六、DOM 何时可以安全操作？ ⭐⭐⭐

如果脚本在页面元素创建之前执行，查找可能得到 `null`。

```html
<head>
  <script src="/app.js" defer></script>
</head>
<body>
  <div id="app"></div>
</body>
```

`defer` 脚本在 HTML 解析完成后、`DOMContentLoaded` 之前按顺序执行；普通 `async` 脚本不保证与 DOM 解析和其他脚本的执行顺序。

```javascript
document.addEventListener('DOMContentLoaded', () => {
  console.log(document.querySelector('#app'));
});
```

**注意：** `DOMContentLoaded` 不代表所有图片都加载完成。`load` 事件覆盖的依赖资源范围更广。

## 七、BOM：窗口、地址和历史记录 ⭐⭐⭐

### location：当前页面地址

```javascript
const url = new URL(window.location.href);
console.log(url.pathname); // 路径，如 /products
console.log(url.searchParams.get('id')); // 查询参数
// location.assign('/home'); // 导航到新地址
```

`location.hash` 是 URL 的片段标识，通常不随 HTTP 请求发送给服务器。

### history：浏览器历史

```javascript
history.pushState({ tab: 'profile' }, '', '/profile');
history.replaceState({ tab: 'settings' }, '', '/settings');
window.addEventListener('popstate', (event) => {
  console.log('历史状态变化：', event.state);
});
```

**易错：** `pushState()` 改变 URL 和历史记录，但不会自动请求服务器或重新渲染页面；通常由路由系统或业务代码决定页面内容。调用 `pushState()` 本身也不会触发 `popstate`。

### navigator：浏览器能力

例如 `navigator.language`、`navigator.onLine`。不要把 `navigator.onLine === true` 当成“服务器一定可访问”，它只能反映有限的网络状态信息。

### window 与其他能力

`window` 是浏览器窗口的全局对象，常见相关 API 包括 `setTimeout`、`matchMedia`、`scrollTo`、`localStorage` 等。这些 API 属于不同 Web 标准，不必机械地认为它们都属于某个统一的 BOM 规范。

## 八、DOM 操作性能：为什么要避免读写交替？ ⭐⭐

```javascript
// 容易出现强制同步布局的写法
for (const el of elements) {
  const width = el.offsetWidth; // 读布局
  el.style.width = `${width + 10}px`; // 写布局
}

// 更容易优化的写法：读操作与写操作分离
const widths = elements.map((el) => el.offsetWidth);
elements.forEach((el, i) => {
  el.style.width = `${widths[i] + 10}px`;
});
```

布局结果的读取可能使浏览器在有尚未处理的样式变更时被迫同步计算布局。优化要结合 DevTools Performance 实际测量。

## 九、常见问题排查

| 问题 | 可能原因 | 排查方式 |
| --- | --- | --- |
| querySelector 结果是 null | 元素还没创建或选择器不正确 | 检查脚本执行时机和 DOM |
| click 处理不到动态按钮 | 监听器绑定到旧节点 | 考虑事件委托 |
| 列表循环删除漏项 | 遍历动态 HTMLCollection | 改为静态快照或倒序遍历 |
| pushState 后页面没变化 | 没有写对应渲染逻辑 | 配合路由/状态更新 |
| API 文本展示成 HTML | 使用 innerHTML | 普通文本用 textContent |

## 十、面试自测

- [ ] DOM 与 BOM 有什么区别？
- [ ] Node 与 Element 的区别是什么？
- [ ] NodeList 和 HTMLCollection 哪些情况是动态的？
- [ ] innerHTML、textContent、innerText 有什么区别？
- [ ] DOMContentLoaded 与 load 有什么区别？
- [ ] 什么是事件委托？为什么适合动态列表？
- [ ] pushState 与 popstate 是什么关系？
- [ ] 为什么交替读取 offsetWidth 和写入 style 可能导致卡顿？

## 十一、参考资料

- [MDN：DOM](https://developer.mozilla.org/zh-CN/docs/Web/API/Document_Object_Model)
- [MDN：Window](https://developer.mozilla.org/zh-CN/docs/Web/API/Window)
- [MDN：History API](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API)
- [MDN：Document](https://developer.mozilla.org/zh-CN/docs/Web/API/Document)

---
**掌握标准：** 能独立操作 DOM，正确区分静态/动态节点集合、DOM 加载时机与浏览器导航能力。
