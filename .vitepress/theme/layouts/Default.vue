<script setup lang="ts">
import AllPostsLayout from "./AllPosts.vue";
import ArticleLayout from "./Article.vue";
import NotFoundLayout from "./NotFound.vue";
import SearchPostsLayout from "./SearchPosts.vue";
import Footer from "../components/Footer.vue";
import Sidebar from "../components/Sidebar.vue";
import { argbFromHex } from "@material/material-color-utilities";
import { generateColorPalette } from "../utils/colorPalette";
import { onMounted, nextTick } from "vue";
import { useRoute } from "vitepress";
import { useGlobalData } from "../composables/useGlobalData";
const { site, page, frontmatter } = useGlobalData();

/**
 * 获取图片主色调（取图片左上角像素点的颜色）
 * @param url 图片地址
 * @returns Promise<number | null> 返回 ARGB 颜色值，获取失败返回 null
 */
function getImageMainColor(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(img, 0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      const argb = (255 << 24) | (r << 16) | (g << 8) | b;
      resolve(argb >>> 0);
    };
    img.onerror = () => resolve(null);
  });
}

/**
 * 根据头图动态更新调色板
 * 1. 等待 DOM 更新后查找 id="header-impression-image" 的元素
 * 2. 如果找不到该元素，则使用默认颜色生成调色板
 * 3. 如果元素有 impression-color 属性且为合法的 hex 颜色，则用该颜色生成调色板
 * 4. 否则尝试从元素的 backgroundImage 提取图片 URL，并获取图片主色调
 * 5. 最终调用 generateColorPalette 生成调色板
 */
async function updatePalette() {
  await nextTick();
  const el = document.getElementById("header-impression-image");
  // @ts-ignore
  const defaultColor = __DEFAULT_COLOR__;
  if (!el) {
    await generateColorPalette(argbFromHex(defaultColor));
    return;
  }

  const colorAttr = el.getAttribute("impression-color");
  if (colorAttr && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(colorAttr)) {
    const argb = argbFromHex(colorAttr);
    await generateColorPalette(argb);
    return;
  }

  const style = window.getComputedStyle(el);
  const bg = style.backgroundImage;
  const match = bg.match(/url\(["']?(.*?)["']?\)/);
  const url = match?.[1] || null;
  let argb: number | null = null;
  if (url) {
    argb = await getImageMainColor(url);
  }
  await generateColorPalette(argb ?? argbFromHex(defaultColor));
}

const route = useRoute();

onMounted(updatePalette);

function onAfterEnter() {
  updatePalette();
}
</script>

<template>
  <div id="main-layout">
    <Sidebar />
    <div id="main-layout-content-flow">
      <div id="main-layout-content-filler">
        <div v-if="frontmatter.home">
          <h1>{{ site.title }}</h1>
          <p>{{ site.description }}</p>
        </div>
        <AllPostsLayout v-else-if="frontmatter.layout === 'posts'" />
        <SearchPostsLayout v-else-if="frontmatter.layout === 'search'" />
        <NotFoundLayout v-else-if="page.isNotFound" />
        <ArticleLayout v-else />
      </div>
      <Footer />
    </div>
  </div>
</template>
