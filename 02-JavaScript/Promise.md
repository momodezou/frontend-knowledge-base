# JavaScript Promise 与异步编程

> **定位：** 以 Promise 状态、链式调用、错误传播、组合 API 与 `async/await` 为主线，解决中高级面试高频问题。
>
> **面试优先级：** ⭐⭐⭐｜**前置知识：** [基础知识](./基础知识.md) · [Event Loop](./EventLoop.md)

## 一、Promise 解决了什么问题？

传统回调风格容易出现多层嵌套、错误处理分散和流程组合困难。`Promise` 用一个对象表示**异步操作的最终完成或失败**，并提供可组合的 `then/catch/finally` 链式接口。

Promise 的三个状态：

| 状态 | 含义 | 是否终态 |
| --- | --- | --- |
| `pending` | 尚未确定最终结果 | 否 |
| `fulfilled` | 已成功，携带完成值 | 是 |
| `rejected` | 已失败，携带失败原因 | 是 |

**容易被忽略：** Promise 的 **resolved** 不总等于 **fulfilled**。例如以另一个待完成的 Promise 作为 `resolve` 参数时，当前 Promise 会采纳它的最终状态，因此可以已经被“解决”，却仍未 settled。

```js
const inner = new Promise(resolve => setTimeout(() => resolve('OK'), 100));
const outer = new Promise(resolve => resolve(inner));
outer.then(console.log); // 约 100ms 后输出 'OK'
```

状态一旦 settled 就不会再改变；多次调用 `resolve/reject` 中只有首次产生有效的最终决定或采纳结果。

## 二、执行器同步、回调异步 ⭐⭐⭐

```js
console.log('A');

const p = new Promise(resolve => {
  console.log('B');   // executor 同步执行
  resolve('result');
});

p.then(value => console.log('D', value));
console.log('C');

// A B C D result
```

- `new Promise(executor)` 的 `executor` **立即同步执行**。
- `then/catch/finally` 注册的处理回调，即使 Promise 已经完成，也在稍后通过 Promise 作业（通常是微任务）执行。
- 在 executor 中同步 `throw`，通常会使该 Promise 变为 rejected；但 **异步回调中抛出的异常**不一定会被创建它的 Promise 自动捕获。

```js
const p1 = new Promise(() => { throw new Error('sync error'); });
p1.catch(e => console.log(e.message)); // 'sync error'

// 不要以为下面会让 p2 自动 reject：
// const p2 = new Promise(resolve => {
//   setTimeout(() => { throw new Error('async error'); }, 0);
// });
// 定时器中的异常发生在后续任务中，需在定时器内自行捕获或封装。
```

## 三、`then` 链式调用与错误传播 ⭐⭐⭐

### 1. `then` 总返回一个新 Promise

处理函数返回：

- 普通值：新 Promise fulfilled 为该值。
- Promise / thenable：新 Promise 采纳其结果。
- 抛出异常：新 Promise rejected。
- 不写 `return`：默认返回 `undefined`，经常造成链式结果丢失。

```js
Promise.resolve(2)
  .then(n => n * 3)
  .then(n => Promise.resolve(n + 1))
  .then(console.log); // 7
```

**高频易错：漏写 `return`**

```js
function getNumber() { return Promise.resolve(5); }

Promise.resolve()
  .then(() => { getNumber(); })   // 没有 return
  .then(value => console.log(value)); // undefined

Promise.resolve()
  .then(() => getNumber())        // 正确返回 Promise
  .then(value => console.log(value)); // 5
```

### 2. 错误会沿链向下传播，直到被处理

```js
Promise.resolve('start')
  .then(() => { throw new Error('broken'); })
  .then(() => console.log('不会执行'))
  .catch(err => {
    console.log(err.message); // broken
    return 'recovered';      // 返回普通值：恢复为 fulfilled
  })
  .then(console.log);         // recovered
```

**易错：** `catch` 中如果只是记录日志并正常返回，就相当于“吞掉了异常”。如果上层必须知道失败，应重新 `throw err`。

### 3. `finally` 用于清理，不是修改结果

```js
Promise.resolve('ok')
  .finally(() => console.log('cleanup'))
  .then(console.log); // cleanup, ok

Promise.reject(new Error('fail'))
  .finally(() => console.log('cleanup on failure'))
  .catch(e => console.log(e.message)); // cleanup on failure, fail
```

普通情况下 `finally` 的返回值被忽略，原来的完成值/拒绝原因继续传递。但如果 `finally` **抛异常或返回被拒绝的 Promise**，它会覆盖此前结果。

## 四、`async/await`：语法更直观，但本质仍是 Promise ⭐⭐⭐

