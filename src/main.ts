import "@/assets/Transition.scss";
import "@/assets/art-text.scss";
import "@/assets/main.scss";

import { vDraggable } from "@/directives/vDraggable";
import { useLoadingBar } from "@/hooks/useLoadingBar";

import { App } from "@/App";
import { router } from "@/router/router";
import { createPinia } from "pinia";
import { createApp } from "vue";

createApp(App)
  .directive("draggable", vDraggable)
  .use(router)
  .use(createPinia())
  .mount("#app");

const loadingBarHooks = useLoadingBar(document.body);
export { loadingBarHooks };
