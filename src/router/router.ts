import { loadingBarHooks } from "@/main";
import { indexConfig } from "@/router/routes/index";
import { sampleRouteConfig } from "@/router/routes/sample";
import { createRouter, createWebHistory } from "vue-router";

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

router.onError((reason, to, from) => {
  router.replace({
    name: "not-found"
  });
  console.warn(reason, `to: ${to.fullPath}, from: ${from.fullPath}`);
});

router.afterEach((to, from, failure) => {
  if (to.name === "not-found") {
    loadingBarHooks.error();
  } else if (failure) {
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
