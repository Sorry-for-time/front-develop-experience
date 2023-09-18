import { LineScrollEffect } from "@/effect/LineScrollEffect";
import { CanvasBackGroundSignalPrefix } from "./constant";

export type CanvasWorkerPacket<T = any> = {
  header: CanvasBackGroundSignalPrefix;
  payload?: T;
};

export type ResizeCanvasConfig = {
  width: number;
  height: number;
};

export type OperationFail = {
  description: string;
  reason: any;
};

export type CanvasImageMSG = {
  imageData: Uint8ClampedArray;
  width: number;
  height: number;
};

export class CanvasBackgroundListener {
  #initDone: boolean;
  #canvas!: OffscreenCanvas;
  #ctx!: OffscreenCanvasRenderingContext2D;
  #effect!: LineScrollEffect;
  #listenerFd!: number | void;

  public constructor() {
    this.#initDone = false;
  }

  #init(canvas: OffscreenCanvas) {
    try {
      this.#canvas = canvas;
      const isPc: boolean = self.navigator.platform.includes("x86");

      this.#ctx = this.#canvas.getContext("2d", {
        alpha: true,
        // 判断平台是否为移动端
        willReadFrequently: isPc,
        desynchronized: true
      })!;

      // canvas settings
      this.#ctx.fillStyle = "white";
      this.#ctx.strokeStyle = "white";
      this.#ctx.lineWidth = 1;

      this.#effect = new LineScrollEffect(this.#canvas);
      const animateFn = () => {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        this.#effect.render(this.#ctx);
        this.#listenerFd = requestAnimationFrame(animateFn);
      };
      animateFn();

      this.#initDone = true;
      const initSuccessPacket: CanvasWorkerPacket = {
        header: CanvasBackGroundSignalPrefix.INIT_SUCCESS
      };
      self.postMessage(initSuccessPacket);
    } catch (reason) {
      const initFailPacket: CanvasWorkerPacket<OperationFail> = {
        header: CanvasBackGroundSignalPrefix.INIT_FAIL,
        payload: {
          description: `can not init config`,
          reason
        }
      };
      self.postMessage(initFailPacket);
    }
  }

  #getImageMSG() {
    try {
      if (!this.#initDone) {
        throw new TypeError("you should init config before other operations!");
      }
      const { width, height, data } = this.#ctx.getImageData(
        0,
        0,
        this.#canvas.width,
        this.#canvas.height
      );
      const getImageDataSuccessPacket: CanvasWorkerPacket<CanvasImageMSG> = {
        header: CanvasBackGroundSignalPrefix.GET_IMAGE_SUCCESS,
        payload: {
          imageData: data,
          width,
          height
        }
      };
      self.postMessage(getImageDataSuccessPacket, {
        transfer: [data.buffer]
      });
    } catch (reason) {
      console.error(reason);
      const getImageDataFailPacket: CanvasWorkerPacket<OperationFail> = {
        header: CanvasBackGroundSignalPrefix.GET_IMAGE_FAIL,
        payload: {
          description: "can not get canvas-image",
          reason
        }
      };

      self.postMessage(getImageDataFailPacket);
    }
  }
  #resize(width: number, height: number) {
    try {
      if (!this.#initDone) {
        throw new TypeError("you should init config before other operations!");
      }
      if (width > 0 && height > 0) {
        this.#effect.resize(width, height);
      }
    } catch (reason) {
      console.error(reason);
    }
  }

  #stop(): void {
    try {
      if (!this.#initDone) {
        throw new TypeError("you should init config before other operations!");
      }
      if (typeof this.#listenerFd === "number") {
        cancelAnimationFrame(this.#listenerFd);
      }
      self.removeEventListener("message", this.#messageHandler);
      const stopSuccessPacket: CanvasWorkerPacket = {
        header: CanvasBackGroundSignalPrefix.STOP_SUCCESS
      };
      self.postMessage(stopSuccessPacket);
    } catch (reason) {
      console.error(reason);
      const stopFailPacket: CanvasWorkerPacket<OperationFail> = {
        header: CanvasBackGroundSignalPrefix.STOP_FAIL,
        payload: {
          description: "can not stop worker event",
          reason
        }
      };
      self.postMessage(stopFailPacket);
    }
  }

  #messageHandler = ({ data }: MessageEvent<CanvasWorkerPacket>) => {
    switch (data.header) {
      case CanvasBackGroundSignalPrefix.INIT:
        this.#init(data.payload);
        break;
      case CanvasBackGroundSignalPrefix.GET_IMAGE_MSG:
        this.#getImageMSG();
        break;
      case CanvasBackGroundSignalPrefix.RESIZE:
        const { width, height } = data.payload as ResizeCanvasConfig;
        this.#resize(width, height);
        break;
      case CanvasBackGroundSignalPrefix.STOP:
        this.#stop();
        break;
      default:
        break;
    }
  };

  public listen() {
    self.addEventListener("message", this.#messageHandler);
  }
}
