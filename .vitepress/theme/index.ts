import type { Theme } from "vitepress";
import Layout from "./layouts/Default.vue";

import AppBar from "./components/Appbar.vue";
import Button from "./components/Button.vue";
import Footer from "./components/Footer.vue";
import Header from "./components/Header.vue";
import ImageViewer from "./components/ImageViewer.vue";
import PageIndicator from "./components/PageIndicator.vue";
import PrevNext from "./components/PrevNext.vue";
import ScrollToTop from "./components/ScrollToTop.vue";
import Navbar from "./components/Navbar.vue";

import "./styles/main.scss";

export default {
  Layout,
  enhanceApp({ app }) {
    app.component("AppBar", AppBar);
    app.component("Footer", Footer);
    app.component("Header", Header);
    app.component("ImageViewer", ImageViewer);
    app.component("MainLayout", Layout);
    app.component("MaterialButton", Button);
    app.component("Navbar", Navbar);
    app.component("PageIndicator", PageIndicator);
    app.component("PrevNext", PrevNext);
    app.component("ScrollToTop", ScrollToTop);
  },
} satisfies Theme;
