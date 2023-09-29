import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx({
      // tsx/jsx 模板添加装饰器语法支持
      babelPlugins: [["@babel/plugin-proposal-decorators", { legacy: true }]]
    }),
    mkcert({
      force: true,
      autoUpgrade: true,
      source: "coding"
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
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    cssTarget: "chrome61",
    cssCodeSplit: true
  },
  server: {
    port: 3002,
    open: true,
    https: true,
    // 为启用 SharedArrayBuffer 添加头部信息
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp"
    }
  },
  css: {
    postcss: {
      plugins: [autoprefixer]
    }
  }
});
