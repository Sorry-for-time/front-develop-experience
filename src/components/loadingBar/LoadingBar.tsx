import { defineComponent, ref, Transition, type Ref } from "vue";
import style from "./LoadingBar.module.scss";

type LoadingStatus = "loading" | "error";
type LoadingProps = {
  status: {
    default: LoadingStatus;
  };
};

const props: Required<LoadingProps> = {
  status: {
    default: "loading"
  }
};

/**
 * 加载进度条组件
 */
const LoadingBar = defineComponent({
  name: "LoadingBar",
  props: {
    /**
     * 默认的加载延迟
     */
    wait: {
      type: Number,
      default: 300
    },
    /**
     * 加载过程步数
     */
    waitStep: {
      type: Number,
      default: 70
    }
  },
  setup() {
    /**
     * 进度条加载比例
     */
    const rate: Ref<number> = ref(0);
    /**
     * 加载任务状态
     */
    const currentStatus: Ref<LoadingStatus> = ref("loading");
    /**
     * 进度条是否需要进行显示
     */
    const needShow: Ref<boolean> = ref(false);
    /**
     * 定时器 id
     */
    let animatorId: number | undefined = void 0;

    const start: VoidFunction = async () => {
      let increaseStep: number = 1;
      currentStatus.value = "loading";
      rate.value = 0;
      needShow.value = true;

      animatorId = window.requestAnimationFrame(function doLoading() {
        if (rate.value <= 60) {
          rate.value += increaseStep += 0.005;
          animatorId = requestAnimationFrame(doLoading);
        } else {
          window.cancelAnimationFrame(animatorId!);
        }
      });
    };

    const finish: VoidFunction = async () => {
      let increaseStep: number = 1;
      currentStatus.value = "loading";
      needShow.value = true;

      if (rate.value >= 100) {
        rate.value = 0;
      }

      if (typeof animatorId !== "undefined") {
        window.cancelAnimationFrame(animatorId);
      }
      animatorId = window.requestAnimationFrame(function doFinish(): void {
        if (rate.value < 100) {
          rate.value += increaseStep += 0.4;
          animatorId = window.requestAnimationFrame(doFinish);
        } else {
          needShow.value = false;
          window.cancelAnimationFrame(animatorId!);
        }
      });
    };

    const error: VoidFunction = async () => {
      needShow.value = true;
      currentStatus.value = "error";
      let increaseStep = 1;

      if (typeof animatorId !== "undefined") {
        window.cancelAnimationFrame(animatorId);
      }
      if (rate.value >= 100) {
        rate.value = 0;
      }
      animatorId = window.requestAnimationFrame(function doFinish(): void {
        if (rate.value < 100) {
          rate.value += increaseStep += 1;
          animatorId = window.requestAnimationFrame(doFinish);
        } else {
          needShow.value = false;
          window.cancelAnimationFrame(animatorId!);
        }
      });
    };

    return {
      rate: rate,
      status: currentStatus,
      show: needShow,
      start: start,
      finish: finish,
      error: error
    };
  },
  expose: ["start", "finish", "error"],
  render(): JSX.Element {
    return (
      <div class={style["loading-bar-wrapper"]}>
        <div
          v-show={this.show}
          style={{
            transform: `scale(${this.rate}%, 1)`
          }}
          class={[
            this.status === "loading"
              ? style["loading-progress"]
              : style["loading-error"]
          ]}
        />
      </div>
    );
  }
});

export { LoadingBar };
