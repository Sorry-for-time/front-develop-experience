import { defineComponent } from "vue";
import style from "./UploadLayout.module.scss";

const UploadLayout = defineComponent({
  name: "UploadLayout",
  setup() {},
  render(): JSX.Element {
    return <div class={[style["upload-layout-wrapper"]]}></div>;
  }
});
