import { LineScrollEffect } from "@/effect/LineScrollEffect";

export type InitConfig = {
  canvas: OffscreenCanvas;
  width: number;
  height: number;
};
export type OperationSignal = "terminate";

type ReceiveType = {
  data: InitConfig | OperationSignal;
};

/**
 * 绘制实例
 */
let lineScrollEffect: LineScrollEffect;
/**
 * 动画记录 id
 */
let listenerFd: number | undefined;
/**
 * 离线绘制上下文
 */
let offsetScreenCtx: OffscreenCanvasRenderingContext2D;

self.onmessage = ({ data }: { data: ReceiveType }) => {
  if (typeof data === "object" && !!data) {
    if ((data as any).canvas instanceof OffscreenCanvas) {
      const { canvas } = data as unknown as InitConfig;
      offsetScreenCtx = canvas.getContext("2d")!;
      // canvas settings
      offsetScreenCtx.fillStyle = "white";
      offsetScreenCtx.strokeStyle = "white";
      offsetScreenCtx.lineWidth = 1;
      console.log(
        offsetScreenCtx.imageSmoothingQuality,
        offsetScreenCtx.imageSmoothingEnabled,
        offsetScreenCtx.globalAlpha
      );
      lineScrollEffect = new LineScrollEffect(canvas);
      const animate = () => {
        offsetScreenCtx.clearRect(0, 0, canvas.width, canvas.height);
        lineScrollEffect.render(offsetScreenCtx);
        // 更新动画记录
        listenerFd = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (lineScrollEffect instanceof LineScrollEffect) {
        if (offsetScreenCtx instanceof OffscreenCanvasRenderingContext2D) {
          const { width, height } = data as unknown as InitConfig;
          lineScrollEffect.resize(width, height);
          offsetScreenCtx.clearRect(0, 0, width, height);
        } else {
          throw new Error("the render ctx doesn't exists!");
        }
      }
    }
  } else {
    if (lineScrollEffect instanceof LineScrollEffect) {
      switch (data as OperationSignal) {
        case "terminate":
          console.log("check listenerFd");
          if (typeof listenerFd === "number") {
            cancelAnimationFrame(listenerFd);
            console.log("cancel animation!");
            self.postMessage(0);
          }
          break;
        default:
          break;
      }
    }
  }
};
