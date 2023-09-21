import "@/assets/style/main.scss";

import { App } from "@/App";
import { createPiniaIndexedDBPersistPlugin } from "@/plugin/piniaPlugin/piniaPersistPlugin";
import { router } from "@/router/router";
import { createPinia } from "pinia";
import { createApp } from "vue";

import { vMoveable } from "@/directives/vMoveable";
import { useLoadingBar } from "@/hooks/useLoadingBar";

const { plugin, pluginStatus } = createPiniaIndexedDBPersistPlugin(2, true);

createApp(App)
  .directive("moveable", vMoveable) // register global custom directive command
  .use(router)
  .use(createPinia().use(plugin))
  .mount("#app");

const loadingBarHooks = useLoadingBar(document.body);

export { loadingBarHooks, pluginStatus };
