import { GrammarSample } from "@/views/grammarSample/GrammarSample";
import type { RouteRecordRaw } from "vue-router";
import { NotFound } from "@/router/404/NotFound";

const indexConfig: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: { name: "index" }
  },
  {
    path: "/index",
    name: "index",
    component: GrammarSample
  },
  { path: "/:pathMatch(.*)*", name: "not-found", component: NotFound }
];

export { indexConfig };
