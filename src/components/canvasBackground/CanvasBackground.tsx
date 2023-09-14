import { LineScrollEffect } from "@/effect/LineScrollEffect";
import { defineAsyncComponent } from "vue";
import { Component, Vue, toNative } from "vue-facing-decorator";
import style from "./CanvasBackground.module.scss";

const CanvasBackgroundRender = (that: CanvasBackgroundBase): JSX.Element => {
  return (
    <div ref="wrapper" class={style["background-canvas-wrapper"]}>
      <div class={style["canvas-wrapper"]}>
        <canvas ref="canvas" />
      </div>
    </div>
  );
};

/**
 * 背景组件
 */
@Component({
  name: "CanvasBackground",
  render: CanvasBackgroundRender
})
class CanvasBackgroundBase extends Vue {
  /**
   * 监听器 id
   */
  private listenerFd: number | undefined = void 0;
  private lineScrollEffect!: LineScrollEffect;

  public mounted(): void {
    console.log("mounted!");
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const wrapper = this.$refs.wrapper as HTMLDivElement;
    const offsetCanvas = canvas.transferControlToOffscreen();

    const offsetScreenCtx: OffscreenCanvasRenderingContext2D =
      offsetCanvas.getContext("2d", {
        willReadFrequently: true
      })!;

    // canvas settings
    offsetScreenCtx.fillStyle = "white";
    offsetScreenCtx.strokeStyle = "white";
    offsetScreenCtx.lineWidth = 1;
    this.lineScrollEffect = new LineScrollEffect(offsetCanvas, wrapper);
    this.lineScrollEffect.uiResizeAutoFit = true;

    const animate = (): void => {
      offsetScreenCtx.clearRect(0, 0, canvas.width, canvas.height);
      this.lineScrollEffect.render(offsetScreenCtx);
      this.listenerFd = requestAnimationFrame(animate);
    };
    animate();
  }

  public beforeUnmount(): void {
    // clean up
    if (typeof this.listenerFd === "number") {
      window.cancelAnimationFrame(this.listenerFd);
    }
  }
}

/**
 * Canvas 动态背景组件
 */
export const CanvasBackground = defineAsyncComponent(async () =>
  toNative(CanvasBackgroundBase)
);
