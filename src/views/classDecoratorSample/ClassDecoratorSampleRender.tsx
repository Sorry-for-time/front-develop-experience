import { TransitionGroup } from "vue";
import { type ClassDecoratorSample } from "./ClassDecoratorSample";
import style from "./ClassDecoratorSample.module.scss";

const ClassDecoratorSampleTemplate = (
  that: ClassDecoratorSample
): JSX.Element => {
  return (
    <div style={{ width: "100%" }}>
      <div class={style["wrapper"]}>
        <button class={["st-btn"]} onClick={that.increment}>
          <span class={style["mark"]}>@UseThrottle(600)</span> ms increment
        </button>
        <span class={style["color-span"]}>{that.count}</span>
        <button class={["st-btn"]} onClick={that.decrement}>
          <span class={style["mark"]}>@UseDebounce(1000)</span> ms decrement
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
        <TransitionGroup tag="ol" name="list">
          {that.listStore.list.map((item) => (
            <li class={style["color-li"]} key={item}>
              {item}
            </li>
          ))}
        </TransitionGroup>
      </div>
    </div>
  );
};

export { ClassDecoratorSampleTemplate };
