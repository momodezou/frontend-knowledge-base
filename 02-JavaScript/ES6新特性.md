# ES6+ 常用新特性与易错点

> **定位：** “ES6+”是前端开发中的习惯说法，本篇覆盖 **ES2015（ES6）及后续 ECMAScript 版本**中最常用的特性；重点理解语义和实际开发场景。
>
> **面试优先级：** ⭐⭐⭐｜**关联：** [基础知识](./基础知识.md) · [Promise](./Promise.md)

## 一、先抓住最重要的变化

从 ES2015 开始，JavaScript 增加了块级声明、箭头函数、解构、模板字符串、类、模块、Promise、迭代器等重要机制。后续版本继续加入 `async/await`、对象展开、可选链、空值合并、`BigInt` 等能力。

不要把所有后续版本的特性都叫作“ES6 新增”：`async/await` 属于 ES2017，可选链和空值合并运算符属于 ES2020。

## 二、块级声明、箭头函数与默认参数 ⭐⭐⭐

### 1. `let`、`const` 与暂时性死区

```js
const user = { name: 'Ada' };
user.name = 'Grace'; // 允许：修改对象内容
// user = {};        // TypeError：不能重新赋值 const 绑定

for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 0、1、2
```

`const` 并不等于对象不可变，`let` 与 `const` 在初始化前都处于 TDZ。

### 2. 箭头函数与普通函数的区别

```js
const obj = {
  value: 5,
  add(n) {
    const calculate = x => x + this.value;
    return calculate(n);
  }
};
console.log(obj.add(2)); // 7
```

箭头函数没有自己的 `this`、`arguments` 和构造能力。**对象方法若需要动态的 `this`，优先使用方法简写或普通函数**。

### 3. 默认参数只在值为 `undefined` 时生效

```js
function greet(name = 'Guest') { return name; }
console.log(greet(undefined)); // 'Guest'
console.log(greet(null));      // null
console.log(greet(''));        // ''
```

## 三、解构、剩余参数与展开语法 ⭐⭐⭐

```js
const user = { id: 1, name: 'Ada', profile: { city: 'Chengdu' } };
const { name: displayName, profile: { city } } = user;
console.log(displayName, city); // 'Ada' 'Chengdu'

const [first, , third = 99] = [10, 20];
console.log(first, third); // 10 99

function sum(...nums) { return nums.reduce((a, b) => a + b, 0); }
console.log(sum(1, 2, 3)); // 6
```

**三个易错点：**

1. 解构的默认值也只针对 `undefined`，不覆盖 `null`。
2. 对象展开 `{ ...obj }` 是**浅拷贝**，嵌套对象仍共享引用。
3. `...` 在函数形参中表示 **rest（收集）**，在调用/字面量中表示 **spread（展开）**，语义不同。

```js
const a = { nested: { score: 1 } };
const b = { ...a };
b.nested.score = 2;
console.log(a.nested.score); // 2
```

## 四、模板字符串、可选链与空值合并 ⭐⭐⭐

```js
const user = { profile: { name: 'Ada' } };
console.log(`Hello, ${user.profile.name}`); // 'Hello, Ada'

const city = user.address?.city ?? '未知';
console.log(city); // '未知'

const count = 0;
console.log(count || 10); // 10
console.log(count ?? 10); // 0
```

**注意：**

- `?.` 只在左侧为 `null` 或 `undefined` 时短路，不是“任何异常都自动忽略”。
- `obj?.method()`：可选的是 `obj`；如果对象存在但 `method` 为 `undefined`，调用仍会出错。
- `obj.method?.()`：可选的是 `method`；若方法存在但不是函数，仍会出错。
- `??` 与 `||`、`&&` 不能在同一表达式中直接无括号混用；显式加括号更可读。

## 五、Set、Map 与 WeakMap ⭐⭐⭐

### 1. Set 去重与 Map 键

```js
const unique = [...new Set([1, 1, 2, 2])];
console.log(unique); // [1, 2]

const map = new Map();
const key = { id: 1 };
map.set(key, 'value');
console.log(map.get(key));     // 'value'
console.log(map.get({ id: 1 })); // undefined：不同对象
```

`Set/Map` 使用 SameValueZero 比较相等性：`NaN` 可被识别为同一个键值，`+0` 与 `-0` 被视为相等。

### 2. WeakMap 的实用场景

`WeakMap` 的键只能是对象或非注册的 Symbol；键是弱持有关系，不会仅因存在于 WeakMap 中就阻止该对象被回收。它不可迭代，也没有常规的 `.size` 属性。

```js
const metadata = new WeakMap();
const element = {};
metadata.set(element, { clicked: 0 });
console.log(metadata.get(element).clicked); // 0
```

典型应用：关联某个对象的私有元数据、缓存与避免不必要的引用保留。

