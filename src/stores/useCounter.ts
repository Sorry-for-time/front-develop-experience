import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { StoreIdEnum } from "@/stores/StoreIDEnum";

const useCounterStore = defineStore(StoreIdEnum.COUNTER, () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  const increment: VoidFunction = () => {
    count.value++;
  };

  return { count, doubleCount, increment };
});

export { useCounterStore };
