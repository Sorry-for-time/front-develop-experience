export {};

declare module "pinia" {
  interface DefineStoreOptionsBase<S extends StateTree, Store> {
    /**
     * 持久化配置
     */
    persist?: Partial<{
      /**
       * 持久化类型, 仅 `indexedDB` 存储支持 web-worker 上下文环境
       */
      storage: "indexedDB" | "sessionStorage" | "localStorage";
      /**
       * 是否持久化只读数据(对于 readonly, shallowReadOnly...)
       * @see {@link https://cn.vuejs.org/api/reactivity-advanced.html#shallowreadonly}
       */
      persistReadonly: boolean;
    }>;
  }
}
