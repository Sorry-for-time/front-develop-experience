import "@/assets/style/main.scss";

import { App } from "@/App";
import { PiniaMultiPersistPluginFactory } from "@/plugin/piniaPlugin/PiniaMultiPersistPluginFactory";
import { router } from "@/router/router";
import { createPinia } from "pinia";
import { createApp } from "vue";

import { useLoadingBar } from "@/hooks/useLoadingBar";
import { vMoveablePlugin } from "@/plugin/directive/vMoveable/vMoveablePlugin";

const { persistPlugin, pluginStatus } = PiniaMultiPersistPluginFactory.build(1);

createApp(App)
  .use(vMoveablePlugin)
  .use(router)
  .use(createPinia().use(persistPlugin))
  .mount("#app");

const loadingBarHooks = useLoadingBar(document.body);

export { loadingBarHooks, pluginStatus };
