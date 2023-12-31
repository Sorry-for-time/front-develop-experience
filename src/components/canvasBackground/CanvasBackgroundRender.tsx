import style from "./CanvasBackground.module.scss";

export const CanvasBackgroundRender = (): JSX.Element => {
  return (
    <div class={style["background-canvas-wrapper"]}>
      <div ref="wrapper" class={style["canvas-wrapper"]}>
        <canvas ref="canvas" />
      </div>
    </div>
  );
};
