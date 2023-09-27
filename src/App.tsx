import { defineComponent } from "vue";
import { RouterView } from "vue-router";

const App = defineComponent({
  name: "App",
  render(): JSX.Element {
    return <RouterView />;
  }
});

export { App };
