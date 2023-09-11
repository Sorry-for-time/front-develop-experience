import { defineComponent, onMounted, ref, type Ref, type VNodeRef } from "vue";
import style from "./HookSample.module.scss";
import { loadingBarHooks } from "@/main";
import { LoadingBar } from "@/components/loadingBar/LoadingBar";
import { useLoadingBar, type LoadingBarHook } from "@/hooks/useLoadingBar";

const HookSample = defineComponent({
  name: "HookSample",
  setup() {
    const card = ref<HTMLDivElement | null>(null);
    const hook: Ref<LoadingBarHook | undefined> = ref(void 0);
    onMounted(() => {
      hook.value = useLoadingBar(card.value!);
    });

    return {
      card: card,
      hook: hook
    };
  },
  render(): JSX.Element {
    return (
      <div class={[style["hook-sample-wrapper"]]}>
        <div class={[style["card"]]}>
          <h4>使用全局的状态条</h4>
          <button class={["st-btn"]} onClick={loadingBarHooks.start}>
            loading
          </button>
          <button class={["st-btn"]} onClick={loadingBarHooks.finish}>
            结束
          </button>
          <button class={["st-btn"]} onClick={loadingBarHooks.error}>
            报个错
          </button>
        </div>

        <div
          ref="card"
          style={{
            position: "relative"
          }}
          class={[style["card"]]}
        >
          <h4>也可以在局部组件上使用加载条✨</h4>
          <h4>这需要一个 relative 容器</h4>
          <button
            class={["st-btn"]}
            onClick={() => {
              if (this.hook) {
                this.hook.start();
              }
            }}
          >
            loading
          </button>
          <button
            class={["st-btn"]}
            onClick={() => {
              if (this.hook) {
                this.hook.finish();
              }
            }}
          >
            结束
          </button>
          <button
            class={["st-btn"]}
            onClick={() => {
              if (this.hook) {
                this.hook.error();
              }
            }}
          >
            报个错
          </button>
          <LoadingBar />
        </div>
      </div>
    );
  }
});

export { HookSample };
