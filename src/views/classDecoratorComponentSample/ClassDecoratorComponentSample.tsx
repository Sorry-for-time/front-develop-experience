import { Aspect } from "@/decorators/aop";
import { UseDebounce, UseThrottle } from "@/decorators/performanceUtil";
import { useCounterStore } from "@/stores/useCounter";
import { useListStore } from "@/stores/useListStore";
import { TransitionGroup } from "vue";
import { Component, Vue, toNative } from "vue-facing-decorator";
import styled, { ThemeProvider } from "vue3-styled-components";

const counterStore = useCounterStore();
const listStore = useListStore();

const Wrapper = styled.div`
  width: fit-content;
  margin: 40px auto;
`;

const ColorSpan = styled.span`
  border-radius: 5px;
  padding: 5px;
  background-color: #2560ad;
  margin: 0 10px;
  color: white;
`;

const ColorLi = styled.li`
  width: fit-content;
  padding: 3px;
  margin: 5px 0;
  border-radius: 3px;
  box-shadow: 0 0 2px white;
`;

const ClassSampleDecoratorRender = (
  that: ClassDecoratorSample
): JSX.Element => {
  return (
    <ThemeProvider
      style={{
        width: "100%"
      }}
      theme={{}}
    >
      <Wrapper>
        <button class={["st-btn"]} onClick={that.increment}>
          @throttle(600) increment
        </button>
        <ColorSpan>{that.count}</ColorSpan>
        <button class={["st-btn"]} onClick={that.decrement}>
          @debounce(1000ms) decrement
        </button>
        <br />
        <div
          style={{
            fontSize: "30px",
            margin: "10px 0"
          }}
          class={["color-text-container", "hint"]}
        >
          <div class={["color-panel", "stroked"]}>{that.hintStr}</div>
          <div class={["color-pane", "fill-fade"]}>{that.hintStr}</div>
        </div>

        {
          <TransitionGroup tag="ol" name="list">
            {listStore.list.map((item) => (
              <ColorLi key={item}>{item}</ColorLi>
            ))}
          </TransitionGroup>
        }
      </Wrapper>
    </ThemeProvider>
  );
};

@Component({
  name: "ClassDecoratorSample",
  render: ClassSampleDecoratorRender
})
class ClassDecoratorSample extends Vue {
  public get count() {
    return counterStore.count;
  }

  /**
   * this is a computed sample in class component
   */
  public get hintStr() {
    return this._hint();
  }

  @UseThrottle(600)
  public increment(): void {
    counterStore.count++;
    const list = listStore.list;
    list.splice(Math.floor(Math.random() * list.length), 0, Math.random());
  }

  @UseDebounce(1000)
  @Aspect({
    before: () => console.log("decrement before"),
    after: () => console.log("decrement after"),
    finally: () => console.log("decrement finally")
  })
  public decrement(): void {
    counterStore.count--;
    const list = listStore.list;
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
}

export default toNative(ClassDecoratorSample);
