export {};

import type { MoveableDirectiveType } from "@/directives/vMoveable";
declare module "vue" {
  interface ComponentCustomOptions {}

  /**
   * 拓展自定义 directive 全局类型提示
   */
  interface ComponentCustomProperties {
    /**
     * @description 自定义子元素可拖拽容器指令
     * @argument 支持的修饰述符: {@code `setPriority -- 是否元素被设置激活时置顶显示`, @code `usePosition -- 是否应用自定义属性 data-x, data-y 设置的位置`}
     * @description 需要要求父容器为一个带有 relative css 属性的容器, 且要被进行拖拽的子元素(要求必须是直接子元素)必须添加一个 {@code {data-draggable}} 自定义属性,
     * @description 且使用指令会对被标记的子元素添加 {@code data-x, data-y} 自定义属性以记录更新位置, 且会应用默认的属性更新初始布局和新添加元素的布局
     *
     * 使用示例:
     * @example
     * <section
     *   style="position: relative"
     *   v-moveable.setPriority.usePosition="{
     *     activeClass: ['active', 'active-hint']
     *   }"
     * >
     *   <span
     *     data-draggable
     *     class="moveable-item"
     *     v-for="item of list"
     *     :key="item.id"
     *     :data-x="item.dataX"
     *     :data-y="item.dataY"
     *   >
     *     the {{ item.text }}
     *   </span>
     * </section>
     */
    vMoveable: MoveableDirectiveType;
  }

  interface ComponentOptions<V extends Vue> {}
}
