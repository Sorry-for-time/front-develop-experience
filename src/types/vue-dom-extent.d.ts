export {};

import type { DraggableDirectiveType } from "@/directives/vDraggable";
declare module "vue" {
  interface ComponentCustomOptions {}

  /**
   * 拓展自定义 directive 全局类型提示
   */
  interface ComponentCustomProperties {
    vDraggable: DraggableDirectiveType;
  }

  interface ComponentOptions<V extends Vue> {}
}
