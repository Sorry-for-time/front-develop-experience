<template>
  <div class="class-decorator-sample">
    <div class="wrapper">
      <button class="st-btn" @click="increment">
        throttle increment(600ms)
      </button>
      <span>{{ count }}</span>
      <button class="st-btn" @click="decrement">
        debounce decrement(1000ms)
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { UseDebounce, UseThrottle } from "@/decorators/performanceUtil";
import { Component, Vue, toNative } from "vue-facing-decorator";

@Component({
  name: "ClassDecoratorSample"
})
class ClassDecoratorSample extends Vue {
  public count: number = 0;

  @UseThrottle(600)
  public increment(): void {
    this.count++;
    console.log(this.increment);
  }

  @UseDebounce(1000)
  public decrement(): void {
    this.count--;
  }
}

export default toNative(ClassDecoratorSample);
</script>

<style lang="scss" scoped>
.class-decorator-sample {
  width: 100%;
  height: 100%;

  .wrapper {
    width: fit-content;
    margin: 40px auto;
  }

  span {
    border-radius: 5px;
    padding: 5px;
    background-color: #2560ad;
    margin: 0 10px;
    color: white;
  }
}
</style>
