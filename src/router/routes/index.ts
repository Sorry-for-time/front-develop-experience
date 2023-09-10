import { GrammarSample } from "@/views/grammarSample/GrammarSample";
import type { RouteRecordRaw } from "vue-router";

const indexConfig: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: { name: "index" }
  },
  {
    path: "/index",
    name: "index",
    component: GrammarSample
  }
];

export { indexConfig };
