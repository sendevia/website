import { defineConfig } from "vitepress";
import packageJson from "../package.json";
// https://mdit-plugins.github.io/zh/align.html
import { align } from "@mdit/plugin-align";
// https://github.com/valeriangalliat/markdown-it-anchor
import anchor from "markdown-it-anchor";
// https://mdit-plugins.github.io/footnote.html
import { footnote } from "@mdit/plugin-footnote";
// https://mdit-plugins.github.io/tasklist.html
import { tasklist } from "@mdit/plugin-tasklist";
import { wrapHeadingsAsSections } from "./theme/utils/sectionWrapper";

export default defineConfig({
  base: "/",
  cleanUrls: true,
  lang: "zh_CN",
  title: "sendevia 的小站",
  titleTemplate: ":title",
  description: "一个随便写写的博客",
  markdown: {
    anchor: {
      permalink: anchor.permalink.linkAfterHeader({
        style: "visually-hidden",
        symbol: "link",
        class: "title-anchor",
        assistiveText: () => "复制链接",
        visuallyHiddenClass: "visually-hidden",
        wrapper: ['<div class="title-with-achor">', "</div>"],
        placement: "before",
        space: false,
      }),
    },
    attrs: {
      allowedAttributes: ["id", "class"],
    },
    cjkFriendlyEmphasis: true,
    codeCopyButtonTitle: "复制代码",
    config(md) {
      md.use(align);
      md.use(footnote);
      md.use(wrapHeadingsAsSections);
      md.use(tasklist, { label: true });
    },
    image: {
      lazyLoading: true,
    },
    lineNumbers: true,
    theme: "material-theme",
    codeTransformers: [
      {
        pre(node) {
          node.properties.tabindex = "-1";
        },
      },
    ],
  },
  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com" }],
    [
      "link",
      { href: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@200..800&display=swap", rel: "stylesheet" },
    ],
    [
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap",
        rel: "stylesheet",
      },
    ],
    [
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap",
        rel: "stylesheet",
      },
    ],
    [
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
        rel: "stylesheet",
      },
    ],
    [
      "link",
      {
        href: "https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap",
        rel: "stylesheet",
      },
    ],
  ],
  themeConfig: {
    defaultColor: "#39c5bb",
    defaultImpression: "/assets/images/116014672_p0.webp",
    siteVersion: packageJson.version || "0.0.0",
    navSegment: [
      { text: "首页", icon: "home", link: "/" },
      { text: "AincradMix", icon: "borg", link: "/posts/AincradMix" },
    ],
  } as any,
});
