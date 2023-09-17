import { useCanvasImageStore } from "@/stores/useCanvasImageStore";
import { defineAsyncComponent } from "vue";
import { Component, Vue, toNative } from "vue-facing-decorator";
import style from "./CanvasBackground.module.scss";
import BackgroundAnimationWorker from "./CanvasBackground.worker?worker";
import type {
  CanvasImageMSG,
  CanvasWorkerPacket,
  OperationFail,
  ResizeCanvasConfig
} from "./worker/CanvasBackgroundListener";
import { CanvasBackGroundSignalPrefix } from "./worker/constant";

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
  private imageStore = useCanvasImageStore();
  /**
   * 监听器回调记录
   */
  private viewportResizeListener: (() => void) | undefined;
  /**
   * 专用工背景绘制工作者线程
   */
  private worker!: Worker;
  private imageListen:
    | (({ data }: MessageEvent<CanvasWorkerPacket>) => void)
    | undefined;
  private timer: number | undefined;

  public mounted(): void {
    console.log("mounted!");
    const originCanvas = this.$refs.canvas as HTMLCanvasElement;
    const wrapper = this.$refs.wrapper as HTMLDivElement;

    const { clientWidth, clientHeight } = wrapper;
    originCanvas.width = clientWidth;
    originCanvas.height = clientHeight;

    const offsetCanvas: OffscreenCanvas =
      originCanvas.transferControlToOffscreen();
    this.worker = new BackgroundAnimationWorker();

    Promise.resolve(offsetCanvas)
      .then((res) => {
        const initConfigPacket: CanvasWorkerPacket<OffscreenCanvas> = {
          header: CanvasBackGroundSignalPrefix.INIT,
          payload: res
        };
        this.worker.postMessage(initConfigPacket, {
          transfer: [res]
        });
        const worker = this.worker;
        return new Promise((resolve, reject) => {
          this.worker.addEventListener(
            "message",
            function initListener({ data }: MessageEvent<CanvasWorkerPacket>) {
              if (data.header === CanvasBackGroundSignalPrefix.INIT_SUCCESS) {
                resolve(void 0);
              } else if (
                data.header === CanvasBackGroundSignalPrefix.INIT_FAIL
              ) {
                reject(data.payload as OperationFail);
              }
              worker.removeEventListener("message", initListener);
            }
          );
        });
      })
      .then(() => {
        const { worker, imageStore } = this;

        const requestImagDataPacket: CanvasWorkerPacket = {
          header: CanvasBackGroundSignalPrefix.GET_IMAGE_MSG
        };
        this.timer = setInterval(() => {
          worker.postMessage(requestImagDataPacket);
        }, 1000);

        this.imageListen = ({ data }: MessageEvent<CanvasWorkerPacket>) => {
          if (data.header === CanvasBackGroundSignalPrefix.GET_IMAGE_SUCCESS) {
            const { width, height, buffer } = data.payload as CanvasImageMSG;
            imageStore.updateImage(buffer, width, height);
          } else if (
            data.header === CanvasBackGroundSignalPrefix.GET_IMAGE_FAIL
          ) {
            console.warn(data.payload);
          }
        };
        worker.addEventListener("message", this.imageListen);

        this.viewportResizeListener = (): void => {
          const { clientWidth, clientHeight } = wrapper;
          const resizeConfigPacket: CanvasWorkerPacket<ResizeCanvasConfig> = {
            header: CanvasBackGroundSignalPrefix.RESIZE,
            payload: {
              width: clientWidth,
              height: clientHeight
            }
          };
          this.worker.postMessage(resizeConfigPacket);
        };

        window.visualViewport!.addEventListener(
          "resize",
          this.viewportResizeListener
        );
      })
      .catch((reason) => {
        console.warn(reason);
      })
      .finally(() => {
        console.log("component schedule done");
      });
  }

  public beforeUnmount(): void {
    // 清理监听器
    if (this.viewportResizeListener) {
      window.visualViewport!.removeEventListener(
        "resize",
        this.viewportResizeListener
      );
    }
    if (this.timer) {
      clearInterval(this.timer);
    }

    if (this.worker) {
      const stopEventPacket: CanvasWorkerPacket = {
        header: CanvasBackGroundSignalPrefix.STOP
      };

      const { worker } = this;
      Promise.resolve(stopEventPacket)
        .then((res) => {
          // 发送动画清理信号
          this.worker.postMessage(res);
          return new Promise((resolve, reject) => {
            this.worker.addEventListener(
              "message",
              function stopListener({
                data
              }: MessageEvent<CanvasWorkerPacket>) {
                if (data.header === CanvasBackGroundSignalPrefix.STOP_SUCCESS) {
                  resolve(void 0);
                  // 终止线程
                  console.log("terminate thread-worker success");
                } else if (
                  data.header === CanvasBackGroundSignalPrefix.STOP_FAIL
                ) {
                  reject(data.payload as OperationFail);
                }
              }
            );
          });
        })
        .catch((reason) => {
          console.warn(reason);
        })
        .finally(() => {
          if (this.imageListen) {
            worker.removeEventListener("message", this.imageListen);
          }
          worker.terminate();
          console.log("component unmount schedule done...");
        });
    }
  }
}

/**
 * Canvas 动态背景组件
 */
export const CanvasBackground = defineAsyncComponent(async () =>
  toNative(CanvasBackgroundBase)
);
