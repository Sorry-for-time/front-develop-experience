import { Aspect } from "@/decorators/aop";
import { UseDebounce, UseThrottle } from "@/decorators/performanceUtil";
import { Component, Vue, toNative } from "vue-facing-decorator";
import styled, { ThemeProvider } from "vue3-styled-components";

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
          throttle increment(600ms)
        </button>
        <ColorSpan>{that.count}</ColorSpan>
        <button class={["st-btn"]} onClick={that.decrement}>
          debounce decrement(1000ms)
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
      </Wrapper>
    </ThemeProvider>
  );
};

@Component({
  name: "ClassDecoratorSample",
  render: ClassSampleDecoratorRender
})
class ClassDecoratorSample extends Vue {
  public count: number = 0;

  @UseThrottle(600)
  public increment(): void {
    this.count++;
  }

  /**
   * this is a computed sample in class component
   */
  public get hintStr() {
    return this._hint();
  }

  @UseDebounce(1000)
  @Aspect({
    before: () => console.log("before"),
    after: () => console.log("after"),
    finally: () => console.log("finally")
  })
  public decrement(): void {
    this.count--;
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
