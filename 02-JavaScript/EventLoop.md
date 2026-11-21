# JavaScript Event Loop 事件循环

> **定位：** 搞清楚同步代码、任务（task）、微任务（microtask）、`Promise`、定时器和浏览器渲染的关系。
>
> **面试优先级：** ⭐⭐⭐｜**前置知识：** [Promise](./Promise.md)

## 一、先说结论：JavaScript 单线程不等于所有工作都同步

在常见浏览器页面主线程中，JavaScript 执行同一时刻通常只有一条调用栈；但是定时器、网络、用户交互等能力由宿主环境协调，完成后把对应回调安排到队列里。**事件循环负责协调任务、微任务与渲染时机**。

下面重点讨论**浏览器环境**；Node.js 有自己的事件循环阶段和 `process.nextTick` 等机制，不能把浏览器示例直接套到 Node.js 的所有场景。

## 二、调用栈、任务和微任务 ⭐⭐⭐

| 概念 | 常见例子 | 核心特点 |
| --- | --- | --- |
| 同步调用栈 | 普通函数调用、Promise executor | 当前代码立即执行，直到返回 |
| 任务（task） | 初始脚本、`setTimeout`、用户交互事件 | 一次取一个任务执行 |
| 微任务（microtask） | `Promise.then`、`queueMicrotask`、MutationObserver | 在微任务检查点处理，通常在下一个任务之前清空 |
| 渲染机会 | 样式计算、布局、绘制、`requestAnimationFrame` | 浏览器决定何时进行，**不保证每轮循环都渲染** |

简化流程（浏览器）：

```text
取出并执行一个任务
       ↓
执行相关的微任务检查点（持续处理微任务直到队列为空）
       ↓
浏览器若有机会且需要，更新渲染 / 执行相关帧回调
       ↓
进入下一轮事件循环
```

**不能机械地背诵成“每个宏任务结束必定渲染一次”。** 渲染由浏览器调度，标签页不可见时还可能被节流。

## 三、最基础的输出题 ⭐⭐⭐

```js
console.log('A');

setTimeout(() => console.log('D'), 0);

Promise.resolve().then(() => console.log('C'));

console.log('B');

// A B C D
```

解释：

1. 初始脚本本身是一个任务，同步打印 `A`、`B`。
2. 已完成的 Promise 注册 `then` 微任务，在当前同步代码结束后执行，打印 `C`。
3. 定时器回调要等适当的后续任务执行，打印 `D`。

**不要说 `setTimeout(fn, 0)` 会立即执行。** 0 是计划延迟的下界提示，实际运行时机可能受任务阻塞、嵌套定时器限制、页面后台节流等影响。

## 四、Promise executor、链式微任务与 `await` ⭐⭐⭐

### 1. executor 同步，`then` 异步

```js
console.log('1');
new Promise(resolve => {
  console.log('2');
  resolve();
}).then(() => console.log('4'));
console.log('3');
// 1 2 3 4
```

### 2. 微任务可以继续加入新微任务

```js
Promise.resolve().then(() => {
  console.log('A');
  queueMicrotask(() => console.log('C'));
});
Promise.resolve().then(() => console.log('B'));
// A B C：新微任务排到当前已排队微任务之后
```

**易错：** 微任务并非“只执行一次”。微任务检查点会继续处理过程中新增的微任务，直到队列为空。若持续无限创建微任务，可能**饿死后续任务和渲染**。

### 3. `await` 后续异步继续

```js
async function demo() {
  console.log('B');
  await 0;
  console.log('D');
}

console.log('A');
demo();
Promise.resolve().then(() => console.log('E'));
console.log('C');
// A B C D E
```

`await 0` 相当于对一个普通值等待完成，但后续部分仍异步继续。上例中 `await` 的后续作业先于随后注册的 Promise 回调进入队列，因此先打印 `D`。

## 五、浏览器渲染、`requestAnimationFrame` 和观察者

### 1. `requestAnimationFrame`

