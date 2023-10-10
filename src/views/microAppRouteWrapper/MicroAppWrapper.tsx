import { defineComponent } from "vue";
import { RouterView, useRouter } from "vue-router";
import style from "./MicroAppWrapperStyle.module.scss";

const MicroAppWrapper = defineComponent({
  name: "MicroAppWrapper",
  setup() {
    const router = useRouter();

    return {
      router
    };
  },
  render(): JSX.Element {
    const { router } = this;
    return (
      <div class={[style["micro-app-wrapper"]]}>
        <header class={style["header-wrapper"]}>
          <button
            onClick={() => router.replace({ name: "angular16" })}
            class={["st-btn"]}
          >
            angular16
          </button>
          <button
            onClick={() => router.replace({ name: "react18" })}
            class={["st-btn"]}
          >
            react18
          </button>
          <button
            onClick={() => router.replace({ name: "iframe-viewer" })}
            class={["st-btn"]}
          >
            iframe-viewer
          </button>
        </header>

        <main class={[style["child-app-wrapper"]]}>
          <RouterView />
        </main>
      </div>
    );
  }
});

export default MicroAppWrapper;
