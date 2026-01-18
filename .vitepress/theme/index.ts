import type { Theme } from "vitepress";
import { createPinia } from "pinia";

// Layouts
import Default from "./layouts/Default.vue";
import NotFound from "./layouts/NotFound.vue";

// Components
import AppBar from "./components/AppBar.vue";
import ArticleMasonry from "./components/ArticleMasonry.vue";
import Button from "./components/Button.vue";
import ButtonGroup from "./components/ButtonGroup.vue";
import Card from "./components/Card.vue";
import Chip from "./components/Chip.vue";
import Footer from "./components/Footer.vue";
import Header from "./components/Header.vue";
import ImageViewer from "./components/ImageViewer.vue";
import NavBar from "./components/NavBar.vue";
import PageIndicator from "./components/PageIndicator.vue";
import PrevNext from "./components/PrevNext.vue";
import ScrollToTop from "./components/ScrollToTop.vue";

// Styles
import "./styles/main.scss";

const pinia = createPinia();

export default {
  Layout: Default,
  NotFound: NotFound,
  enhanceApp({ app }) {
    app.use(pinia);

    app.component("MainLayout", Default);

    app.component("AppBar", AppBar);
    app.component("ArticleMasonry", ArticleMasonry);
    app.component("ButtonGroup", ButtonGroup);
    app.component("Footer", Footer);
    app.component("Header", Header);
    app.component("ImageViewer", ImageViewer);
    app.component("MaterialButton", Button);
    app.component("MaterialCard", Card);
    app.component("MaterialChip", Chip);
    app.component("NavBar", NavBar);
    app.component("PageIndicator", PageIndicator);
    app.component("PrevNext", PrevNext);
    app.component("ScrollToTop", ScrollToTop);
  },
} satisfies Theme;
