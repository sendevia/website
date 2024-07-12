import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "sendevia 的小站",
  titleTemplate: ":title - sendevia.page.vitpress",
  description: "A VitePress Site",
  lang: "zh_CN",
  cleanUrls: true,
  markdown: {
    image: {
      lazyLoading: true,
    },
  },
});
