import type { Plugin } from "vue";
import { vMoveable } from "./vMoveable";

/**
 * 可拖拽指令拓展插件
 */
const vMoveablePlugin: Plugin = {
  install(app): void {
    app.directive("moveable", vMoveable); // register global custom directive command
  }
};

export { vMoveablePlugin };
