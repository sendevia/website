import type { Theme } from "vitepress";
import { createPinia } from "pinia";
import Layout from "./layouts/Default.vue";

import AppBar from "./components/AppBar.vue";
import ArticleMasonry from "./components/ArticleMasonry.vue";
import Button from "./components/Button.vue";
import Card from "./components/Card.vue";
import Footer from "./components/Footer.vue";
import Header from "./components/Header.vue";
import ImageViewer from "./components/ImageViewer.vue";
import PageIndicator from "./components/PageIndicator.vue";
import PrevNext from "./components/PrevNext.vue";
import ScrollToTop from "./components/ScrollToTop.vue";
import NavBar from "./components/NavBar.vue";

import "./styles/main.scss";

const pinia = createPinia();

export default {
  Layout,
  enhanceApp({ app }) {
    app.use(pinia);

    app.component("AppBar", AppBar);
    app.component("ArticleMasonry", ArticleMasonry);
    app.component("Footer", Footer);
    app.component("Header", Header);
    app.component("ImageViewer", ImageViewer);
    app.component("MainLayout", Layout);
    app.component("MaterialButton", Button);
    app.component("MaterialCard", Card);
    app.component("NavBar", NavBar);
    app.component("PageIndicator", PageIndicator);
    app.component("PrevNext", PrevNext);
    app.component("ScrollToTop", ScrollToTop);
  },
} satisfies Theme;
