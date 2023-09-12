import "@/assets/Transition.scss";
import "@/assets/art-text.scss";
import "@/assets/main.scss";

import { vDraggable } from "@/directives/vDraggable";
import { useLoadingBar } from "@/hooks/useLoadingBar";

import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "@/App.vue";
import { router } from "@/router/router";

createApp(App)
  .directive("draggable", vDraggable)
  .use(router)
  .use(createPinia())
  .mount("#app");

const loadingBarHooks = useLoadingBar(document.body);
export { loadingBarHooks };
