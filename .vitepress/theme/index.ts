// https://vitepress.dev/guide/custom-theme
import Layout from "./Layout.vue";
import type { Theme } from "vitepress";
import "./styles/main.scss";

export default {
  Layout,
  enhanceApp({ app }) {
    app.component("MainLaylout", Layout);
  },
} satisfies Theme;
