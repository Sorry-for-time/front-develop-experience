import { cloneDeep } from "lodash-es";
import {
  computed,
  defineComponent,
  ref,
  type ComputedRef,
  type Ref
} from "vue";
import style from "./FormExample.module.scss";

type FormData = Partial<{
  name: string;
  gender: string;
  hobbies: Array<string>;
  job: string;
  description: string;
  age: number;
  city: string;
  agreeProtocol: boolean;
}>;

const FormExample = defineComponent({
  name: "FormExample",
  setup() {
    const formData: Ref<FormData> = ref({
      name: "",
      gender: "",
      hobbies: [],
      job: "",
      description: "",
      age: 0,
      city: "",
      agreeProtocol: false
    });
    /**
     * used by reset to default data
     */
    const raw: Readonly<Partial<FormData>> = cloneDeep(formData.value);
    const submit = () => {
      // reset to default
      formData.value = cloneDeep(raw);
    };

    const selfDetail: ComputedRef<string> = computed(() => {
      const val = formData.value;
      return `用户名: ${val.name ? val.name : "无..."}; 年龄: ${
        val.age
      }; 爱好: ${val.hobbies?.concat("")}, 职业-${val.job}; 自我介绍: ${
        val.description
      }; 城市: ${val.city}`;
    });

    return {
      formData,
      submit,
      detail: selfDetail
    };
  },
  render() {
    const { formData, submit, detail } = this;
    return (
      <div class={style["form-example-wrapper"]}>
        <form class={style["form-data"]} onSubmit={(ev) => ev.preventDefault()}>
          <div class={style["form-item"]}>
            <label for="name">姓名: </label>
            <input type="text" name="name" id="name" v-model={formData.name} />
          </div>

          <div class={style["form-item"]}>
            <label>性别: </label>
            <label for="male">男</label>
            <input
              id="male"
              type="radio"
              value="male"
              v-model={formData.gender}
            />

            <label for="female">女</label>
            <input
              id="female"
              type="radio"
              value="female"
              v-model={formData.gender}
            />
          </div>

          <div class={style["form-item"]}>
            <label for="basket">篮球</label>
            <input
              v-model={formData.hobbies}
              type="checkbox"
              name="hobby"
              value="篮球"
              id="basket"
            />

            <label for="singing">唱歌</label>
            <input
              v-model={formData.hobbies}
              type="checkbox"
              name="hobby"
              value="唱歌"
              id="singing"
            />

            <label for="coding">coding</label>
            <input
              v-model={formData.hobbies}
              type="checkbox"
              name="hobby"
              value="代码"
              id="coding"
            />
          </div>

          <div class={style["form-item"]}>
            <label for="job">职业: </label>
            <select id="job" name="job" v-model={formData.job}>
              {["雇主", "律师", "教师", "软件开发人员"].map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div class={style["form-item"]}>
            <label for="description">个人简介: </label>
            <textarea
              cols={17}
              rows={6}
              placeholder="please input your self description"
              v-model={formData.description}
            />
          </div>

          <div class={style["form-item"]}>
            <label for="age">年纪: </label>
            <input type="number" name="" id="" v-model={formData.age} />
          </div>

          <div class={style["form-item"]}>
            <label for="city">城市: </label>
            <select name="city" id="city">
              {["厦门", "龙岩", "福州", "漳州"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div class={style["form-item"]}>
            <label for="protocol">同意协议</label>
            <input
              type="checkbox"
              name="protocol"
              id="protocol"
              v-model={formData.agreeProtocol}
            />
          </div>

          <button
            class={["st-btn"]}
            onClick={submit}
            style={{
              cursor: formData.agreeProtocol ? "default" : "not-allowed"
            }}
            disabled={!formData.agreeProtocol}
          >
            提交
          </button>
        </form>

        <div class={style["detail-display"]} v-show={formData.agreeProtocol}>
          您的个人信息是: {detail}
        </div>
      </div>
    );
  }
});

export { FormExample };
