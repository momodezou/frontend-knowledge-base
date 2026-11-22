# `type` 与 `interface`：类型建模和高频面试题

> **定位**：不把 `type` / `interface` 的区别背成口诀，重点理解结构化类型系统、扩展、联合与交叉类型，以及团队中的合理选型。

## 一、`type` 与 `interface` 有哪些共同点？ ⭐⭐⭐

二者都可描述对象形状、可选属性、只读属性和函数签名。**TypeScript 主要采用结构化类型系统**：看值是否具有所需结构，而不是看类型名称是否相同。

```ts
interface UserA {
  id: number;
  name: string;
}

type UserB = {
  id: number;
  name: string;
};

const a: UserA = { id: 1, name: 'Ada' };
const b: UserB = a; // ✅ 结构兼容
```

## 二、最值得记住的区别 ⭐⭐⭐

| 对比 | `interface` | `type` |
|---|---|---|
| 定义对象形状 | ✅ | ✅ |
| `extends` 扩展 | ✅ | 可使用交叉类型组合，也支持部分类型表达式参与扩展 |
| 声明合并 | ✅ 同名接口可合并（作用域/规则允许时） | ❌ 同名别名不能重复声明 |
| 直接定义联合、元组、原始值别名 | ❌ | ✅ |
| 描述函数类型 | ✅ 调用签名 | ✅ 函数类型或调用签名 |
| 是否产生运行时代码 | ❌ | ❌ |

```ts
interface Base { id: number }
interface Admin extends Base { permissions: string[] }

type Result<T> = { ok: true; data: T } | { ok: false; message: string };
type Point = readonly [number, number];
type ID = string | number;
```

**推荐口径**：公共对象模型和面向扩展的 API 常用 `interface`；联合、交叉、映射、条件等类型表达式使用 `type` 更自然。两者没有绝对优劣，统一团队规范更重要。

## 三、声明合并 vs 类型交叉 ⭐⭐⭐

```ts
interface Config {
  host: string;
}
interface Config {
  port: number;
}
const c: Config = { host: 'localhost', port: 3000 };

// type Config2 = { host: string };
// type Config2 = { port: number }; // ❌ 重复标识符

type WithId = { id: number };
type WithName = { name: string };
type Member = WithId & WithName;
const member: Member = { id: 1, name: 'Lin' };
```

### 易错：交叉类型不是“后面的覆盖前面的”

```ts
type A = { value: string };
type B = { value: number };
type Conflict = A & B;
// Conflict['value'] 是 never（不可同时是 string 和 number）

type Override<T, U> = Omit<T, keyof U> & U;
type Fixed = Override<A, { value: number }>;
const fixed: Fixed = { value: 123 };
```

**面试追问**：`interface` 继承时遇到不兼容属性会怎样？（报错。）`A & B` 遇到同名不兼容属性又会怎样？（交叉后属性可能变为 `never`，有时整个交叉类型无法实例化。）

## 四、结构化类型与多余属性检查 ⭐⭐⭐

```ts
interface Person { name: string }

const person = { name: 'Ada', age: 20 };
const p: Person = person; // ✅ 结构上满足 Person

// const p2: Person = { name: 'Ada', age: 20 };
// ❌ 新鲜对象字面量会触发额外属性检查
```

**误区**：TypeScript 并不是总要求对象的字段与声明“一模一样”；新鲜对象字面量和已存在变量的检查规则有所不同。

### 可选属性与只读属性

```ts
interface Product {
  readonly id: number;
  name: string;
  description?: string;
}

const product: Product = { id: 1, name: 'Book' };
product.name = 'New Book';
// product.id = 2; // ❌ 只读类型约束
```

`readonly` 主要是**编译期**限制，而且通常是浅层的；它不意味着 `Object.freeze`。

## 五、函数类型、索引签名和继承 ⭐⭐

```ts
interface Formatter {
  (value: number, precision?: number): string;
}
const format: Formatter = (value, precision = 2) => value.toFixed(precision);

type FormatAlias = (value: number, precision?: number) => string;

interface Scores {
  [name: string]: number;
}
const scores: Scores = { Alice: 90, Bob: 87 };
```

**索引签名陷阱**：声明了 `[key: string]: number` 后，所有明确声明的字符串属性也必须与 `number` 兼容；若对象包含不同类型字段，优先拆分模型或使用更明确的组合结构。

## 六、实际项目如何选型？

假设做企业管理后台：

```ts
interface Employee {
  id: number;
  name: string;
  departmentId: number;
}

type PageQuery = {
  page: number;
  pageSize: number;
  keyword?: string;
};

type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

interface EmployeeDetail extends Employee {
  managerName?: string;
}
```

- 实体模型：`Employee` 使用 `interface` 清晰可扩展。
- 请求参数：`type` 或 `interface` 都可，保持一致即可。
- 成功与失败分支：`type` 联合最清晰，结合判别字段实现安全收窄。
- **不要混淆 TS 结构类型和运行时的类继承或数据校验。**

## 七、面试常见追问与自测

- [ ] `interface` 与 `type` 最大区别是否只有声明合并？
- [ ] 为什么 `type A = { a: string } & { a: number }` 存在不可用属性？
- [ ] 什么是结构化类型系统？为什么变量与对象字面量的额外字段检查不同？
- [ ] 如何用 `Omit<T, keyof U> & U` 实现“覆盖属性”而不是冲突的交叉？
- [ ] `readonly` 能阻止运行时对象修改吗？
- [ ] 应如何为 API 成功与失败响应设计联合类型？

## 八、参考资料

- [TypeScript Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- 相关专题：[工具类型](./工具类型.md) · [类型守卫](./类型守卫.md)

> **掌握状态**：待自测 ｜ 必须能解释：声明合并、结构兼容、多余属性检查、交叉冲突
