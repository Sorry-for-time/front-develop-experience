import {
  KeepAlive,
  Transition,
  computed,
  defineComponent,
  ref,
  type Ref,
  type VNode
} from "vue";
import type { Router } from "vue-router";
import { RouterView, useRouter } from "vue-router";
import style from "./Layout.module.scss";

const Layout = defineComponent({
  setup() {
    /**
     * 路由描述
     */
    type RouteDesc = {
      name: string;
      desc: string;
    };
    /**
     * 当前活动路由名称
     */
    const activeRouteName = computed(() => router.currentRoute.value.name);
    /**
     * 路由表
     */
    const routeList: Ref<Array<RouteDesc>> = ref([
      {
        name: "index",
        desc: "home"
      },
      {
        name: "css-text",
        desc: "css-text"
      },
      {
        name: "component-sample",
        desc: "component-sample"
      },
      {
        name: "computed-sample",
        desc: "computed-sample"
      },
      {
        name: "custom-directive",
        desc: "custom-directive"
      },
      {
        name: "hook-sample",
        desc: "hook-sample"
      },
      {
        name: "not-exist",
        desc: "404 not -found"
      },
      {
        name: "class-component-sample",
        desc: "class-component-sample"
      }
    ]);
    /**
     * 链接随机颜色列表
     */
    const colorList: ReadonlyArray<string> = [
      "rgb(135, 172, 166)",
      "rgb(105, 123, 141)",
      "rgb(154, 132, 172)"
    ];
    /**
     * 路由管理实例
     */
    const router: Router = useRouter();
    /**
     * 切换路由
     *
     * @param routName 路由名称
     */
    const switchRoute = (routName: string): void => {
      try {
        if (router.currentRoute.value.name !== routName) {
          router.replace({
            name: routName
          });
        }
      } catch (reason) {
        router.replace({
          name: "not-found"
        });
      }
    };

    return {
      activeRouteName,
      router,
      routeList,
      colorList,
      switchRoute
    };
  },
  render(): JSX.Element {
    const {
      activeRouteName: routeName,
      router,
      routeList,
      colorList,
      switchRoute
    } = this;

    return (
      <div class={style["wrapper"]}>
        <nav class={style["nav-header"]}>
          {routeList.map(({ name, desc }, index) => (
            <a
              key={name}
              class={[
                style["link"],
                routeName === name ||
                (!router.hasRoute(name) && routeName === "not-found")
                  ? style["when-active"]
                  : ""
              ]}
              onClick={(): void => switchRoute(name)}
              style={[
                {
                  color:
                    name === routeName ||
                    (!router.hasRoute(name) && routeName === "not-found")
                      ? "cadetblue"
                      : colorList[index % colorList.length],
                  fontWeight: name === routeName ? "bold" : "normal"
                }
              ]}
            >
              {desc}
            </a>
          ))}
        </nav>

        <main class={style["route-switch"]}>
          <RouterView class={style["fixed-route"]}>
            {{
              default: ({ Component }: { Component: VNode }): JSX.Element => (
                <Transition name="list">
                  <KeepAlive max={64}>{Component}</KeepAlive>
                </Transition>
              )
            }}
          </RouterView>
        </main>
      </div>
    );
  }
});

export { Layout };
