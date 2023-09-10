import { KeepAlive, Transition, type VNode } from "vue";
import { RouterLink, RouterView } from "vue-router";
import style from "./Layout.module.scss";

const Layout: () => JSX.Element = (): JSX.Element => (
  <div class={style["wrapper"]}>
    <nav class={style["nav-header"]}>
      <RouterLink class={style["link"]} to={{ name: "index" }}>
        home
      </RouterLink>
      <RouterLink class={style["link"]} to={{ name: "component-sample" }}>
        component-sample
      </RouterLink>
    </nav>

    <main class={style["route-switch"]}>
      <RouterView
        class={style["fixed-route"]}
        v-slots={{
          default: ({ Component }: { Component: VNode }) => (
            <Transition name="list">
              <KeepAlive max={30}>{Component}</KeepAlive>
            </Transition>
          )
        }}
      />
    </main>
  </div>
);

export { Layout };
