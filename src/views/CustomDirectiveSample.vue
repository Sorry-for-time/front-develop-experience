<template>
  <div class="draggable-wrapper">
    <section
      class="moveable-container"
      v-moveable.setPriority.usePosition="{
        activeClass: ['active', 'active-hint']
      }"
    >
      <span
        class="draggable-item"
        data-draggable
        v-for="item of list"
        :key="item.id"
        :data-x="item.dataX"
        :data-y="item.dataY"
      >
        the {{ item.text }}
      </span>
    </section>

    <main class="desc-wrapper">
      <h1 class="color-text" style="font-weight: bolder">
        v-moveable custom directive command use example
      </h1>
      <h2>
        add the v-moveable custom command in container element that declare a
        draggable element collection view
      </h2>
      <h2>
        and then add the data-draggable custom attribute in child element if you
        want it can be dragging
      </h2>
      <div>
        <button
          style="width: fit-content"
          @click="list.push(createItem())"
          class="st-btn"
        >
          add a new item
        </button>
        <button
          style="width: fit-content; margin-left: 20px"
          @click="list.shift()"
          class="st-btn"
        >
          delete an item
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { nanoid } from "nanoid";
import { ref, type Ref } from "vue";

const createNextInt = (limit: number): number => {
  return Math.floor(Math.random() * limit + 1);
};

type TagType = {
  id: string;
  text: string;
  dataX: number;
  dataY: number;
};

const createItem = (): TagType => {
  return {
    id: nanoid(),
    text: nanoid(4),
    dataX: createNextInt(400),
    dataY: createNextInt(400)
  };
};

const list: Ref<Array<TagType>> = ref(
  Array.from(
    (function* () {
      for (let i: number = 0; i < 10; i++) {
        yield createItem();
      }
    })()
  )
);
</script>

<style lang="scss" scoped>
.draggable-wrapper {
  background: no-repeat center url("/img/1.jpg");
  background-size: cover;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 500px auto;
}

.moveable-container {
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
  will-change: transform, cursor;
  cursor: default;
}
.active {
  cursor: move;
}
.active-hint {
  opacity: unset;
  border: 1px solid rgb(211, 211, 211);
}

.desc-wrapper {
  margin-top: 10px;
  display: flex;
  height: fit-content;
  column-gap: 10px;
  align-items: center;
  flex-wrap: wrap;

  * {
    width: 90%;
  }
}
</style>
