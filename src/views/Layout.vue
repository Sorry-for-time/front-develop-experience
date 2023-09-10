<template>
  <div class="wrapper">
    <nav class="nav-header">
      <RouterLink
        class="link"
        active-class="when-active"
        :to="{ name: 'index' }"
      >
        home
      </RouterLink>
      <RouterLink
        active-class="when-active"
        :to="{ name: 'css-text' }"
        class="link"
      >
        css-text
      </RouterLink>
      <RouterLink
        active-class="when-active"
        :to="{ name: 'component-sample' }"
        class="link"
      >
        component-sample
      </RouterLink>

      <RouterLink
        active-class="when-active"
        :to="{ name: 'custom-directive' }"
        class="link"
      >
        custom-directive
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
