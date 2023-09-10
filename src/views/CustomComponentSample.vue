<template>
  <div>
    <h5 style="margin: 10px">大写键锁定提示输入框组件示例</h5>
    <CapitalHintInput style="margin: 5px" v-model:model-value.trim="text" />
  </div>
</template>

<script setup lang="ts">
import { CapitalHintInput } from "@/components/capitalHintInput/CapitalHintInput";
import { ref, type Ref } from "vue";

const text: Ref<string> = ref("");
</script>
