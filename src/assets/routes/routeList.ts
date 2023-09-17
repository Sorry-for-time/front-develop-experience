/**
 * 路由描述及链接描述
 */
export type RouteDesc = {
  name: string;
  desc: string;
};

export const routes = [
  {
    name: "index",
    desc: "home"
  },
  {
    name: "css-text",
    desc: "css-text"
  },
  {
    name: "component-sample",
    desc: "component-sample"
  },
  {
    name: "computed-sample",
    desc: "computed-sample"
  },
  {
    name: "custom-directive",
    desc: "custom-directive"
  },
  {
    name: "hook-sample",
    desc: "hook-sample"
  },
  {
    name: "not-exist",
    desc: "404 not -found"
  },
  {
    name: "class-decorator-sample",
    desc: "class-decorator-sample"
  },
  {
    name: "binary-persist-test",
    desc: "binary-persist-test"
  }
];
