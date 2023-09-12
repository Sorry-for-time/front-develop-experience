import { createRouter, createWebHistory } from "vue-router";
import { sampleRouteConfig } from "@/router/routes/sample";
import { indexConfig } from "@/router/routes/index";
import { loadingBarHooks } from "@/main";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...indexConfig, ...sampleRouteConfig],
  strict: true,
  scrollBehavior: (to, from, savedPosition) => {
    return savedPosition
      ? savedPosition
      : {
          behavior: "smooth",
          top: 0,
          left: 0
        };
  }
});

router.beforeEach((to, from, next) => {
  loadingBarHooks.start();
  next();
});
router.afterEach((to, from, failure) => {
  if (failure) {
    if (failure.message.startsWith("Avoided redundant navigation")) {
      loadingBarHooks.finish();
    } else {
      loadingBarHooks.error();
    }
  } else {
    loadingBarHooks.finish();
  }
});

export { router };
