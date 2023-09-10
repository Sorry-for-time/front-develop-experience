import { createRouter, createWebHistory } from "vue-router";
import { sampleRouteConfig } from "@/router/routes/sample";
import { indexConfig } from "@/router/routes/index";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...indexConfig, ...sampleRouteConfig]
});

export { router };
