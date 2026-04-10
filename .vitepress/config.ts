import { defineConfig } from "vitepress";
import packageJson from "../package.json";

import { align } from "@mdit/plugin-align";
import { anchor } from "./theme/utils/mdCustomAnchor";
import { footnote } from "@mdit/plugin-footnote";
import { imgMark } from "@mdit/plugin-img-mark";
import { sectionWrapper } from "./theme/utils/mdSectionWrapper";
import { symbol } from "./theme/utils/mdSymbol";
import { tab } from "@mdit/plugin-tab";
import { table } from "./theme/utils/mdTable";
import { tasklist } from "@mdit/plugin-tasklist";

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
      md.use(anchor, { levels: [1, 2, 3, 4] });
      md.use(footnote);
      md.use(imgMark);
      md.use(sectionWrapper);
      md.use(symbol);
      md.use(tab, { name: "tabs" });
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
    math: true,
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
        href: "https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&display=swap",
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
        link: "https://ug.link/sendevia/photo/share/?id=4&pagetype=share&uuid=b6f1b05f-5027-451b-b21f-81cae88125e9",
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
