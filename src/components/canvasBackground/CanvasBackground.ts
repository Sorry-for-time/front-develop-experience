import { useCanvasImageStore } from "@/stores/useCanvasImageStore";
import { defineAsyncComponent } from "vue";
import {
  Component,
  Prop,
  Ref,
  Setup,
  TSX,
  Vue,
  toNative
} from "vue-facing-decorator";
import { CanvasBackgroundRender } from "./CanvasBackgroundRender";
import BackgroundAnimationWorker from "./worker//CanvasBackground.worker?worker";
import type {
  CanvasImageMSG,
  CanvasWorkerPacket,
  OperationFail,
  ResizeCanvasConfig
} from "./worker/CanvasBackgroundListener";
import { CanvasBackGroundSignalPrefix } from "./worker/constant";

type CanvasBackgroundBaseProps = {
  flushWait: number;
};

/**
 * 背景组件
 */
@Component({
  name: "CanvasBackground",
  render: CanvasBackgroundRender
})
export class CanvasBackgroundBase extends TSX<CanvasBackgroundBaseProps>()(
  Vue
) {
  @Setup(() => useCanvasImageStore())
  private readonly imageStore!: ReturnType<typeof useCanvasImageStore>;

  @Ref
  private readonly wrapper!: HTMLDivElement;

  @Ref("canvas")
  private readonly originCanvas!: HTMLCanvasElement;

  /**
   * 监听器回调记录
   */
  private viewportResizeListener: (() => void) | undefined;

  /**
   * 专用工背景绘制工作者线程
   */
  private worker!: Worker;

  /**
   * 图象数据传输监听回调
   */
  private imageListen:
    | (({ data }: MessageEvent<CanvasWorkerPacket>) => void)
    | undefined;

  /**
   * 定时器返回 id
   */
  private timer: number | undefined;

  /**
   * 更新 imageStore 数据间隔时间
   */
  @Prop({
    type: Number,
    default: 1000,
    validator: (value: any): boolean => (value >= 1000 ? true : false)
  })
  private readonly flushWait!: number;

  public mounted(): void {
    console.log("mounted!");
    const { clientWidth, clientHeight } = this.wrapper;
    this.originCanvas.width = clientWidth;
    this.originCanvas.height = clientHeight;

    const offsetCanvas: OffscreenCanvas =
      this.originCanvas.transferControlToOffscreen();
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
        }, this.flushWait);

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
          const { clientWidth, clientHeight } = this.wrapper;
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
