<template>
  <div class="text-wrapper">
    <input
      style="margin: 10px 10px"
      type="text"
      class="st-input"
      v-model="text"
      placeholder="请输入些什么..."
    />
    <br />

    <div
      v-show="text"
      style="font-size: 90px; margin: 10px 10px"
      class="color-text-container"
    >
      <div class="color-panel stroked">{{ text }}</div>
      <div class="color-pane fill-fade">{{ text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from "vue";

const text: Ref<string> = ref("");
</script>

<style lang="scss" scoped>
.text-wrapper {
  width: 100%;
}
</style>
