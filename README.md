# front-develop-experience

## 简单介绍

- 基于 vue3 + ts 的基本组合, 进行不同风格的开发方式组合尝试, 如
  1. tsx
  2. sfc + class-decorator
  3. class-decorator + tsx
  4. 组合 rxjs...
- 编写一些工具以获取 vue3 响应式对象的原始引用数据(包含对于只读包装数据的指定处理)
  1. `src/util/reactiveUtil.ts`
     - `fn: unwrapReactiveOrRefObj`
     - `fn: recursiveReplaceValue`

## 二次拓展的一些有趣的功能

1. 基于 `indexedDB + web-worker` 实现的 pinia `复杂对象/二进制数据` 本地异步持久化方案
2. 基于 vue 原有的响应式包装, 实现一个简单的读写分离包装:
   - `src/util/signal.ts` $\to$ `fn: createSignal`
3. 基于 vue 原有插件 api + 自定义指令 api(directive) 配合 `rxjs` 的操作符实现的可拖拽指令 `v-moveable`, 并且是基于 typescript 类型提示的使用体验
4. 配合 `vue-facing-decorator` 实现一些有用的类组件装饰器, 如
   - `@Aspect`
   - `@UseDebounce`
   - `@UseThrottle`
   - ...

## 示例的使用步骤

1. 安装 `nodejs >= 16`, 推荐使用版本管理工具(`nvm...`)
2. 安装 `pnpm`
   ```sh
   # recommend zsh, bash, powershell
   npm i -g pnpm
   ```
3. 安装依赖
   ```sh
   pnpm i
   ```
4. 本地开发预览(`see package.json -> scripts`)
   ```sh
   pnpm dev
   ```
