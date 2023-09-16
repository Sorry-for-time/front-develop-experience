<template>
  <div class="computed-sample-wrapper">
    <div class="wrapper">
      <!-- 表单基本信息 -->
      <form>
        <label for="cargo-name">商品</label>
        <input
          id="cargo-name"
          type="text"
          class="st-input"
          v-model="cargoName"
        />
        <br />
        <label for="num">数量</label>
        <input id="num" type="number" class="st-input" v-model.number="num" />
        <br />
        <label for="price">价格</label>
        <input
          id="price"
          type="number"
          class="st-input"
          v-model.number="price"
        />
        <br />
      </form>

      <!-- 操作按钮 -->
      <button
        :disabled="!canSubmit"
        :class="{ forbid: !canSubmit }"
        class="st-btn"
        @click="submitCargo"
      >
        添加到购物车
      </button>
      <button
        :disabled="!(cargoCount > 0)"
        :class="{ forbid: !(cargoCount > 0) }"
        class="st-btn"
        @click="maskActive = true"
      >
        清空购物车
      </button>

      <!-- 商品列表 -->
      <TransitionGroup tag="ol" name="list" class="display-list">
        <li v-for="item of cargoList" :key="item.id">
          <span>{{ item.name }}</span>
          的数量是 {{ item.num }}, 单价是 {{ item.price }}, 小计
          {{ item.num * item.price }}
          <span class="delete-cargo" @click="removeCurrent(item.id)">删除</span>
        </li>
      </TransitionGroup>

      <!-- 统计信息 -->
      <main class="display-list">
        <h3 v-if="cargoCount > 0" class="hint">
          总计: 总数 -- {{ cargoCount }}, 总价 --- {{ totalPrice }}
        </h3>
        <h3 v-else class="hint">当前未添加任何商品购物车</h3>
      </main>

      <!-- 对话框 -->
      <DialogMaskProvider
        parent="body"
        v-model:visible="maskActive"
        modal-click-cancel
      >
        <div class="dialog">
          <h3>您确定清空购物车</h3>
          <main class="btn-group">
            <button
              style="background-color: rgb(143, 35, 35)"
              class="st-btn"
              @click="
                () => {
                  cargoList.length = 0;
                  maskActive = false;
                }
              "
            >
              确定
            </button>
            <button class="st-btn" @click="maskActive = false">取消</button>
          </main>
        </div>
      </DialogMaskProvider>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DialogMaskProvider } from "@/components/dialogMaskProvider/DialogMaskProvider";
import { nanoid } from "nanoid";
import { computed, ref, type Ref } from "vue";

const cargoName: Ref<string> = ref("");
const num: Ref<number> = ref(0);
const price: Ref<number> = ref(0);
const maskActive: Ref<boolean> = ref(false);

/**
 * 商品参数信息
 */
type CargoType = {
  id: string;
  name: string;
  num: number;
  price: number;
};
/**
 * 商品列表
 */
const cargoList: Ref<Array<CargoType>> = ref([]);
/**
 * 总价
 */
const totalPrice = computed(() => {
  return cargoList.value
    .map((item) => item.price * item.price)
    .reduce((p, c) => p + c, 0);
});
/**
 * 购物车商品总数
 */
const cargoCount = computed(() => {
  return cargoList.value.map((item) => item.num).reduce((p, v) => p + v, 0);
});
/**
 * 是否可提交
 */
const canSubmit = computed(() => {
  return cargoName.value.trim().length > 0 && num.value > 0 && price.value > 0;
});
/**
 * 添加商品
 */
const submitCargo: VoidFunction = () => {
  cargoList.value.unshift({
    id: nanoid(),
    name: cargoName.value,
    num: num.value,
    price: price.value
  });

  cargoName.value = "";
  num.value = 0;
  price.value = 0;
};
/**
 * 移除购物车中指定的商品
 *
 * @param id 商品 id
 */
const removeCurrent = (id: string): void => {
  const idx: number = cargoList.value.findIndex((item) => item.id === id);
  if (idx !== -1) {
    cargoList.value.splice(idx, 1);
  }
};
</script>

<style lang="scss" scoped>
.forbid {
  cursor: not-allowed;
  background-color: rgb(75, 103, 114);
  text-decoration: line-through;
}

.computed-sample-wrapper {
  width: 100%;
}

.wrapper {
  width: fit-content;
  margin: 20px auto;
}

form {
  width: fit-content;
  * {
    margin: 5px;
  }
}

button {
  margin: 5px;
}

.display-list {
  li {
    padding: 3px;
    box-shadow: 0 0 3px white;
    border-radius: 5px;
    margin: 10px 0;
  }

  .delete-cargo {
    text-decoration: underline;
    margin: 0 10px;
    color: rgb(175, 43, 43);
    cursor: default;

    &:hover {
      transition: all ease-out 200ms;
      color: rgb(219, 47, 47);
    }
  }
}

.hint {
  font-weight: bold;
  font-size: 20px;
  color: white;
  text-shadow: 0 0 13px rgba(255, 255, 255, 0.651);
}

.dialog {
  position: absolute;
  width: 300px;
  height: 160px;
  background-color: #414141fd;
  border-radius: 5px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;

  justify-content: center;
  align-items: center;

  .btn-group {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 30px;
  }
}
</style>
