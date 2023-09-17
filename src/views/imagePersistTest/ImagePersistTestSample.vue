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
import { onMounted, ref } from "vue";

const canvasImageStore = useCanvasImageStore();
const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (canvas.value) {
    const offscreenCanvas = canvas.value.transferControlToOffscreen();
    const offsetCtx = offscreenCanvas.getContext("2d")!;

    if (canvasImageStore.imageData) {
      const { width, height, imageData } = canvasImageStore;
      const newImageData = new ImageData(imageData!, width, height);
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      offsetCtx.clearRect(0, 0, width, height);
      offsetCtx.putImageData(newImageData, 0, 0);
    }

    canvasImageStore.$subscribe((_, { width, height, imageData }) => {
      queueMicrotask(() => {
        const newImageData = new ImageData(imageData!, width, height);
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        offsetCtx.clearRect(0, 0, width, height);
        offsetCtx.putImageData(newImageData, 0, 0);
      });
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
