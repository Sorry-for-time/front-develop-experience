/**
 * 对于 ClassComponent 生命周期函数的类型定义支持
 */
export type VueClassCompHook = Partial<{
  beforeCreate(this: ComponentPublicInstance): void;
  created(this: ComponentPublicInstance): void;
  beforeMount(this: ComponentPublicInstance): void;
  mounted(this: ComponentPublicInstance): void;
  beforeUpdate(this: ComponentPublicInstance): void;
  updated(this: ComponentPublicInstance): void;
  beforeUnmount(this: ComponentPublicInstance): void;
  unmounted(this: ComponentPublicInstance): void;
  errorCaptured(
    this: ComponentPublicInstance,
    err: unknown,
    instance: ComponentPublicInstance | null,
    info: string
  ): boolean | void;
  activated(this: ComponentPublicInstance): void;
  deactivated(this: ComponentPublicInstance): void;
}>;
