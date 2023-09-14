import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx({
      // tsx/jsx 模板添加装饰器语法支持
      babelPlugins: [["@babel/plugin-proposal-decorators", { legacy: true }]]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  worker: {
    format: "es"
  },
  build: {
    cssMinify: true,
    cssCodeSplit: true
  },
  server: {
    port: 3002,
    open: true
  },
  css: {
    postcss: {
      plugins: [autoprefixer]
    }
  }
});
