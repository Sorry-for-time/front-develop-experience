import { defineComponent } from "vue";
import style from "./IframeViewerStyle.module.scss";

export const IframeViewer = defineComponent({
  name: "IframeViewer",
  setup() {},
  render() {
    return (
      <div class={style["iframe-wrapper"]}>
        <iframe
          frameborder="none"
          scrolling="none"
          src="https://cn.bing.com"
        />
      </div>
    );
  }
});

export default IframeViewer;
