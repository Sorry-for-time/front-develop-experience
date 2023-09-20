import listData from "@/assets/data/title.json";
import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import { StoreIdEnum } from "./StoreIdEnum";

export type ContentType = {
  id: number;
  title: string;
  text: string;
};
const useContentList = defineStore(StoreIdEnum.CONTENT_LIST, () => {
  const contentList: Ref<Array<ContentType>> = ref(listData);

  return {
    contentList
  };
});

export { useContentList };
