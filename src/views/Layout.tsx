import { pageLinks, type RouteDesc } from "@/assets/routes/linkList";
import { isMobile } from "@/util/checkUtil";
import {
  computed,
  defineComponent,
  KeepAlive,
  ref,
  Transition,
  type Ref,
  type VNode
} from "vue";
import type { Router } from "vue-router";
import { RouterView, useRouter } from "vue-router";
import { ClassComponentSample } from "./classComponentSample/ClassComponentSample";
import style from "./Layout.module.scss";

const Layout = defineComponent({
  setup() {
    /**
     * 当前活动路由名称
     */
    const activeRouteName = computed(() => router.currentRoute.value.name);
    /**
     * 示例路由展示描述列表
     */
    const exampleLinkList: Ref<Array<RouteDesc>> = ref(pageLinks);
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
      routeList: exampleLinkList,
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
      <>
        {isMobile() ? null : <ClassComponentSample />}
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
                    <KeepAlive max={64} exclude={["ClassDecoratorSample"]}>
                      {Component}
                    </KeepAlive>
                  </Transition>
                )
              }}
            </RouterView>
          </main>
        </div>
      </>
    );
  }
});

export { Layout };
