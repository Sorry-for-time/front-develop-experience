import { defineStore } from "pinia";
import { StoreIdEnum } from "./StoreIdEnum";

const useCounterStore = defineStore(StoreIdEnum.COUNTER, {
  state() {
    return {
      count: 0
    };
  }
});

export { useCounterStore };
