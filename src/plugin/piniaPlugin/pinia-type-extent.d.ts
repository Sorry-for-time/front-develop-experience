export {};

declare module "pinia" {
  interface DefineStoreOptionsBase<S extends StateTree, Store> {
    /**
     * 持久化配置
     */
    persist?: {
      /**
       * 持久化类型, 仅 `indexedDB` 存储支持 web-worker 上下文环境
       */
      storage: "indexedDB" | "sessionStorage" | "localStorage";
      /**
       * 是否持久化只读数据(对于 readonly, shallowReadOnly...)
       * @see {@link https://cn.vuejs.org/api/reactivity-advanced.html#shallowreadonly}
       */
      persistReadonly: boolean;
    } & Partial<{
      /**
       * 自定义数据存储库的名称, 默认为 store.$id
       */
      key: string;
      /**
       * 加载恢复本地数据前的操作
       * @param ctx pinia 插件上下文
       */
      beforeRestore: (ctx: PiniaPluginContext) => void;
      /**
       * 从本地恢复数据后的操作
       * @param ctx pinia 插件上下文
       */
      afterRestore: (ctx: PiniaPluginContext) => void;
    }>;
  }
}
