import { defineComponent, ref, type Ref } from "vue";
import { useRouter } from "vue-router";
import style from "./NotFound.module.scss";

const NotFound = defineComponent({
  name: "NotFound",
  props: {
    wait: {
      type: Number,
      default: 16
    }
  },
  setup(props) {
    const router = useRouter();
    const countDown: Ref<number> = ref(props.wait);
    let timer: number | undefined = void 0;
    const backHome: VoidFunction = (): void => {
      clearInterval(timer);
      router.replace({
        name: "index"
      });
    };
    return {
      router,
      countDown,
      timer,
      backHome
    };
  },
  activated() {
    this.countDown = this.wait;
    (this.timer as unknown as number) = setInterval(() => {
      if (this.countDown > 1) {
        this.countDown--;
      } else {
        clearInterval(this.timer);
        this.router.replace({
          name: "index"
        });
      }
    }, 1000);
  },
  deactivated() {
    clearInterval(this.timer);
  },
  render(): JSX.Element {
    return (
      <div class={style["not-found-wrapper"]}>
        <img class={style["loading-gif"]} src="/img/loading.gif" />
        <h3 class={style["error-hint"]}>
          您所访问的地区一片荒芜, {this.countDown}s 后返回主页或
          <span onClick={this.backHome} class={style["back-hint"]}>
            立即返回
          </span>
        </h3>
      </div>
    );
  }
});

export { NotFound };
