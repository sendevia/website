import type { Theme } from "vitepress";

import Layout from "./layouts/Default.vue";
import Button from "./components/Button.vue";

import "./styles/main.scss";

export default {
  Layout,
  enhanceApp({ app }) {
    app.component("MainLayout", Layout);
    app.component("MaterialButton", Button);
  },
} satisfies Theme;
