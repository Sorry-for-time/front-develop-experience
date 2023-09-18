export const enum BgHeaderEnum {
  INIT = 0,
  INIT_SUCCESS = 1,
  INIT_FAIL = 2,
  FLUSH = 3
}

export type BgPacket<T = any> = {
  header: BgHeaderEnum;
  payload?: T;
};

export type FailDesc<T = any> = {
  description: string;
  reason: T;
};

export type Datatype = {
  buffer: ArrayBuffer;
  width: number;
  height: number;
};

class BackgroundWorker {
  #canvas!: OffscreenCanvas;
  #ctx!: OffscreenCanvasRenderingContext2D;
  #initDone: boolean;

  public constructor() {
    this.#initDone = false;
  }

  #init(canvas: OffscreenCanvas) {
    if (this.#initDone) {
      throw new TypeError("worker already init...");
    }
    try {
      if (canvas instanceof OffscreenCanvas) {
        this.#canvas = canvas;
        this.#ctx = this.#canvas.getContext("2d")!;
        this.#initDone = true;
        const packet: BgPacket = {
          header: BgHeaderEnum.INIT_SUCCESS
        };
        self.postMessage(packet);
      } else {
        throw new TypeError(
          "require a OffscreenCanvas, but receive not accept"
        );
      }
    } catch (reason) {
      console.error(reason);
      const packet: BgPacket<FailDesc> = {
        header: BgHeaderEnum.INIT_FAIL,
        payload: {
          description: "can' not init worker config...",
          reason
        }
      };
      self.postMessage(packet);
    }
  }

  #flushBackground({ buffer, width, height }: Datatype) {
    if (this.#initDone) {
      const imageData = new ImageData(
        new Uint8ClampedArray(buffer),
        width,
        height
      );
      this.#canvas.width = width;
      this.#canvas.height = height;
      this.#ctx.clearRect(0, 0, width, height);
      this.#ctx.putImageData(imageData, 0, 0);
    } else {
      throw new Error("you need init config before other operation");
    }
  }

  #messageHandler = ({ data }: MessageEvent<BgPacket>) =>
    queueMicrotask(() => {
      switch (data.header) {
        case BgHeaderEnum.INIT:
          this.#init(data.payload);
          break;
        case BgHeaderEnum.FLUSH:
          this.#flushBackground(data.payload);
          break;
        default:
          break;
      }
    });

  public listen() {
    self.addEventListener("message", this.#messageHandler);
  }
}

new BackgroundWorker().listen();
