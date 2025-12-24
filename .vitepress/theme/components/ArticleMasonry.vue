<script setup lang="ts">
import { usePostStore, type PostData } from "../stores/posts";
import { useGlobalData } from "../composables/useGlobalData";
import { computed, onMounted, onUnmounted, ref } from "vue";

const postsStore = usePostStore();
const articlesList = computed(() => postsStore.posts || []);
const { theme } = useGlobalData();

// 定义断点配置：屏幕宽度 -> 列数
const breakpoints = {
  1600: 3,
  1200: 3,
  840: 2,
  0: 1,
};

const columnCount = ref(2);

// 根据屏幕宽度更新列数
const updateColumnCount = () => {
  const width = window.innerWidth;
  const match = Object.keys(breakpoints)
    .map(Number)
    .sort((a, b) => b - a)
    .find((bp) => width > bp);

  columnCount.value = match !== undefined ? breakpoints[match as keyof typeof breakpoints] : 1;
};

// 将文章列表拆分成 N 个数组
const masonryGroups = computed(() => {
  const groups: PostData[][] = Array.from({ length: columnCount.value }, () => []);

  articlesList.value.forEach((item, index) => {
    const groupIndex = index % columnCount.value;
    groups[groupIndex].push(item);
  });

  return groups;
});

// 图片处理逻辑
const getArticleImage = (item: PostData): string[] => {
  if (item.impression && item.impression.length > 0) {
    return item.impression;
  }

  const themeValue = theme.value;
  if (themeValue?.defaultImpression) {
    return [themeValue.defaultImpression];
  }

  return [];
};

// 检查是否有可下载内容
const hasDownloadableContent = (item: PostData): boolean => {
  if (!item.external_links || !Array.isArray(item.external_links)) {
    return false;
  }

  return item.external_links.some((link) => link.type === "download");
};

onMounted(() => {
  updateColumnCount();
  window.addEventListener("resize", updateColumnCount);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateColumnCount);
});
</script>

<template>
  <div class="ArticleMasonry">
    <div class="masonry-column" v-for="(column, index) in masonryGroups" :key="index">
      <MaterialCard
        v-for="item in column"
        variant="feed"
        size="m"
        color="outlined"
        :key="item.id"
        :href="item.url"
        :title="item.title"
        :description="item.description"
        :date="item.date"
        :impression="getArticleImage(item)"
        :downloadable="hasDownloadableContent(item)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/ArticleMasonry");
</style>
