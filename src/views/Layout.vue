<template>
  <div class="wrapper">
    <nav class="nav-header">
      <RouterLink
        v-for="item of routeList"
        :key="item.name"
        class="link"
        active-class="when-active"
        :to="{ name: item.name }"
      >
        {{ item.desc }}
      </RouterLink>
    </nav>

    <main class="route-switch">
      <RouterView v-slot="{ Component }">
        <Transition name="list">
          <KeepAlive max="64">
            <component class="fixed-route" :is="Component" />
          </KeepAlive>
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from "vue";

type RouteDesc = {
  name: string;
  desc: string;
};

const routeList: Ref<Array<RouteDesc>> = ref([
  {
    name: "index",
    desc: "home"
  },
  {
    name: "css-text",
    desc: "css-text"
  },
  {
    name: "component-sample",
    desc: "component-sample"
  },
  {
    name: "custom-directive",
    desc: "custom-directive"
  },
  {
    name: "hook-sample",
    desc: "hook-sample"
  }
]);
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 50px auto;
  box-sizing: border-box;
}

.nav-header {
  box-shadow: 0 1px 3px white;
  display: flex;
  flex-wrap: nowrap;
  justify-content: left;
  align-items: center;
  column-gap: 20px;
}

.route-switch {
  position: relative;
}

.fixed-route {
  position: absolute;
}

.link {
  color: aliceblue;
  font-size: 18px;
  font-weight: normal;

  &:first-child {
    margin-left: 20px;
  }
}

.when-active {
  color: cadetblue;
  margin: 0 10px;
  transition: all 300ms ease-out;
  transform: scale(1.2);
}
</style>
