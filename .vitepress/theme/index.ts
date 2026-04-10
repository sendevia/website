/// <reference types="../../types/scss.d.ts" />

import type { Theme } from "vitepress";
import { createPinia } from "pinia";

// Layouts
import Default from "./layouts/Default.vue";
import NotFound from "./layouts/NotFound.vue";

// Components
import AnchorLink from "./components/AnchorLink.vue";
import AppBar from "./components/AppBar.vue";
import ArticleMasonry from "./components/ArticleMasonry.vue";
import AllButtons from "./components/Buttons/main.vue";
import Card from "./components/Card.vue";
import Footer from "./components/Footer.vue";
import Header from "./components/Header.vue";
import ImageViewer from "./components/ImageViewer.vue";
import Input from "./components/Input.vue";
import NavBar from "./components/NavBar.vue";
import PageIndicator from "./components/PageIndicator.vue";
import PrevNext from "./components/PrevNext.vue";
import ScrollToTop from "./components/ScrollToTop.vue";
import StateLayer from "./components/StateLayer.vue";

// Styles
import "./styles/main.scss";

const pinia = createPinia();

export default {
  Layout: Default,
  NotFound: NotFound,
  enhanceApp({ app }) {
    app.use(pinia);

    app.component("MainLayout", Default);

    app.component("AnchorLink", AnchorLink);
    app.component("AppBar", AppBar);
    app.component("ArticleMasonry", ArticleMasonry);
    app.component("Footer", Footer);
    app.component("Header", Header);
    app.component("ImageViewer", ImageViewer);
    app.component("MaterialButton", AllButtons);
    app.component("MaterialCard", Card);
    app.component("MaterialInput", Input);
    app.component("NavBar", NavBar);
    app.component("PageIndicator", PageIndicator);
    app.component("PrevNext", PrevNext);
    app.component("ScrollToTop", ScrollToTop);
    app.component("StateLayer", StateLayer);
  },
} satisfies Theme;
