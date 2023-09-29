import { nanoid } from "nanoid";
import {
  Transition,
  TransitionGroup,
  defineComponent,
  ref,
  type Ref
} from "vue";
import style from "./GrammarSample.module.scss";

type Item = {
  key: string;
  value: string;
};

const createItem = (): Item => {
  const uid: string = nanoid(8);
  return {
    key: uid,
    value: uid
  };
};

const GrammarSample = defineComponent({
  name: "GrammarSample",
  setup() {
    const list: Ref<Array<Item>> = ref([]);
    for (let i: number = 0; i < 3; i++) {
      list.value.push(createItem());
    }

    const imgList: Array<string> = Array.from(
      (function* () {
        for (let i: number = 1; i <= 4; ++i) {
          yield `/img/${i}.jpg`;
        }
      })()
    );

    const imgIndex: Ref<number> = ref(0);

    /**
     * 切换图片索引
     */
    const changeImg: VoidFunction = (): void => {
      const current: number = imgIndex.value;
      imgIndex.value = (current + 1) % imgList.length;
    };

    const score: Ref<number> = ref(0);

    return {
      text: ref(""),
      list: list,
      imgIndex: imgIndex,
      imgList: imgList,
      changeImg: changeImg,
      score: score
    };
  },
  render(): JSX.Element {
    return (
      <div class={style["sample-wrapper"]}>
        <section>
          <input
            style={{
              margin: "5px"
            }}
            class={["st-input"]}
            type="text"
            v-model={this.text}
          />
          <h5 style={{ marginLeft: "10px" }}>
            {this.text.trim().length > 0
              ? "输入框的值为: " + this.text.trim()
              : "当前输入框为空..."}
          </h5>
          <br />
          <button
            style={{
              margin: "5px"
            }}
            class={["st-btn"]}
            onClick={() => {
              const len: number = this.list.length;
              this.list.splice(
                Math.floor(Math.random() * len),
                0,
                createItem()
              );
            }}
          >
            添加在任意位置
          </button>
          <button
            style={{
              margin: "5px"
            }}
            class={["st-btn"]}
            onClick={() => {
              const len: number = this.list.length;
              this.list.splice(Math.floor(Math.random() * len), 1);
            }}
          >
            任意删除一个位置
          </button>
          <ul class={style["ul-list"]}>
            <TransitionGroup name="list">
              {this.list.map((item) => (
                <li class={["color-text-container"]} key={item.key}>
                  <div class={["stroked", "color-panel"]}>{item.value}</div>
                  <div class={["fill-fade", "color-panel"]}>{item.value}</div>
                </li>
              ))}
            </TransitionGroup>
          </ul>
        </section>

        <section>
          <button
            style={{
              marginTop: "5px"
            }}
            class={["st-btn"]}
            onClick={this.changeImg}
          >
            切换图片
          </button>

          <br />
          <Transition name="list">
            <img
              class={style["img-transition"]}
              src={this.imgList[this.imgIndex]}
              style={{
                width: "80%",
                marginTop: "10px"
              }}
            />
          </Transition>
        </section>

        <section>
          <input
            style={{ margin: "5px 0" }}
            type="number"
            v-model={this.score}
            class={["st-input"]}
          />
          <h1>
            {((): string => {
              let str: string = "";
              switch (true) {
                case this.score >= 90:
                  str = "优秀";
                  break;
                case this.score >= 75:
                  str = "良好";
                  break;
                case this.score >= 60:
                  str = "良好";
                  break;
                default:
                  str = "不及格";
                  break;
              }
              return str;
            })()}
          </h1>
        </section>
      </div>
    );
  }
});

export { GrammarSample };
export default GrammarSample;
