import { createSignal } from "@/util/signal";
import { Transition, defineComponent, type PropType } from "vue";
import style from "./CapitalHintInput.module.scss";

/**
 * 大写锁定输入提示组件
 */
const CapitalHintInput = defineComponent({
  name: "CapitalHintInput",
  props: {
    /**
     * 默认值
     */
    modelValue: {
      type: String,
      required: true
    },
    /**
     * 输入框类型
     */
    type: {
      type: String as PropType<"number" | "text">,
      default: "text"
    },
    // 定义修饰符
    modelValueModifiers: { default: () => ({}) }
  },
  emits: ["update:modelValue" /* 定义更新函数派发事件 */],
  setup() {
    /**
     * 输入框输入状态
     */
    const [focusState, updateFocusState] = createSignal(false, {
      equals: false
    });
    /**
     * 当前键盘大写锁定状态
     */
    const [capitalState, updateCapitalState] = createSignal(false, {
      equals: false
    });
    /**
     * 判断一开始的键盘情况是否已经为开启了大写键盘的情况, 如果在进行输入(键盘事件发生)之前大写锁定已打开,
     * 那么更新大写提示控制变量为显示, 如果大写未锁定, 那么更新大写提示控制变量为隐藏
     *
     * @param ev 点击/触摸 事件
     */
    function judgeDefaultCapitalStatus(ev: PointerEvent) {
      ev.getModifierState("CapsLock")
        ? updateCapitalState(true)
        : updateCapitalState(false);
    }
    /**
     * 在键盘进行输入事件时判断大写锁定情况
     *
     * @param ev 键盘事件
     */
    function inputHandler(ev: KeyboardEvent) {
      ev.getModifierState("CapsLock")
        ? updateCapitalState(true)
        : updateCapitalState(false);
    }
    return {
      focusState,
      updateFocusState,
      capitalState,
      doKeyup: inputHandler,
      doPointerDown: judgeDefaultCapitalStatus
    };
  },
  render(): JSX.Element {
    const {
      type,
      modelValue,
      $emit,
      focusState,
      capitalState,
      updateFocusState,
      doKeyup,
      doPointerDown
    } = this;

    return (
      <div class={style["input-wrapper"]}>
        <input
          class={style["input-ref"]}
          type={type}
          value={modelValue}
          onInput={(payload: Event) => {
            let val = (payload.target as HTMLInputElement).value;
            if ((this.modelValueModifiers as any).trim) {
              val = val.trim();
            }
            if ((this.modelValueModifiers as any).upper) {
              val = val.toUpperCase();
            }
            // 派发同步更新
            $emit("update:modelValue", val);
          }}
          placeholder="please input some text"
          onFocusin={() => updateFocusState(true)}
          onFocusout={() => updateFocusState(false)}
          onKeyup={doKeyup}
          onPointerdown={doPointerDown}
        />
        <Transition name="bounce">
          <span
            v-show={focusState() && capitalState()}
            class={style["capital-hint"]}
          >
            大写锁定已打开
          </span>
        </Transition>
      </div>
    );
  }
});

export { CapitalHintInput };