## 六、Symbol、迭代器与 Generator ⭐⭐

### 1. `Symbol` 创建独特标识

```js
const a = Symbol('id');
const b = Symbol('id');
console.log(a === b); // false

const obj = { [a]: 10 };
console.log(obj[a]); // 10
```

Symbol 属性不会出现在 `Object.keys()` 中，但并非绝对私密：`Object.getOwnPropertySymbols()` 可以获取它们。

### 2. 可迭代协议让 `for...of` 运作

```js
const range = {
  start: 1,
  end: 3,
  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) yield i;
  }
};
console.log([...range]); // [1, 2, 3]
```

`for...of` 处理迭代产生的值；`for...in` 主要枚举可枚举的字符串属性名，二者不能混为一谈。

### 3. Generator 可暂停和恢复执行

```js
function* ids() {
  yield 1;
  yield 2;
  return 3;
}
const it = ids();
console.log(it.next()); // { value: 1, done: false }
console.log(it.next()); // { value: 2, done: false }
console.log(it.next()); // { value: 3, done: true }
```

## 七、Proxy 与 Reflect：响应式原理入门 ⭐⭐⭐

`Proxy` 可以拦截目标对象的读取、赋值等操作；`Reflect` 提供与这些内部操作对应的标准方法。在 Vue3 等响应式系统中非常重要。

```js
const target = { count: 0 };
const reactive = new Proxy(target, {
  get(target, key, receiver) {
    console.log('get:', String(key));
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log('set:', String(key), value);
    return Reflect.set(target, key, value, receiver);
  }
});

reactive.count += 1; // get: count；set: count 1
```

**面试追问：** 为什么 `Reflect.get(target, key, receiver)` 通常会传 `receiver`？（与访问器属性中的 `this` 绑定等行为有关。）

**边界：** Proxy 需要遵守语言不变量约束；不能随意返回与不可配置、不可写属性相冲突的值。Proxy 也不会自动让所有嵌套对象变成响应式对象，通常需要进一步包装。

## 八、模块化：ESM 与 CommonJS ⭐⭐⭐

### 1. ES Modules（ESM）

```js
// math.js
export const version = '1.0';
export function add(a, b) { return a + b; }

// main.js（在支持 ESM 的环境中）
// import { add, version } from './math.js';
// console.log(add(1, 2), version);
```

ESM 采用静态声明的 `import` / `export`（也支持动态 `import()`），导入是**只读的动态绑定**：导出方更新绑定，导入方可以观察到更新；导入方不能直接给该导入绑定重新赋值。

### 2. 对比 CommonJS

| 对比项 | ESM | CommonJS |
| --- | --- | --- |
| 常见语法 | `import` / `export` | `require` / `module.exports` |
| 加载模型 | 标准模块系统，静态依赖便于分析 | Node.js 历史模块系统，运行时 `require` |
| 绑定特性 | 导入为只读的动态绑定 | `require()` 得到导出值，常见表现是对象引用或值快照 |
| 适用环境 | 现代浏览器、Node.js、构建工具 | Node.js 存量生态 |

**注意：** “ESM 就一定异步、CommonJS 就一定同步”“ESM 只用于前端”都不是准确的概括；运行环境和加载入口需要具体分析。

## 九、面试高频易错汇总

| 问题 | 正确认识 |
| --- | --- |
| `const` 声明的对象能否改属性？ | 能；不能改的是绑定 |
| 解构默认值会覆盖 `null` 吗？ | 不会；只对 `undefined` 生效 |
| 展开对象就是深拷贝吗？ | 不是，通常只复制第一层属性值 |
| 箭头函数有自己的 `this` 吗？ | 没有，来自外层词法环境 |
| `Set` 能对两个不同对象按内容去重吗？ | 不能，仅凭引用身份比较对象 |
| `WeakMap` 为什么不可迭代？ | 弱引用键的存活与垃圾回收有关，不提供稳定键集合 |
| ESM 的 `import` 是值快照吗？ | 不是，导入是只读的动态绑定 |

## 十、掌握检查表

- [ ] 能区分 ES2015 与后续版本中的常用特性
- [ ] 能解释 rest/spread、解构默认值和浅拷贝
- [ ] 能说明 `||`、`??`、`?.` 的典型易错场景
- [ ] 能正确使用 Map/Set，并理解 WeakMap 的适用条件
- [ ] 能简述 Proxy/Reflect 与响应式系统的关联
- [ ] 能解释 ESM 的导入绑定与 CommonJS 的区别

**延伸：** [数据类型](./数据类型.md) · [Promise](./Promise.md) · [原型与原型链](./原型与原型链.md)

**参考：** [MDN JavaScript](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript) · [MDN JavaScript 模块](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules) · [ECMAScript 规范](https://tc39.es/ecma262/)
