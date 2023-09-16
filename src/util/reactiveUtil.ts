import type { PiniaCustomStateProperties, StateTree } from "pinia";
import {
  isProxy,
  isReadonly,
  isShallow,
  readonly,
  shallowReadonly,
  toValue
} from "vue";

/**
 * 递归解包响应式数据为原始数据引用对象, 切记不能直接修改返回的解包对象, 否则会影响响应式数据, 如果要进行修改, 则需要进行深拷贝
 *
 * @param source 响应式数据源
 * @param copyReadonlyValue 是否复制标记为只读属性的值, 默认为 true {@link "https://cn.vuejs.org/api/reactivity-core.html#readonly"}
 * @returns 响应式数据解包引用对象
 */
export const unwrapReactiveOrRefObj = <T>(
  source: any,
  copyReadonlyValue: boolean
): Readonly<T> => {
  if (!isProxy(source)) {
    return source;
  }
  const unWrapValue: any = {};
  for (const key of Object.getOwnPropertyNames(source)) {
    if (isProxy(source[key])) {
      unWrapValue[key] = unwrapReactiveOrRefObj(source[key], copyReadonlyValue);
    } else {
      if (copyReadonlyValue) {
        unWrapValue[key] = toValue(source[key]);
      } else {
        if (!isReadonly(source)) {
          unWrapValue[key] = toValue(source[key]);
        }
      }
    }
  }

  return unWrapValue;
};

/**
 * 用于更新处理包含(reactive, ref, shallowRef...)的 setup 风格的 pinia-store
 *
 * @param rawState store -> state 状态
 * @param existsVal 用于更新 state 列表的新数据
 * @param replaceReadonlyValueFromOther 是否从其它数据源重写只读属性, 默认为 true {@link "https://cn.vuejs.org/api/reactivity-core.html#readonly"}
 */
export const recursiveReplaceValue = (
  rawState: StateTree & PiniaCustomStateProperties<StateTree>,
  existsVal: any,
  replaceReadonlyValueFromOther: boolean
) => {
  const ineResolver = (
    rawState: StateTree & PiniaCustomStateProperties<StateTree>,
    existsVal: any
  ) => {
    for (const key of Object.keys(existsVal)) {
      // 是否为响应式数据
      if (isProxy(rawState[key]) || isReadonly(rawState[key])) {
        if (!isReadonly(rawState[key])) {
          ineResolver(rawState[key], existsVal[key]);
        } else {
          // 是否处理重新设置 readonly 的代理属性
          if (replaceReadonlyValueFromOther) {
            // 此 readOnly 是一个浅响应对象
            if (isShallow(rawState[key])) {
              rawState[key] = shallowReadonly(existsVal[key]);
            } else {
              // 普通只读响应对象
              rawState[key] = readonly(existsVal[key]);
            }
          }
        }
      } else {
        rawState[key] = existsVal[key];
      }
    }
  };

  ineResolver(rawState, existsVal);
};
