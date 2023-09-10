import type { Directive, DirectiveBinding } from "vue";

type DraggableDirectiveType = Partial<{
  activeClass: string | Array<string>;
  /**
   * 是否根据默认设置的 data-x, dada-y 应用默认元素位置
   */
  usePosition: boolean;
  /**
   * 是否将活动元素设置顶层显示
   */
  activePriority: boolean;
}>;

const vDraggable: Directive<HTMLElement, DraggableDirectiveType> & {
  listener: ((...args: Array<any>) => void) | undefined;
  wrapperFunc: (
    el: HTMLElement,
    binding: DirectiveBinding<DraggableDirectiveType>
  ) => void;
} = {
  listener: void 0,
  wrapperFunc: (el: HTMLElement, binding): void => {
    // 获取所有
    const matched: Array<HTMLElement> = Array.from(
      el.querySelectorAll("[data-draggable]")
    );
    if (binding.modifiers.usePosition) {
      for (const item of matched) {
        let eX: number = 0;
        let eY: number = 0;
        if ("x" in item.dataset) {
          eX = Number.parseInt(item.dataset.x!);
        }
        if ("y" in item.dataset) {
          eY = Number.parseInt(item.dataset.y!);
        }
        item.style.cssText = `transform: translate3d(${eX}px, ${eY}px, 1px)`;
      }
    }
    const eventHandler = (ev: PointerEvent): void => {
      const target = ev.target as HTMLElement;
      const startX: number = ev.clientX; /* 拖拽起始 x 轴 */
      const startY: number = ev.clientY; /* 拖拽起始 y 轴 */

      if (matched.includes(target)) {
        const containerRect: DOMRect = el.getBoundingClientRect();
        if (binding.modifiers.setPriority) {
          el.appendChild(target);
        }
        if (binding.value.activeClass) {
          if (Array.isArray(binding.value.activeClass)) {
            for (const item of binding.value.activeClass) {
              target.classList.add(item);
            }
          } else {
            target.classList.add(binding.value.activeClass);
          }
        }
        /**
         * 记录容器的宽高值
         */
        const containerUnits = {
          offsetWidth: el.offsetWidth,
          offsetHeight: el.offsetHeight,
          offsetLeft: containerRect.left,
          offsetTop: containerRect.top
        };

        let dataX: number = 0;
        let dataY: number = 0;

        if ("x" in target.dataset) {
          dataX = Number.parseInt(target.dataset.x!);
        }
        if ("y" in target.dataset) {
          dataY = Number.parseInt(target.dataset.y!);
        }

        let updateX: number;
        let updateY: number;

        const move = (mv: PointerEvent): void => {
          updateX = mv.clientX - startX + dataX;
          updateY = mv.clientY - startY + dataY;
          if (updateY >= containerUnits.offsetHeight - target.offsetHeight) {
            updateY = containerUnits.offsetHeight - target.offsetHeight;
          }
          if (updateY <= 0) {
            updateY = 0;
          }
          if (updateX >= containerUnits.offsetWidth - target.offsetWidth) {
            updateX = containerUnits.offsetWidth - target.offsetWidth;
          }
          if (updateX <= 0) {
            updateX = 0;
          }
          target.dataset.x = `${updateX}`;
          target.dataset.y = `${updateY}`;
          target.style.cssText = `transform: translate3d(${updateX}px, ${updateY}px, 1px)`;
        };
        document.addEventListener("pointermove", move);
        // clean up
        document.addEventListener("pointerup", function mouseUp(): void {
          if (binding.value.activeClass) {
            if (Array.isArray(binding.value.activeClass)) {
              for (const item of binding.value.activeClass) {
                target.classList.remove(item);
              }
            } else {
              target.classList.remove(binding.value.activeClass);
            }
          }
          document.removeEventListener("pointerup", mouseUp);
          document.removeEventListener("pointermove", move);
        });
      }
    };
    vDraggable.listener = eventHandler;
    document.addEventListener("pointerdown", eventHandler);
  },
  mounted: (el: HTMLElement, binding): void => {
    console.log("mounted");
    vDraggable.wrapperFunc(el, binding);
  },
  updated: (el, binding, vnode, prevVnode): void => {
    console.log("updated");
    if (typeof vDraggable.listener === "function") {
      document.removeEventListener("pointerdown", vDraggable.listener);
    }
    vDraggable.wrapperFunc(el, binding);
  },

  beforeUnmount: (el, binding, vnode, prevVnode): void => {
    if (typeof vDraggable.listener === "function") {
      document.removeEventListener("pointerdown", vDraggable.listener);
      console.log("before unmounted");
    }
  },
  unmounted: () => {
    console.log("unmounted");
  }
};

export { vDraggable };
