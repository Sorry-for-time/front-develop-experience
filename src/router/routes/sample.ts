import { ClassComponentSample } from "@/views/classComponentSample/ClassComponentSample";
import { HookSample } from "@/views/hookSample/HookSample";
import type { RouteRecordRaw } from "vue-router";

const sampleRouteConfig: RouteRecordRaw[] = [
  {
    path: "/component-sample",
    name: "component-sample",
    component: () => import("@/views/CustomComponentSample.vue")
  },
  {
    path: "/css-text",
    name: "css-text",
    component: () => import("@/views/CssTextSample.vue")
  },
  {
    path: "/custom-directive",
    name: "custom-directive",
    component: () => import("@/views/CustomDirectiveSample.vue")
  },
  {
    path: "/hook-sample",
    name: "hook-sample",
    component: HookSample
  },
  {
    path: "/computed-sample",
    name: "computed-sample",
    component: () => import("@/views/ComputedSample.vue")
  },
  {
    path: "/class-component-sample",
    name: "class-component-sample",
    component: ClassComponentSample
  },
  {
    path: "/class-decorator-sample",
    name: "class-decorator-sample",
    component: () => import("@/views/classDecoratorComponentSample/ClassDecoratorComponentSample")
  }
];

export { sampleRouteConfig };
