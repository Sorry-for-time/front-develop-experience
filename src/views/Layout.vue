<template>
  <div class="wrapper">
    <nav class="nav-header">
      <a
        v-for="(item, index) of routeList"
        :key="item.name"
        class="link"
        :class="{ 'when-active': router.currentRoute.value.name === item.name }"
        :style="{
          color:
            item.name === router.currentRoute.value.name
              ? 'cadetblue'
              : colorList[index % colorList.length],
          fontWeight:
            item.name === router.currentRoute.value.name ? 'bold' : 'normal'
        }"
        @click="switchRoute(item.name)"
      >
        {{ item.desc }}
      </a>
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
import type { Router } from "vue-router";
import { useRouter } from "vue-router";

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

const colorList: ReadonlyArray<string> = [
  "rgb(135, 172, 166)",
  "rgb(105, 123, 141)",
  "rgb(154, 132, 172)"
];

const switchRoute = (routName: string): void => {
  if (router.currentRoute.value.name !== routName) {
    router.replace({
      name: routName
    });
  }
};

const router: Router = useRouter();
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
  cursor: default;
  user-select: none;

  &:first-child {
    margin-left: 20px;
  }
}

.when-active {
  margin: 0 8px;
  transition: all 300ms ease-out;
  transform: scale(1.2);
  text-decoration: underline;
}
</style>
