import Layout from "./layouts/Default.vue";
import type { Theme } from "vitepress";
import "./styles/main.scss";

export default {
  Layout,
  enhanceApp({ app }) {
    app.component("MainLaylout", Layout);
  },
} satisfies Theme;
