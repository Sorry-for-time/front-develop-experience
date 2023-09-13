import {
  Teleport,
  Transition,
  defineComponent,
  ref,
  watch,
  type Ref
} from "vue";

import style from "./DialogMaskProvider.module.scss";

const DialogMaskProvider = defineComponent({
  name: "Dialog",
  props: {
    /**
     * 是否显示遮罩
     */
    visible: {
      type: Boolean,
      default: false
    },
    /**
     * 打开对话框时候的回调
     */
    onOpen: {
      type: Function
    },
    /**
     * 关闭对话框时候的回调
     */
    onClosed: {
      type: Function
    },
    /**
     * 点击遮罩时是否可以关闭
     */
    modalClickCancel: {
      type: Boolean,
      default: false
    },
    /**
     * 挂载的容器, 这要求挂载点具有 position: relative 属性
     */
    parent: {
      type: String,
      default: "body"
    }
  },
  emits: ["update:visible"],
  setup(props, { slots }) {
    const mask: Ref<HTMLDivElement | null> = ref<HTMLDivElement | null>(null);
    watch(props, (newValue, old) => {
      if (newValue.visible) {
        if (typeof props.onOpen === "function") {
          props.onOpen();
        }
      }
      if (!newValue.visible) {
        if (typeof props.onClosed === "function") {
          props.onClosed();
        }
      }
    });

    return {
      slots,
      mask
    };
  },

  render(): JSX.Element {
    return (
      <Teleport to={this.parent}>
        <Transition name="bounce">
          <div v-show={this.visible} class={style["mask"]}>
            <div
              ref="mask"
              onPointerdown={() => {
                if (this.modalClickCancel) {
                  this.$emit("update:visible", false);
                }
              }}
              class={style["content-wrapper"]}
            >
              {this.slots.default!()}
            </div>
          </div>
        </Transition>
      </Teleport>
    );
  }
});

export { DialogMaskProvider };
