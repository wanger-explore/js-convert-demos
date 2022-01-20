# JS Convert

这个仓库指在对比 `tsc`、`babel` 等 JS 转换工具将 `ESModule` 转换为 `CommonJS` 时的种种差异。

## 测试情景

笔者主要测试了 `import` 与 `export` 的情况，主要分为下面四种情景：

以 `React` 为例：

### 情景一

代码在 `src/index-01.js`：

```js
import React from 'react';
```

### 情景二

代码在 `src/index-02.js`：

```js
import * as React from 'react';
```

### 情景三

代码在 `src/index-03.js`：

```js
import { Component } from 'react';
```

### 情景四

代码在 `src/index-04.js`，测试 ESModule 的普通导出和默认导出：

```js
export const fruit = "apple";
export const log = (...logs) => {
  console.log(...logs);
}
export default {
  name: "esm default",
};
```

## 测试配置

笔者写了三种配置来测试上面的代码：

### 测试配置一

使用 tsc 来编译，`tsconfig.json` 配置如下：

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "target": "es5",
    "allowJs": true,
    "outDir": "dist"
  },
  "include": [
    "src"
  ]
}
```

命令为 `yarn tsc`, 最后生成的代码在 `dist(tsc-build)` 中。

### 测试配置二

使用 tsc 来编译，并设置 `esModuleInterop` 为 true ，`tsconfig.json` 配置如下:

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "target": "es5",
    "allowJs": true,
    "outDir": "dist",
    "esModuleInterop": true
  },
  "include": [
    "src"
  ]
}
```

命令为 `yarn tsc`, 最后生成的代码在 `dist(tsc-build-with-esModuleInterop-true)` 中。

### 测试配置三

使用 babel 来编译，`babel.config.json` 配置如下：

```json
{
  "presets": [
    "@babel/preset-env"
  ]
}
```

命令为 `yarn babel src -d dist`, 最后生成的代码在 `dist(babel-build)` 中。

## 讨论

### 一、在转换为 CommonJS 时，如何处理 esModule 的默认导出？

esModule 有 default 这个概念，参考下面的例子：

```js
// base.mjs
const a = 1;
const b = 2;
const c = 3;

export default a;

export {
  b,
  c
}
```

```js
// app.js
import * as Base from './base.mjs';

console.log(Base);
```

最后的打印结果是：

```js
{ 
  b: 2, 
  c: 3, 
  default: 1 
}
```

但是 CommonJS 没有 `default`，任何导出的变量在 CommonJS 看来都是 `exports` 这个对象上的属性。

所以转换工具转换时，会将默认导出转换为 `exports['default']`。

以 `tsc` 为例：

```js
// 转换前， src/index-04.js
export default {
  name: "esm default",
};

// 转换后， dist(tsc-build)/index-04.js
exports.default = {
  name: "esm default",
};
```

再以 `babel` 为例：

```js
// 转换前， src/index-04.js
export default {
  name: "esm default",
};

// 转换后， dist(babel-build)/index-04.js
var _default = {
  name: "esm default"
};
exports["default"] = _default;
```

### 二、tsc 中的 `esModuleInterop` 有什么作用？

1、使用 `babel` 转换类似 `import React from 'react';` 时，生成的代码如下：

```js
// dist(babel-build)/index-01.js
var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

console.log(_react["default"]);
```

可以看到 `babel` 会用 `_interopRequireDefault` 包一下，这个函数会设置前面提到的 `default` 属性。这样的话，最后 `_react["default"]` 就可以引用成功。

2、而使用 `tsc` 转换类似 `import React from 'react';` 时，生成的代码如下：

```js
// dist(tsc-build)/index-01.js
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
console.log(react_1.default);
```

可以看到 `tsc` 默认并没有做像 `babel` 那样的处理，导致最后 `react_1.default` 打印的值是 `undefined`。

3、而当使用 `tsc` 并设置 `esModuleInterop` 为 true 时，生成的代码如下：

```js
// dist(tsc-build-with-esModuleInterop-true)/index-01.js
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
console.log(react_1.default);
```

可以看到设置 `esModuleInterop` 后，require 之后会用 `__importDefault` 包一下，这个函数和 `babel` 中的 `_interopRequireDefault` 很类似，所以最后也可以引用成功。

## 参考链接

- [esModuleInterop 到底做了什么？](https://zhuanlan.zhihu.com/p/148081795)