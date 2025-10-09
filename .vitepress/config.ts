import { defineConfig } from "vitepress";
import markdownItAnchor from "markdown-it-anchor";
import packageJson from "../package.json";

export default defineConfig({
  base: "/",
  title: "sendevia 的小站",
  titleTemplate: ":title",
  description: "一个随便写写的博客",
  lang: "zh_CN",
  cleanUrls: true,
  markdown: {
    anchor: {
      permalink: markdownItAnchor.permalink.linkAfterHeader({
        style: "visually-hidden",
        symbol: "link",
        class: "title-anchor",
        assistiveText: () => "复制链接",
        visuallyHiddenClass: "visually-hidden",
        wrapper: ['<div class="title-with-achor">', "</div>"],
        placement: "before",
      }),
    },
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
  themeConfig: {
    defaultColor: "#39c5bb",
    defaultImpression: "/assets/images/116014672_p0.webp",
    siteVersion: packageJson.version || "0.0.0",
    navSegment: [
      { text: "首页", icon: "home", link: "/" },
      { text: "所有文章", icon: "list", link: "/posts" },
      { text: "Markdown 示例", icon: "counter_1", link: "/posts/markdown-examples" },
      { text: "API 示例", icon: "counter_2", link: "/posts/api-examples" },
      { text: "Markdown it", icon: "counter_3", link: "/posts/markdown-it" },
    ],
  } as any,
});