`requestAnimationFrame(callback)` 用于在浏览器**下一次计划绘制前**执行回调，适合与页面绘制同步的动画，不属于普通的 Promise 微任务。

```js
// 浏览器环境：
// requestAnimationFrame(() => {
//   element.style.transform = 'translateX(100px)';
// });
```

**注意：** 不要对 `setTimeout(..., 0)` 和 `requestAnimationFrame` 的相对执行先后做无条件保证；浏览器的渲染时机、任务调度和页面状态可能影响实际次序。

### 2. `MutationObserver`

DOM 变化产生的 `MutationObserver` 回调使用微任务相关的调度机制；一个同步任务中的多次 DOM 变化通常可以被批量通知。它不是每修改一次就立即同步调用观察回调。

### 3. 其他观察者 API

`IntersectionObserver` 关注元素可见性变化，`ResizeObserver` 关注尺寸变化；这类回调有各自与渲染管线相关的调度规则，**不要全都归类为普通微任务**。

## 六、定时器、网络和真实项目中的问题

### 1. 为什么页面卡顿时定时器“不准”？

主线程若被长时间同步任务占据，即使定时器到期，回调也无法抢占当前 JavaScript 代码执行。

```js
const start = performance.now();
setTimeout(() => {
  console.log('timer elapsed:', Math.round(performance.now() - start));
}, 0);

// 如果后面同步执行很耗时的循环，定时器只能之后执行。
```

### 2. 微任务过多也会造成卡顿

```js
// 危险示例：不要运行无限递归的微任务
// function loop() { queueMicrotask(loop); }
// loop();
```

更好的策略是将重计算拆成批次，必要时将计算放入 Web Worker，或在适当的任务/帧之间主动让出执行机会。

### 3. 把“异步”和“并行”混为一谈

多个 `fetch()` 同时等待网络响应，可以并发地进行 I/O；但是普通 JavaScript CPU 密集计算并不会仅因包裹在 Promise 中就自动多线程化。

## 七、Node.js 的区别（面试扩展）

Node.js 使用 libuv 驱动事件循环，常见阶段包括 timers、poll、check 等。`setImmediate` 是 Node.js API，浏览器没有通用的同名标准 API；`process.nextTick()` 也不是浏览器 Promise 微任务的简单同义词。

**特别提醒：** Node.js 的 `process.nextTick()` 与 Promise 作业在通常场景有固定的优先关系，但在 CommonJS 顶层、ES Modules、不同阶段和不同 Node 版本中，具体输出次序可能有差异。面试题若没有注明运行环境，不应武断下结论。

## 八、面试高频输出题

```js
console.log('start');

setTimeout(() => console.log('timeout'), 0);

Promise.resolve()
  .then(() => {
    console.log('then1');
    return Promise.resolve();
  })
  .then(() => console.log('then2'));

queueMicrotask(() => console.log('microtask'));
console.log('end');
```

**确认不变的部分：** `start`、`end` 先同步输出；`then1` 与 `microtask` 都先于 `timeout`（假定普通浏览器环境且无其他干扰任务）。

**理解重点：** 这里 `return Promise.resolve()` 会引入 Promise 状态采纳与后续作业，不能只用“链上第二个 then 永远紧跟第一个 then”粗略判断。建议复制到浏览器控制台验证，再画出微任务队列变化。

## 九、复习检查表

- [ ] 能口述同步代码、任务、微任务的简化执行顺序
- [ ] 能区分 executor 与 `then` 的执行时机
- [ ] 能解释 `await` 为什么不阻塞整个线程
- [ ] 能解释 `setTimeout(fn, 0)` 为什么不是立即执行
- [ ] 能解释 `requestAnimationFrame` 与微任务的不同
- [ ] 能说明为什么微任务无限排队会导致页面无法渲染
- [ ] 能指出浏览器与 Node.js 事件循环不能简单混用

**延伸：** [Promise](./Promise.md) · [ES6 新特性](./ES6新特性.md)

**参考：** [MDN JavaScript 执行模型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Execution_model) · [MDN 微任务指南](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide) · [MDN requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)
