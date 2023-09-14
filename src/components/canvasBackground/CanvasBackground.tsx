import { defineAsyncComponent } from "vue";
import { Component, Vue, toNative } from "vue-facing-decorator";
import style from "./CanvasBackground.module.scss";
import type { InitConfig } from "./CanvasBackground.worker";
import BackgroundAnimationWorker from "./CanvasBackground.worker?worker";

const CanvasBackgroundRender = (that: CanvasBackgroundBase): JSX.Element => {
  return (
    <div class={style["background-canvas-wrapper"]}>
      <div ref="wrapper" class={style["canvas-wrapper"]}>
        <canvas ref="canvas" />
      </div>
    </div>
  );
};

/**
 * 背景组件
 */
@Component({
  name: "CanvasBackground",
  render: CanvasBackgroundRender
})
class CanvasBackgroundBase extends Vue {
  /**
   * 监听器回调记录
   */
  private functor: (() => void) | undefined;
  /**
   * 专用工背景绘制工作者线程
   */
  private worker: Worker | undefined = void 0;

  public mounted(): void {
    console.log("mounted!");
    const originCanvas = this.$refs.canvas as HTMLCanvasElement;
    const wrapper = this.$refs.wrapper as HTMLDivElement;

    const { clientWidth, clientHeight } = wrapper;
    originCanvas.width = clientWidth;
    originCanvas.height = clientHeight;

    const offsetCanvas: OffscreenCanvas =
      originCanvas.transferControlToOffscreen();

    const threadMsgConfig: InitConfig = {
      canvas: offsetCanvas,
      width: wrapper.clientWidth,
      height: wrapper.clientHeight
    };

    this.worker = new BackgroundAnimationWorker();
    // 将离屏绘制画布传递给工作者线程
    this.worker.postMessage(threadMsgConfig, {
      transfer: [offsetCanvas]
    });
    setTimeout(() => {
      console.log(offsetCanvas);
    }, 1000);

    this.functor = (): void => {
      const { clientWidth, clientHeight } = wrapper;
      this.worker!.postMessage({
        width: clientWidth,
        height: clientHeight
      });
    };
    window.visualViewport!.addEventListener("resize", this.functor);
  }

  public beforeUnmount(): void {
    // 清理监听器
    if (this.functor) {
      window.visualViewport!.removeEventListener("resize", this.functor);
    }
    // 清理线程
    this.worker?.terminate();
    console.log("terminate thread-worker!");
  }
}

/**
 * Canvas 动态背景组件
 */
export const CanvasBackground = defineAsyncComponent(async () =>
  toNative(CanvasBackgroundBase)
);