```js
async function loadUser() {
  const id = await Promise.resolve(7);
  return { id, name: 'Ada' };
}

loadUser().then(console.log); // { id: 7, name: 'Ada' }
```

- `async` 函数**始终返回 Promise**。
- `await` 只暂停当前 async 函数剩余部分，**不阻塞整个事件循环**。
- `await` 后面的表达式即使是普通值，也会使后续执行在异步作业中继续。
- `await` 一个拒绝的 Promise，会在当前 async 函数内表现为抛出异常，可使用 `try/catch`。

```js
async function request() {
  try {
    return await Promise.reject(new Error('network'));
  } catch (error) {
    console.error(error.message);
    throw error; // 保留失败语义，交给调用方处理
  } finally {
    console.log('request finished');
  }
}
request().catch(() => {});
```

**易错：串行与并发不同**

```js
const delay = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));

async function sequential() {
  const a = await delay(100, 'A');
  const b = await delay(100, 'B');
  return [a, b]; // 大约顺序等待两次
}

async function concurrent() {
  const pa = delay(100, 'A');
  const pb = delay(100, 'B');
  return await Promise.all([pa, pb]); // 两项先启动，再一起等待
}
```

**注意：** JavaScript Promise 的“并发”并不保证多线程并行计算；这里体现的是异步操作等待时间可重叠。

## 五、四个组合 API：面试必会 ⭐⭐⭐

| API | 何时成功？ | 何时失败？ | 典型用途 |
| --- | --- | --- | --- |
| `Promise.all()` | 全部 fulfilled，按输入顺序给结果 | 任一 rejected 即拒绝 | 多请求全部成功才能展示 |
| `Promise.allSettled()` | 所有任务 settled 后给各自状态 | **通常不会因输入 Promise 拒绝而拒绝** | 允许部分失败的批量任务 |
| `Promise.race()` | 最早 settled 的结果决定 | 最早 settled 若失败则拒绝 | 与超时信号竞速 |
| `Promise.any()` | 任何一个 fulfilled 即成功 | 全部 rejected 后以 `AggregateError` 拒绝 | 多源容错取最快成功结果 |

```js
async function examples() {
  console.log(await Promise.all([Promise.resolve('a'), 'b']));
  // ['a', 'b']

  console.log(await Promise.allSettled([
    Promise.resolve(1), Promise.reject('oops')
  ]));
  // [{ status:'fulfilled', value:1 }, { status:'rejected', reason:'oops' }]

  console.log(await Promise.any([
    Promise.reject('bad'), Promise.resolve('good')
  ]));
  // 'good'
}
examples();
```

**关键易错 1：** `Promise.all()` 的结果数组按**输入顺序**排列，不按完成先后排序。

**关键易错 2：** `Promise.all()` 早拒绝**不会自动取消其他任务**；其他请求通常继续执行。要取消网络请求，需要结合 `AbortController` 等机制。

**关键易错 3：空输入差异**：`all([])` 返回已 fulfilled 的 Promise（值为 `[]`）；`allSettled([])` 同理；`race([])` 永远 pending；`any([])` 返回 rejected Promise（`AggregateError`）。

## 六、工程实践：请求、超时与取消

在前端中，Promise 常用于 API 请求。`fetch()` 在 HTTP 404 / 500 时通常**不会仅因状态码而 reject**，需要自行判断 `response.ok`。

```js
async function getJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

// 浏览器 / 支持 fetch 的 Node 环境：
// const controller = new AbortController();
// getJson('/api/data', controller.signal).catch(console.error);
// controller.abort();
```

取消的是支持该取消信号的底层操作，而不是“把所有 Promise 都取消”。为避免竞态问题（旧请求较晚返回覆盖新请求），还可以结合请求 ID、`AbortController` 或组件卸载清理。

## 七、一道经典综合面试题

```js
console.log(1);

Promise.resolve().then(() => {
  console.log(2);
  return 3;
}).then(console.log);

console.log(4);

// 输出：1、4、2、3
```

解释：同步先输出 `1、4`；首个 `then` 是微任务，输出 `2` 并返回 `3`；后续 `then` 通过新的 Promise 作业输出 `3`。

## 八、自测与掌握标准

- [ ] 能解释 Promise 的三态、settled 与 resolved 的区别
- [ ] 能解释 executor 为什么同步、`then` 为什么异步
- [ ] 能解释链式返回值、异常穿透与 `catch` 吞错
- [ ] 能比较 `all/allSettled/race/any`，包括空数组情况
- [ ] 能写出 `async/await` 串行与并发版本
- [ ] 能说明 `Promise.all` 不能自动取消请求，以及 `fetch` 的 HTTP 错误处理

**延伸：** [Event Loop](./EventLoop.md) · [手写题](./手写题.md)

**参考：** [MDN Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise) · [MDN 使用 Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
