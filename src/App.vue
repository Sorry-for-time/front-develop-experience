<template>
  <Layout />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";

const Layout = defineAsyncComponent({
  loader: () => import("@/views/Layout.vue")
});
</script>
