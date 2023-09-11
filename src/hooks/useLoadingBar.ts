import { LoadingBar } from "@/components/loadingBar/LoadingBar";
import { createVNode, render } from "vue";

/**
 * 操作函数名称映射
 */
type LoadingBarHook = {
  start: () => Promise<void>;
  finish: () => Promise<void>;
  error: () => Promise<void>;
};

/**
 * 创建 loading-bar 组件
 *
 * @param container 挂载点
 * @returns loading-bar 操作函数列表
 */
const useLoadingBar = (container: Element | ShadowRoot): LoadingBarHook => {
  const vNode = createVNode(LoadingBar);
  render(vNode, container);
  const funcs = vNode.component!.exposed as any;

  return {
    start: funcs.start,
    finish: funcs.finish,
    error: funcs.error
  };
};

export { useLoadingBar };
export { type LoadingBarHook }
