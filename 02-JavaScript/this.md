# JavaScript this 指向与绑定规则

> **定位：** 以“调用方式”而非“定义在哪个对象里”理解 `this`，掌握箭头函数、`call/apply/bind` 与构造调用。
>
> **面试优先级：** ⭐⭐⭐｜**前置知识：** [作用域与闭包](./作用域与闭包.md)

## 一、一句话解释

对于**普通函数**，`this` 的值主要取决于函数如何被调用；对于**箭头函数**，`this` 来自其定义时外层的词法环境，不能通过 `call`、`apply`、`bind` 重新指定。

不要把 `this` 简单理解为“函数所在对象”或“调用函数的上一个对象”。要看**真正发生调用的表达式**。

## 二、四种典型绑定场景 ⭐⭐⭐

| 场景 | 常见形式 | 结果 |
| --- | --- | --- |
| 默认绑定 | `fn()` | 严格模式通常为 `undefined`；非严格模式存在全局对象替代行为 |
| 隐式绑定 | `obj.fn()` | 通常是点号左侧的 `obj` |
| 显式绑定 | `fn.call(obj)` / `apply` / `bind` | 显式指定普通函数调用时的 `this` |
| 构造调用 | `new Fn()` | 绑定到新建实例，且通常优先于显式预绑定 |

```js
'use strict';
function show() { return this; }

const obj = { show };
console.log(obj.show() === obj);    // true
console.log(show() === undefined);  // true
console.log(show.call({ a: 1 }).a); // 1
```

**注意：** `this` 的默认行为还受到严格模式、运行环境（浏览器/Node.js）、模块类型等因素影响。面试答题要先给出运行环境假设。

## 三、隐式绑定丢失：最常见的坑

```js
'use strict';
const person = {
  name: 'Ada',
  getName() { return this.name; }
};

console.log(person.getName()); // 'Ada'

const fn = person.getName;
// fn(); // TypeError：此时普通函数的 this 是 undefined

const safe = person.getName.bind(person);
console.log(safe()); // 'Ada'
```

为什么 `setTimeout(person.getName, 100)` 常出现问题？因为方法被**作为普通回调传递**，调用时不再具有原先的 `person.` 接收者。可用 `bind` 或包装回调 `() => person.getName()` 保留预期对象。

## 四、`call`、`apply`、`bind` 高频对比 ⭐⭐⭐

| 方法 | 是否立即执行 | 参数传法 | 返回值 |
| --- | --- | --- | --- |
| `call` | 是 | 逐个参数 | 被调用函数的返回值 |
| `apply` | 是 | 数组或类数组参数 | 被调用函数的返回值 |
| `bind` | 否 | 预置参数 | 新的绑定函数 |

```js
function add(a, b) {
  return `${this.label}:${a + b}`;
}

const ctx = { label: 'sum' };
console.log(add.call(ctx, 2, 3));      // 'sum:5'
console.log(add.apply(ctx, [2, 3]));  // 'sum:5'
const bound = add.bind(ctx, 2);
console.log(bound(3));               // 'sum:5'
```

**易错：** `bind` 返回新函数，不修改原函数；多次 `bind` 不能简单理解成后一次重新覆盖前一次的 `this`；`new` 调用绑定函数时会使用新建对象作为 `this`（预置参数仍生效）。

## 五、箭头函数的 `this`：从定义环境继承 ⭐⭐⭐

```js
const store = {
  value: 42,
  normal() {
    const later = () => console.log(this.value);
    later();
  },
  arrow: () => this
};

store.normal(); // 42
// store.arrow() 不会因为由 store 调用就得到 store 作为 this。
```

**避免歧义：** 顶层箭头函数的 `this` 取决于外围脚本/模块环境（ES 模块顶层通常是 `undefined`），不要用 `window` 或 Node.js 顶层值来概括一切环境。

箭头函数没有自己的 `arguments`，不能作为构造函数，不能用 `new`；可以用剩余参数替代 `arguments`：

```js
const sum = (...nums) => nums.reduce((a, b) => a + b, 0);
console.log(sum(1, 2, 3)); // 6
```

**常见坑：** 不要随手把对象方法写成箭头函数并期望其中的 `this` 指向该对象。

## 六、`this` 与原型方法、类、事件监听

### 1. 类方法依然可能丢失接收者

```js
class Counter {
  constructor() { this.count = 0; }
  inc() { this.count++; }
}

const counter = new Counter();
const increment = counter.inc;
// increment(); // TypeError：类方法处于严格模式
increment.call(counter);
console.log(counter.count); // 1
```

### 2. DOM 事件监听器（浏览器）

普通函数作为 `addEventListener` 监听器时，`this` 通常是绑定该监听器的 `currentTarget`；箭头函数则保留外层 `this`。实际推荐优先使用事件参数 `event.currentTarget`，语义更明确。

```js
// const button = document.querySelector('button');
// button.addEventListener('click', function (event) {
//   console.log(this === event.currentTarget); // true
// });
```

## 七、易错题与面试回答要点

```js
'use strict';
const obj = {
  x: 10,
  get() { return this.x; }
};
const other = { x: 20 };

console.log(obj.get());            // 10
console.log(obj.get.call(other));  // 20
console.log(obj.get.bind(other)()); // 20

const f = obj.get.bind(obj);
console.log(f.call(other));        // 10：原绑定不会被 call 改写
```

**面试回答框架：**

1. 先说明是普通函数还是箭头函数。
2. 对普通函数，辨认 `new`、`call/apply/bind`、对象方法调用、独立调用四种场景。
3. 如果函数被提取为回调，确认原接收者是否丢失。
4. 最后确认严格模式、类方法、模块环境等特殊前提。

## 八、自测与掌握标准

- [ ] 能解释 `obj.fn()` 与 `const f = obj.fn; f()` 差别
- [ ] 能区分 `call`、`apply`、`bind` 的参数与执行时机
- [ ] 能说明箭头函数的 `this` 无法由 `bind` 改写
- [ ] 能解释构造调用 `new` 与绑定函数的行为
- [ ] 能举出实际项目中回调 `this` 丢失的修复方案

**延伸：** [原型与原型链](./原型与原型链.md) · [手写题](./手写题.md)

**参考：** [MDN this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this) · [MDN bind](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
