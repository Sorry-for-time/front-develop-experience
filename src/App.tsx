import { Layout } from "@/views/Layout";
import { defineComponent } from "vue";

const App = defineComponent({
  name: "App",
  render(): JSX.Element {
    return <Layout />;
  }
});

export { App };
