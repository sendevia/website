<script setup lang="ts">
import { computed } from "vue";
import { useBreakpoints } from "@vueuse/core";
import { usePostStore, type PostData } from "../stores/posts";
import { useGlobalData } from "../composables/useGlobalData";

const postsStore = usePostStore();
const { theme } = useGlobalData();

/** 响应式断点配置 */
const breakpoints = useBreakpoints({
  mobile: 600,
  tablet: 840,
  desktop: 1200,
  large: 1600,
});

/**
 * 根据屏幕宽度计算当前的列数
 * @returns {number} 列数（挂载前默认为 1）
 */
const columnCount = computed(() => {
  if (breakpoints.greaterOrEqual("large").value) return 4;
  if (breakpoints.greaterOrEqual("desktop").value) return 3;
  if (breakpoints.greaterOrEqual("tablet").value) return 3;
  if (breakpoints.greaterOrEqual("mobile").value) return 2;
  return 1;
});

/**
 * 获取按日期降序排列的文章列表
 * @returns {PostData[]} 排序后的文章数组
 */
const articlesList = computed(() => {
  const posts = [...(postsStore.posts || [])];
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

/**
 * 将文章数据分配到不同的列数组中
 * @returns {PostData[][]} 瀑布流分组数据
 */
const masonryGroups = computed(() => {
  const count = columnCount.value;
  const groups: PostData[][] = Array.from({ length: count }, () => []);

  articlesList.value.forEach((item, index) => {
    groups[index % count].push(item);
  });

  return groups;
});

/**
 * 计算特定卡片在原始逻辑顺序中的位置
 * @param colIndex 列索引
 * @param rowIndex 列内的行索引
 * @returns {number} 用于 Tab 导航的顺序索引 (从 1 开始)
 */
const getTabIndex = (colIndex: number, rowIndex: number): number => {
  return rowIndex * columnCount.value + colIndex + 1;
};

/**
 * 获取文章展示图
 * @param item 文章数据
 */
const getArticleImage = (item: PostData): string[] => {
  if (item.impression?.length) return item.impression;
  return theme.value?.defaultImpression ? [theme.value.defaultImpression] : [];
};

/**
 * 检查文章是否有下载内容
 * @param item 文章数据
 */
const hasDownloadableContent = (item: PostData): boolean => {
  return Array.isArray(item.external_links) && item.external_links.some((link) => link.type === "download");
};
</script>

<template>
  <div class="ArticleMasonry">
    <ClientOnly>
      <div v-for="(column, index) in masonryGroups" :key="index" class="masonry-column">
        <MaterialCard
          v-for="(item, itemIndex) in column"
          :key="item.id"
          variant="feed"
          size="m"
          color="outlined"
          :href="item.url"
          :title="item.title"
          :description="item.description"
          :date="item.date"
          :impression="getArticleImage(item)"
          :downloadable="hasDownloadableContent(item)"
          :tabindex="getTabIndex(index, itemIndex)"
        />
      </div>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/ArticleMasonry");
</style>
