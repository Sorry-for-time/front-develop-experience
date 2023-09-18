import { shallowRef, triggerRef, type ShallowRef } from "vue";

/**
 * 信号量取值类型
 */
type SignalGetter<T> = () => T;
/**
 * 信号量设置类型
 */
type SignalSetter<T> = ((newVal: T) => void) &
  ((updater: (oldVal: T) => T) => void) &
  ((updater: () => T) => void);
/**
 * 信号量组合类型
 */
type SignalWrapper<T> = [getter: SignalGetter<T>, setter: SignalSetter<T>];

/**
 * 创建一个读写分离的信号量
 *
 * @param value 原始值
 * @param options 配置项: equals 为 true 表示立即响应对生层次数据结构的变更, 默认为 true
 * @returns 信号读取器 & 更新器
 */
const createSignal = <T>(
  value: T,
  options: {
    equals: boolean;
  } = {
    equals: true
  }
): SignalWrapper<T> => {
  const store: ShallowRef<T> = shallowRef(value);
  const getter: SignalGetter<T> = (): T => store.value;
  const setter: SignalSetter<T> = (updater): void => {
    store.value =
      typeof updater === "function"
        ? (updater as (val?: T) => T)(store.value)
        : updater;
    if (!options?.equals) {
      triggerRef(store);
    }
  };

  return [getter, setter];
};

export { createSignal };
