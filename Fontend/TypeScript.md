# TypeScript

`JavaScript` 是 `dynamic type`，而 `TypeScript` 把它变成了 `static type`，即需要声明类型了。

似乎导包需要 `@type/express` 和 `express` 的 `js` 包都得要。前者纯粹定义 `type`，后者才是具体实现？

然后全都换成了 `import` 写法。

## 接口

```typescript
interface LabelledValue {
  label: string;
}
```

只需要一个 `obj` 含有 `label`：`{label:xxx}`，就说这个对象实现了这个接口，可以传入。

## 问题

`Element` 类型找不到，是需要在 `tsconfig.json` 中 `compilerOptions` 中的 `"lib": ["es6","dom"]` 添加 `dom`。

[TypeScript error: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/52383)

try to import a `CommonJS` module into an `ES6` module （如 `import path from 'path'`）需要在 `"compilerOptions"` 中添加 `"esModuleInterop": true`

[TypeScript: Module can only be default-imported using the 'esModuleInterop' flag](https://bobbyhadz.com/blog/typescript-module-can-only-be-default-imported-esmoduleinterop)

## Node

除了 `eslint`，`node` 版本和支持的 `js` 语言版本也有关系。

`nvm` 可以控制 `node` 的多个版本切换

[Node Version Manager for Windows](https://github.com/coreybutler/nvm-windows)

`nvm current`: Display active version.

`nvm list [available]`: List the `node.js` installations. Type available at the end to show a list of versions available for download.

`nvm use <version> [arch]`: Switch to use the specified version. Optionally use latest, lts, or newest.

`nvm install <version> [arch]`: The version can be a specific version, "latest" for the latest current version, or "lts" for the most recent LTS version. Optionally specify whether to install the 32 or 64 bit version (defaults to system arch). Set [arch] to "all" to install 32 AND 64 bit versions. Add --insecure to the end of this command to bypass SSL validation of the remote download server.

## npm

```bash
npm install express@4.17.1  # 指定版本
npm install express --save  # 可保存在package.json中
npm install -g @vue/cli
npm uninstall xxx
npm install npm -g  # npm升级到最新版本
npm -v  # 查看当前版本
```

`-g` 全局安装包

`-S --save` 将依赖包安装到生产 `dependencies`，后续打包 `dist` 文件夹也会打包进去。

`-D --save-dev` 将依赖包安装到 `devDependencies`，该依赖只会在开发阶段用到，而在生产阶段不会用到。

都是在 `package.json` 可以读取到的消息

`devDependencies` 的理解：

我们在开发一个前端项目的时候，需要使用到 `webpack` 或者 `gulp` 来构建我们的开发和本地运行环境，这时我们就要安装到 `devDependencies` 里。`webpack` 或者 `gulp` 是用来打包压缩代码的工具，在项目实际运行的时候用不到，所以把 `webpack` 或者 `gulp` 放到 `devDependencies` 中就行了。

`dependencies` 的理解：

我们在项目中用到了 `element-ui` 或者 `mint-ui`，在生产环境中运行项目，当然也需要 `element-ui` 或者 `mint-ui`，所以我们把 `element-ui` 或者 `mint-ui` 安装到 `dependencies` 中。

```javascript
productionSourceMap: false, //打包不生成map
```

```bash
npm config set proxy=http://127.0.0.1:8087  # 设定代理
npm config set registry=http://registry.npmjs.org  # 设定仓库
npm config set https-proxy http://server:port  # 设置https代理
npm config delete proxy
npm config delete https-proxy  # 取消代理
```

## Express

### 使用http module显示html页面

非常的繁琐：

### 使用Express

[Express - Node.js web application framework](http://expressjs.com/)

#### Route Params and Query

##### Post

`post` 需要使用 `req.body`

但 `var bodyParser = require('body-parser');`

`app.use(bodyParser());`

需要使用该中间件才可以处理

`app.use(express.json({ limit: "10000kb" }));` 其实 `Express` 也有相应中间件。`limit` 可以设置 `post` 内容的大小。

#### Middleware

## 问题

Cannot find module 'supports-color'

if disable breakpoints type "All Exceptions" then work fine. （即在 `Debug` —— `Windows` 中 `ExceptionSettings` 还原默认异常设置）

