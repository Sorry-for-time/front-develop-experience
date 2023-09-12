<template>
  <div class="draggable-wrapper">
    <section
      class="draggable-container"
      v-draggable.setPriority.usePosition.activeClass="{
        activeClass: ['active', 'active-hint']
      }"
    >
      <TransitionGroup name="bounce">
        <span
          class="draggable-item"
          data-draggable
          v-for="item of list"
          :key="item"
          :data-x="createNextInt(400)"
          :data-y="createNextInt(400)"
        >
          the {{ item }}
        </span>
      </TransitionGroup>
    </section>

    <main class="op-wrapper">
      <button @click="addRandom" class="st-btn">添加一个随机标签</button>
      <button class="st-btn">随机删除一个标签</button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { nanoid } from "nanoid";
import { ref, type Ref } from "vue";

const createNextInt = (limit: number): number => {
  return Math.floor(Math.random() * limit + 1);
};

const list: Ref<Array<string>> = ref(
  Array.from(
    (function* () {
      for (let i: number = 0; i < 10; i++) {
        yield `tag: ${i + 1}`;
      }
    })()
  )
);

const addRandom: VoidFunction = async () => {
  list.value.push(`the tag: ${nanoid(4)}`);
};
</script>

<style lang="scss" scoped>
.draggable-wrapper {
  background: no-repeat center url("/img/1.jpg");
  background-size: cover;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 500px auto;
  /* justify-content: space-between; */
}

.draggable-container {
  margin: 10px 10px;
  width: 480px;
  height: 480px;
  position: relative;
  box-shadow: 0 0 3px white;
  border-radius: 5px;
  overflow: hidden;
  touch-action: none;
}

.draggable-item {
  position: absolute;
  display: inline-block;
  width: fit-content;
  padding: 0 10px;
  height: 30px;
  text-align: center;
  user-select: none;
  border-radius: 5px;
  backdrop-filter: blur(12px);
  background: fixed no-repeat center
    linear-gradient(240deg, #8820ff, rgb(28, 250, 239), #2e2afa);
  background-size: cover;
  background-clip: text;
  color: transparent;
  font-weight: bold;
  border: 1px dashed rgb(211, 211, 211);
  opacity: 0.6;
  box-shadow: 0 0 4px gold;
  cursor: grab;
  will-change: transform;
}
.active {
  cursor: grabbing;
}
.active-hint {
  opacity: unset;
  border: 1px solid rgb(211, 211, 211);
}

.op-wrapper {
  margin-top: 10px;
  display: flex;
  height: fit-content;
  column-gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
