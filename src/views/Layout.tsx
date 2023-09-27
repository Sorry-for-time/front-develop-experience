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
  name: "Layout",
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
    /**
     * 是否展示菜单列表
     */
    const showBurgerList = ref(false);

    return {
      activeRouteName,
      router,
      routeList: exampleLinkList,
      colorList,
      switchRoute,
      showBurgerList
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
        {/* 全局动态背景 */}
        {isMobile() ? null : <ClassComponentSample />}
        <div class={style["wrapper"]}>
          {/* 导航栏 */}
          <nav class={style["nav-header"]}>
            {/* 默认展示列表 */}
            <div class={style["default-display"]}>
              {routeList.slice(0, 5).map(({ name, desc }, index) => (
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
            </div>

            {/* 额外菜单 */}
            <div class={[style["menu-wrapper"]]} v-show={routeList.length > 4}>
              {/* 面包屑 */}
              <section
                class={style["burger-wrapper"]}
                onPointerdown={() =>
                  (this.showBurgerList = !this.showBurgerList)
                }
              >
                {Array.from([1, 2, 3]).map((i) => (
                  <div
                    key={i}
                    class={[
                      style["burger-line"],
                      this.showBurgerList ? style["burger-open"] : ""
                    ]}
                  />
                ))}
              </section>

              {/* 列表内容 */}
              <Transition name="fading">
                <div v-show={this.showBurgerList}>
                  <div class={style["triangle"]} />
                  <main class={style["other-list-wrapper"]}>
                    {routeList.slice(5).map(({ name, desc }, index) => (
                      <a
                        key={name}
                        class={[
                          style["link"],
                          routeName === name ||
                          (!router.hasRoute(name) && routeName === "not-found")
                            ? style["when-active"]
                            : null
                        ]}
                        onClick={(): void => {
                          switchRoute(name);
                          this.showBurgerList = false;
                        }}
                        style={[
                          {
                            color:
                              name === routeName ||
                              (!router.hasRoute(name) &&
                                routeName === "not-found")
                                ? "cadetblue"
                                : colorList[index % colorList.length],
                            fontWeight: name === routeName ? "bold" : "normal"
                          }
                        ]}
                      >
                        {desc}
                      </a>
                    ))}
                  </main>
                </div>
              </Transition>
            </div>
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
