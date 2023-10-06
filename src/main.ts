import "@/assets/style/main.scss";

import { App } from "@/App";
import { PiniaMultiPersistPluginFactory } from "@/plugin/piniaPlugin/PiniaMultiPersistPluginFactory";
import { router } from "@/router/router";
import { createPinia } from "pinia";
import { createApp } from "vue";

import { vMoveable } from "@/directives/vMoveable";
import { useLoadingBar } from "@/hooks/useLoadingBar";

const { persistPlugin, pluginStatus } = PiniaMultiPersistPluginFactory.build(1);

createApp(App)
  .directive("moveable", vMoveable) // register global custom directive command
  .use(router)
  .use(createPinia().use(persistPlugin))
  .mount("#app");

const loadingBarHooks = useLoadingBar(document.body);

export { loadingBarHooks, pluginStatus };
