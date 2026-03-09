import { defineConfig } from "vitepress";
import packageJson from "../package.json";

// markdown-it plugins
// https://mdit-plugins.github.io/align.html
import { align } from "@mdit/plugin-align";
// https://mdit-plugins.github.io/footnote.html
import { footnote } from "@mdit/plugin-footnote";
// https://mdit-plugins.github.io/tasklist.html
import { tasklist } from "@mdit/plugin-tasklist";
// https://mdit-plugins.github.io/img-mark.html
import { imgMark } from "@mdit/plugin-img-mark";
import { sectionWrapper } from "./theme/utils/mdSectionWrapper";
import { table } from "./theme/utils/mdTable";
import { anchor } from "./theme/utils/mdCustomAnchor";

export default defineConfig({
  base: "/",
  cleanUrls: true,
  rewrites: {
    "posts/index.md": "index.md",
    "posts/tools/index.md": "tools/index.md",
  },
  lang: "zh_CN",
  title: "sendevia 的小站",
  titleTemplate: ":title",
  description: "随便写写的博客",
  markdown: {
    attrs: {
      allowedAttributes: ["id", "class"],
    },
    cjkFriendlyEmphasis: true,
    codeCopyButtonTitle: "复制代码",
    config(md) {
      md.use(align);
      md.use(anchor, {
        levels: [1, 2, 3, 4],
      });
      md.use(footnote);
      md.use(imgMark);
      md.use(sectionWrapper);
      md.use(table);
      md.use(tasklist, { label: true });
    },
    image: {
      lazyLoading: true,
    },
    lineNumbers: false,
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
  ],
  metaChunk: true,
  lastUpdated: true,
  themeConfig: {
    defaultColor: "#39c5bb",
    defaultImpression: "/assets/images/121337686_p0.webp",
    siteVersion: packageJson.version || "0.0.0",
    navSegment: [
      {
        text: "首页",
        icon: "home",
        link: "/",
      },
      {
        text: "AincradMix",
        icon: "borg",
        link: "/posts/AincradMix",
      },
      {
        text: "组件",
        icon: "code_blocks",
        link: "/posts/components/",
      },
      {
        text: "作品集",
        icon: "auto_awesome_mosaic",
        link: "https://sendevia.cn53.ug.link/photo/share/?id=4&pagetype=share&uuid=b6f1b05f-5027-451b-b21f-81cae88125e9#/login",
      },
      {
        text: "工具",
        icon: "build",
        link: "/tools/",
      },
    ],
  } as any,
  vite: {
    build: {
      minify: true,
    },
    plugins: [],
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "true",
    },
  },
});
