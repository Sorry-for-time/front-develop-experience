import { useContentList, type ContentType } from "@/stores/useContentList";
import type { VueClassCompHook } from "@/types/type-util";
import {
  Subscription,
  debounceTime,
  distinctUntilChanged,
  filter,
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
  Vanilla,
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

  /**
   * 搜索行为订阅
   */
  private highlightSearchSub!: Subscription;

  private itemSelectedListenSub!: Subscription;

  private _selectedIndex: number = -1;

  @Vanilla
  public get selectedIndex(): number {
    return this._selectedIndex;
  }

  mounted() {
    /*
      when display list has content, and user use arrowUp, arrowDown or Enter keyboard,
      set the item highlight and open the link in new page
    */
    this.itemSelectedListenSub = fromEvent<KeyboardEvent>(
      document.body,
      "keyup"
    )
      .pipe(
        tap((kv) => kv.preventDefault()),
        filter(() => this.displayList.length > 0),
        switchMap((e) => of(e))
      )
      .subscribe((keyupEv) => {
        if (this.searchLoading) {
          return;
        }

        switch (keyupEv.key) {
          case "ArrowUp":
            if (this._selectedIndex > 0) {
              --this._selectedIndex;
              this.inputDom.blur();
            }
            break;
          case "ArrowDown":
            if (this._selectedIndex < this.displayList.length - 1) {
              ++this._selectedIndex;
              this.inputDom.blur();
            }
            break;
          case "Escape":
            this._selectedIndex = -1;
            this.inputDom.focus();
            break;
          case "Enter":
            if (
              this._selectedIndex >= 0 &&
              this.selectedIndex <= this.displayList.length - 1
            ) {
              window.open(
                this.displayList[this._selectedIndex].data.link,
                "_blank"
              );
            }
            break;
          default:
            break;
        }
      });

    this.highlightSearchSub = fromEvent<InputEvent>(this.inputDom, "input")
      .pipe(
        tap(() => (this.searchLoading = true)),
        map((event) => (event.target as HTMLInputElement).value.trim()),
        debounceTime(this.flushWait),
        tap(() => {
          this.searchLoading = false;
        }),
        distinctUntilChanged(),
        switchMap((keyword) => of(keyword))
      )
      .subscribe((keyword) => {
        this._selectedIndex = -1;
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
    // clean up
    if (this.highlightSearchSub) {
      this.highlightSearchSub.unsubscribe();
    }
    if (this.itemSelectedListenSub) {
      this.itemSelectedListenSub.unsubscribe();
    }
  }
}

export { SearchHighlightListBase };
export default toNative(SearchHighlightListBase);
