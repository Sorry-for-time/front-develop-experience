import { defineStore } from "pinia";
import {
  computed,
  reactive,
  readonly,
  ref,
  shallowReadonly,
  shallowRef
} from "vue";
import { StoreIdEnum } from "./StoreIdEnum";

const useListStore = defineStore(StoreIdEnum.LIST, () => {
  const list = ref<Array<number>>([]);
  const updateList = () => [];
  const listComputed = computed(() => list.value);
  return {
    list,
    listComputed,
    updateList,
    deepRef: ref({
      list: [
        [1, 2, 3],
        ["a", "bc"],
        shallowRef([12, 222]),
        readonly({ some: "readonly" }),
        shallowReadonly({ p: 233 }),
        reactive([
          1,
          2,
          3,
          shallowReadonly({
            xxx: "fff"
          })
        ]),
        readonly({ num: 23 }),
        ref("1")
      ]
    })
  };
});

export { useListStore };
