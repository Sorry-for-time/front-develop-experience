import { defineStore } from "pinia";
import { StoreIdEnum } from "./StoreIdEnum";

const useListStore = defineStore(StoreIdEnum.LIST, {
  state() {
    return {
      list: [1, 2, 3, 4]
    };
  }
});

export { useListStore };
