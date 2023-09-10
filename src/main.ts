import "@/assets/main.scss";
import "@/assets/Transition.scss";
import "@/assets/art-text.scss"
;
import { createPinia } from "pinia";
import { createApp } from "vue";

import App from "@/App.vue";
import { router } from "@/router/router";

createApp(App).use(router).use(createPinia()).mount("#app");
