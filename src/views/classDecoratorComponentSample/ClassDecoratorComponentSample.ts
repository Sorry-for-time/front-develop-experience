import { Aspect } from "@/decorators/aop";
import { UseDebounce, UseThrottle } from "@/decorators/performanceUtil";
import { pluginStatus } from "@/main";
import { useCounterStore } from "@/stores/useCounter";
import { useListStore } from "@/stores/useListStore";
import type { VueClassCompHook } from "@/types/type-util";
import { Component, Setup, Vue, toNative } from "vue-facing-decorator";
import { ClassSampleDecoratorRender } from "./ClassDecoratorSampleRender";

@Component({
  name: "ClassDecoratorSample",
  render: ClassSampleDecoratorRender
})
class ClassDecoratorSample extends Vue implements VueClassCompHook {
  @Setup(() => useListStore())
  public readonly listStore!: ReturnType<typeof useListStore>;

  @Setup(() => useCounterStore())
  public readonly counterStore!: ReturnType<typeof useCounterStore>;

  public get count() {
    return this.counterStore.count;
  }

  public get hintStr() {
    return this._hint();
  }

  @UseThrottle(600)
  public increment(): void {
    this.counterStore.count++;
    const list = this.listStore.list;
    list.splice(Math.floor(Math.random() * list.length), 0, Math.random());
  }

  @UseDebounce(1000)
  @Aspect({
    before: () => console.log("decrement before"),
    after: () => console.log("decrement after"),
    finally: () => console.log("decrement finally")
  })
  public decrement(): void {
    this.counterStore.count--;
    const list = this.listStore.list;
    list.splice(Math.floor(Math.random() * list.length), 1);
  }

  @Aspect({
    after: (res: number) =>
      (() => {
        let str: string = "";
        switch (true) {
          case res > 0:
            str = "A positive number";
            break;
          case res < 0:
            str = "A negative number";
            break;
          case res === 0:
            str = "A split point between positive and negative";
            break;
          default:
            str = "That not a number";
            break;
        }
        return str;
      })(),
    finally: () => console.log("THE WORLD WILL BE GOOD")
  })
  private _hint() {
    return this.count;
  }

  mounted(): void {
    setTimeout(() => {
      console.log(pluginStatus);
    }, 1000);
  }
}
export { ClassDecoratorSample };
export default toNative(ClassDecoratorSample);
