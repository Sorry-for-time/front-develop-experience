import {
  Subscription,
  animationFrameScheduler,
  filter,
  fromEvent,
  mergeMap,
  queueScheduler,
  takeUntil,
  tap
} from "rxjs";
import { type Directive } from "vue";

type MoveableDirectiveParam = Partial<{
  /**
   * 元素被激活(选中)时施加的样式
   */
  activeClass: string | Array<string>;
}>;

type MoveableDirectiveType = Directive<HTMLElement, MoveableDirectiveParam> & {
  subScription: Subscription | undefined;
  mutationObserver: MutationObserver | undefined;
};

/**
 * 自定义子元素可拖拽容器指令
 * 支持的修饰述符: {@code `setPriority -- 是否元素被设置激活时置顶显示`, @code `usePosition -- 是否应用自定义属性 data-x, data-y 设置的位置`}
 * 需要要求父容器为一个带有 relative css 属性的容器, 且要被进行拖拽的子元素(要求必须是直接子元素)必须添加一个 {@code data-draggable} 自定义属性,
 * 且使用指令会对被标记的子元素添加 {@code data-x, data-y} 自定义属性以记录更新位置, 且会应用默认的属性更新初始布局和新添加元素的布局
 *
 * 使用示例:
 * <section
      style="position: relative"
      v-draggable.setPriority.usePosition="{
        activeClass: ['active', 'active-hint']
      }"
    >
      <span
      data-draggable
        class="moveable-item"
        v-for="item of list"
        :key="item.id"
        :data-x="item.dataX"
        :data-y="item.dataY"
      >
        the {{ item.text }}
      </span>
    </section>
 */
const vMoveable: MoveableDirectiveType = {
  subScription: void 0,
  mutationObserver: void 0,
  mounted: (mountEl: HTMLElement, binding): void => {
    // 尝试恢复已有数据的视图布局(data-x, data-y)
    animationFrameScheduler.schedule(() => {
      const matched: Array<HTMLElement> = Array.from(
        mountEl.querySelectorAll("[data-draggable]")
      ).filter((item) => item instanceof HTMLElement) as HTMLElement[];
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
    });

    // 点击的起始位置记录
    const startBucket = {
      startX: 0,
      startY: 0
    };

    // 容器绝对位置记录
    const containerUnits = {
      offsetWidth: 0,
      offsetHeight: 0,
      offsetLeft: 0,
      offsetTop: 0
    };

    // 应用到元素位置的最终变形位置
    let updateX: number = 0;
    let updateY: number = 0;
    // 记录被选中的合规元素
    let selected: HTMLElement | undefined;

    vMoveable.subScription = fromEvent<PointerEvent>(mountEl, "pointerdown")
      .pipe(
        // 过滤符合条件的子元素(带有 data-draggable 自定义元素 & 必须为 html 元素 & 必须为父容器的直接子元素)
        filter(({ target }) =>
          target instanceof HTMLElement &&
          Array.from(mountEl.children).includes(target)
            ? Object.hasOwn(target.dataset, "draggable")
            : false
        ),
        tap(({ target }) => {
          // 判断是否有设置点击时置顶显示
          if (binding.modifiers.setPriority) {
            const filterList = Array.from(mountEl.children).filter(
              (i) =>
                i instanceof HTMLElement &&
                Object.hasOwn(i.dataset, "draggable")
            );
            // 仅在元素不是末尾元素时才进行 dom 移动操作
            if (filterList[filterList.length - 1] !== (target as HTMLElement)) {
              mountEl.appendChild(target as HTMLElement);
            }
          }
        }),
        // 更新拖拽起始初始信息 -> 只有在上一个事件有返回结果才会流经此处处理
        tap(({ clientX, clientY, target }) => {
          selected = target as HTMLElement;
          // 记录点击起始位置以及容器更新位置
          startBucket.startX = clientX;
          startBucket.startY = clientY;
          // 获取挂载节点(根节点)布局的绝对信息
          const containerRect: DOMRect = mountEl.getBoundingClientRect();
          containerUnits.offsetWidth = mountEl.offsetWidth;
          containerUnits.offsetHeight = mountEl.offsetHeight;
          containerUnits.offsetLeft = containerRect.left;
          containerUnits.offsetTop = containerRect.top;
          // 设置鼠标按时下激活样式
          const receivedClass = binding.value.activeClass;
          if (Array.isArray(receivedClass)) {
            (target as HTMLElement).classList.add(...receivedClass);
          } else if (receivedClass) {
            (target as HTMLElement).classList.add(receivedClass);
          }
        }),
        // 合并移动事件流
        mergeMap(() =>
          fromEvent<PointerEvent>(document.body, "pointermove").pipe(
            // 直到鼠标抬起
            takeUntil(
              fromEvent<PointerEvent>(document.body, "pointerup").pipe(
                // 设置落脚点
                tap(() =>
                  queueScheduler.schedule(() => {
                    // 移除按下鼠标时设置的激活样式
                    const receivedClass = binding.value.activeClass;
                    if (Array.isArray(receivedClass)) {
                      selected!.classList.remove(...receivedClass);
                    } else if (receivedClass) {
                      selected!.classList.remove(receivedClass);
                    }
                    // 保存最后一次活动的记录点
                    selected!.dataset.x = `${updateX}`;
                    selected!.dataset.y = `${updateY}`;
                  })
                )
              )
            )
          )
        )
      )
      .subscribe((ev) =>
        queueScheduler.schedule(() => {
          // 更新移动位置
          const target: HTMLElement = selected!;
          let dataX: number = 0;
          let dataY: number = 0;
          if (Object.hasOwn(target.dataset, "x")) {
            dataX = Number.parseInt(target.dataset.x!);
          }
          if (Object.hasOwn(target.dataset, "y")) {
            dataY = Number.parseInt(target.dataset.y!);
          }
          updateX = ev.clientX - startBucket.startX + dataX;
          updateY = ev.clientY - startBucket.startY + dataY;
          // 判断边界
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
          target.style.cssText = `transform: translate3d(${updateX}px, ${updateY}px, 1px)`;
        })
      );
    if (binding.modifiers.usePosition) {
      const mutationObserver = new MutationObserver((mutations) => {
        const nodeList = Array.from(
          mountEl.querySelectorAll("[data-draggable]")
        );
        mutations
          .filter((mutation) => mutation.addedNodes.length > 0)
          .map((mutation) => Array.from(mutation.addedNodes))
          .flat(1)
          .filter(
            (node) => node instanceof HTMLElement && nodeList.includes(node)
          )
          .forEach((i) => {
            const item = i as HTMLElement;
            let eX: number = 0;
            let eY: number = 0;
            if ("x" in item.dataset) {
              eX = Number.parseInt(item.dataset.x!);
            }
            if ("y" in item.dataset) {
              eY = Number.parseInt(item.dataset.y!);
            }
            item.style.cssText = `transform: translate3d(${eX}px, ${eY}px, 1px)`;
          });
      });
      vMoveable.mutationObserver = mutationObserver;
      mutationObserver.observe(mountEl, {
        subtree: false,
        attributes: false,
        childList: true
      });
    }
  },
  beforeUnmount: () => {
    // clean up
    if (vMoveable.subScription) {
      vMoveable.subScription.unsubscribe();
    }
    if (vMoveable.mutationObserver) {
      vMoveable.mutationObserver.disconnect();
    }
  }
};

export { vMoveable };
export type { MoveableDirectiveParam, MoveableDirectiveType };
