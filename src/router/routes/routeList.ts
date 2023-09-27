import { NotFound } from "@/router/404/NotFound";
import { Layout } from "@/views/Layout";
import { FormExample } from "@/views/formExample/FormExample";
import { GrammarSample } from "@/views/grammarSample/GrammarSample";
import { HookSample } from "@/views/hookSample/HookSample";
import type { RouteRecordRaw } from "vue-router";

const indexConfig: RouteRecordRaw[] = [
  {
    path: "/",
    component: Layout,
    redirect: { name: "index" },
    children: [
      {
        path: "index",
        name: "index",
        component: GrammarSample
      },
      {
        path: "component-sample",
        name: "component-sample",
        component: () => import("@/views/CustomComponentSample.vue")
      },
      {
        path: "css-text",
        name: "css-text",
        component: () => import("@/views/CssTextSample.vue")
      },
      {
        path: "custom-directive",
        name: "custom-directive",
        component: () => import("@/views/CustomDirectiveSample.vue")
      },
      {
        path: "hook-sample",
        name: "hook-sample",
        component: HookSample
      },
      {
        path: "computed-sample",
        name: "computed-sample",
        component: () => import("@/views/ComputedSample.vue")
      },
      {
        path: "class-decorator-sample",
        name: "class-decorator-sample",
        component: () =>
          import(
            "@/views/classDecoratorComponentSample/ClassDecoratorComponentSample"
          )
      },
      {
        path: "binary-persist-test",
        name: "binary-persist-test",
        component: () =>
          import("@/views/imagePersistTest/ImagePersistTestSample.vue")
      },
      {
        path: "rx-streaming",
        name: "rx-streaming",
        component: () =>
          import("@/views/searchHighlightList/SearchHighlightList")
      },
      {
        path: "web-rtc",
        name: "web-rtc",
        component: () => import("@/views/webRTC/WebRTCSample.vue")
      },
      {
        path: "form-example",
        name: "form-example",
        component: FormExample
      },
      { path: "/:pathMatch(.*)*", name: "not-found", component: NotFound }
    ]
  }
];

export { indexConfig };
