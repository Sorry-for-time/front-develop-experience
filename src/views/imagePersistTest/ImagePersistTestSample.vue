<template>
  <div class="image-persist-sample-wrapper">
    <div class="limit-wrapper">
      <h1 style="font-weight: bolder" class="color-text">
        Load Binary-data(Uint8ClampedArray) From Local(IndexedDB)
      </h1>
      <canvas ref="canvas" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCanvasImageStore } from "@/stores/useCanvasImageStore";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { BgHeaderEnum, type BgPacket, type Datatype } from "./backgroundWorker";
import BackGroundWorker from "./backgroundWorker?worker";

const canvasImageStore = useCanvasImageStore();
const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (canvas.value) {
    const worker = new BackGroundWorker();

    const updater: VoidFunction = (): void => {
      const { width, height, imageData } = canvasImageStore;
      const buffer: ArrayBufferLike = imageData!.buffer;
      const packet: BgPacket<Datatype> = {
        header: BgHeaderEnum.FLUSH,
        payload: {
          buffer,
          width,
          height
        }
      };
      worker.postMessage(packet, {
        transfer: [buffer]
      });
    };

    // clean up
    onBeforeUnmount(() => {
      worker.terminate();
    });
    // 子线程离线渲染初始化配置
    const initConfig: BgPacket<OffscreenCanvas> = {
      header: BgHeaderEnum.INIT,
      payload: canvas.value.transferControlToOffscreen()
    };
    // 初始化
    Promise.resolve(initConfig)
      .then((res) => {
        worker.postMessage(res, {
          transfer: [res.payload!]
        });

        return new Promise((resolve, reject) => {
          const initReport = ({ data }: MessageEvent<BgPacket>) => {
            if (data.header === BgHeaderEnum.INIT_SUCCESS) {
              resolve(void 0);
            } else if (data.header === BgHeaderEnum.INIT_FAIL) {
              reject(data.payload);
            } else {
              // un-know error
              reject(data);
            }
            // remove listener
            worker.removeEventListener("message", initReport);
          };
          // set up listener to wait message
          worker.addEventListener("message", initReport);
        });
      })
      .then(() => {
        // load persist data if exists
        if (canvasImageStore.imageData instanceof Uint8ClampedArray) {
          updater();
        }
      })
      .then(() => {
        // watch data update && send flush signal to webWorker to re-render
        canvasImageStore.$subscribe((): void => queueMicrotask(updater));
      })
      .catch(console.error)
      .finally(() => {
        console.log("image-persist-test-sample component scheduling done...");
      });
  }
});
</script>

<style lang="scss" scoped>
.image-persist-sample-wrapper {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

.limit-wrapper {
  margin: 20px auto;
  width: 60%;
  padding: 40px;
  border-radius: 5px;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 3px white;
  overflow: hidden;

  canvas {
    width: 100%;
    border: 1px solid white;
    border-radius: 5px;
  }
}
</style>
