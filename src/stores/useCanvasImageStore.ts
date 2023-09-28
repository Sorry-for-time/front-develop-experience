import { defineStore } from "pinia";
import { ref, shallowRef, type Ref, type ShallowRef } from "vue";
import { StoreIdEnum } from "./StoreIdEnum";

const useCanvasImageStore = defineStore(
  StoreIdEnum.CANVAS_IMAGE,
  () => {
    const width: Ref<number> = ref(0);
    const height: Ref<number> = ref(0);
    const imageData: ShallowRef<Uint8ClampedArray | undefined> = shallowRef(
      void 0
    );

    const updateImage = (
      imageBuffer: Uint8ClampedArray,
      w: number,
      h: number
    ): void => {
      imageData.value = imageBuffer;
      width.value = w;
      height.value = h;
      console.log("update success");
    };

    return {
      width,
      height,
      imageData,
      updateImage
    };
  },
  {
    persist: {
      storage: "indexedDB",
      persistReadonly: true
    }
  }
);

export { useCanvasImageStore };
