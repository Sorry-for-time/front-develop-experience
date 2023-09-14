import { CanvasBackground } from "@/components/canvasBackground/CanvasBackground";
import { defineComponent } from "vue";
import style from "./ClassComponentSample.module.scss";

const ClassComponentSample = defineComponent({
  name: "ClassComponentSample",
  render(): JSX.Element {
    return (
      <div class={[style["canvas-bgc-outer-wrapper"]]}>
        <div class={[style["relative-mount"]]}>
          <CanvasBackground />
        </div>
      </div>
    );
  }
});

export { ClassComponentSample };
