import { useContentList, type ContentType } from "@/stores/useContentList";
import type { VueClassCompHook } from "@/types/type-util";
import {
  Subscription,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  of,
  switchMap,
  tap
} from "rxjs";
import {
  Component,
  Prop,
  Ref,
  Setup,
  TSX,
  Vue,
  toNative
} from "vue-facing-decorator";
import { ListTemplateRender } from "./TemplateRender";

export type WordSplitType = {
  keyword: string;
  record: {
    titleStartIdx: number;
    textStartIdx: number;
  };
  data: ContentType;
};

type ListCompProps = {
  flushWait: number;
};

@Component({ name: "SearchHighlightList", render: ListTemplateRender })
class SearchHighlightListBase
  extends TSX<ListCompProps>()(Vue)
  implements VueClassCompHook
{
  @Setup(() => useContentList())
  private readonly contentListStore!: ReturnType<typeof useContentList>;

  /**
   * 搜索结果展示列表
   */
  public displayList: Array<WordSplitType> = [];

  /**
   * 是否正在进行搜索
   */
  public searchLoading: boolean = false;

  @Prop({
    type: Number,
    default: 1000,
    validator: (value) => !(typeof value !== "number" || value < 0)
  })
  private readonly flushWait!: number;

  @Ref("input")
  private readonly inputDom!: HTMLDivElement;

  private subscription!: Subscription;

  mounted() {
    this.subscription = fromEvent<InputEvent>(this.inputDom, "input")
      .pipe(
        tap(() => (this.searchLoading = true)),
        map((event) => (event.target as HTMLInputElement).value.trim()),
        debounceTime(this.flushWait),
        distinctUntilChanged(),
        switchMap((keyword) => of(keyword))
      )
      .subscribe((keyword) => {
        this.searchLoading = false;
        this.displayList = this.contentListStore.contentList
          .filter(() => keyword.length > 0)
          .map((item) => {
            const back: WordSplitType = {
              keyword,
              record: {
                titleStartIdx: item.title
                  .trim()
                  .toLowerCase()
                  .indexOf(keyword.toLowerCase()),
                textStartIdx: item.text
                  .trim()
                  .toLowerCase()
                  .indexOf(keyword.toLowerCase())
              },
              data: item
            };
            return back;
          })
          .filter(
            ({ record }) =>
              record.titleStartIdx >= 0 || record.textStartIdx >= 0
          );
      });
  }

  unmounted(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

export { SearchHighlightListBase };
export default toNative(SearchHighlightListBase);
