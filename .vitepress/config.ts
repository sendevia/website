import { defineConfig } from "vitepress";
import packageJson from "../package.json";
import markdownItAnchor from "markdown-it-anchor";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "sendevia 的小站",
  titleTemplate: ":title",
  description: "一个博客",
  lang: "zh_CN",
  cleanUrls: true,
  markdown: {
    image: {
      lazyLoading: true,
    },
  },
  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    ["link", { href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@200..800&display=swap", rel: "stylesheet" }],
    ["link", { href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap", rel: "stylesheet" }],
    ["link", { href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap", rel: "stylesheet" }],
    [
      "link",
      { href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200", rel: "stylesheet" },
    ],
    ["link", { href: "https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap", rel: "stylesheet" }],
  ],
  vite: {
    define: {
      __SITE_VERSION__: JSON.stringify(packageJson.version || "0.0.0"),
    },
  },
});
