import { loadingBarHooks } from "@/main";
import { indexConfig } from "@/router/routes/routeList";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...indexConfig],
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

router.beforeEach((_to, _from, next) => {
  loadingBarHooks.start();
  next();
});

router.onError((reason, to, from) => {
  router.replace({
    name: "not-found"
  });
  console.warn(reason, `to: ${to.fullPath}, from: ${from.fullPath}`);
});

const faviconLink: HTMLLinkElement = document.head.querySelector("[rel=icon]")!;
router.afterEach((to, from, failure) => {
  switch (true) {
    case to.name === "not-found":
      loadingBarHooks.error();
      document.title = "NOT-FOUND";
      break;
    case !!failure:
      if (failure!.message.startsWith("Avoided redundant navigation")) {
        document.title = to.name as string;
        loadingBarHooks.finish();
      } else {
        document.title = "UN-KNOW ERROR";
        loadingBarHooks.error();
      }
      break;
    default:
      document.title = to.name as string;
      loadingBarHooks.finish();
      break;
  }

  const routeName = to.name as string;
  switch (true) {
    case routeName.startsWith("rx"):
      faviconLink.href = "/site_icon/rxjs.ico";
      break;
    case routeName.startsWith("class") || routeName.startsWith("decorator"):
      faviconLink.href = "/site_icon/decorator.png";
      break;
    case routeName.startsWith("web-rtc") || routeName.startsWith("rtc"):
      faviconLink.href = "/site_icon/web-rtc.png";
      break;
    case routeName.startsWith("binary") || routeName.startsWith("indexeddb"):
      faviconLink.href = "/site_icon/indexeddb.png";
      break;
    default:
      faviconLink.href = "/site_icon/favicon.svg";
      break;
  }
});

export { router };
