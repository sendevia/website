<script setup lang="ts">
import { computed } from "vue";
import { useGlobalData } from "../composables/useGlobalData";
import { usePostStore } from "../stores/posts";

const { page } = useGlobalData();
const postsStore = usePostStore();

/**
 * 规范化路径字符串，移除 Origin、.html 后缀及末尾斜杠
 * @param {string | undefined | null} u 原始路径或 URL
 * @returns {string} 处理后的规范化路径
 */
function normalize(u: string | undefined | null): string {
  if (!u) return "";
  try {
    const url = String(u);
    const withoutOrigin = url.replace(/^https?:\/\/[^/]+/, "");
    return withoutOrigin.replace(/(?:\.html)?\/?$/, "");
  } catch {
    return String(u);
  }
}

/**
 * 计算当前页面的潜在匹配标识符（路径、Slug、文件名等）
 * @returns {ComputedRef<string[]>} 规范化后的候选标识符数组
 */
const currentCandidates = computed(() => {
  const p = page.value as any;
  if (!p) return [];

  const cand = new Set<string>();

  // 基础属性收集
  ["path", "regularPath", "url", "relativePath", "filePath", "_file"].forEach((k) => {
    if (p[k]) cand.add(String(p[k]));
  });

  // Frontmatter 标识收集
  if (p.frontmatter) {
    if (p.frontmatter.permalink) cand.add(String(p.frontmatter.permalink));
    if (p.frontmatter.slug) cand.add(String(p.frontmatter.slug));
  }

  // 针对博客文章路径的特殊解析
  const filePath = p.filePath || p._file || p.relativePath || "";
  if (filePath) {
    const match = filePath.match(/posts\/(.+?)\.mdx?$/);
    if (match?.[1]) {
      const name = match[1];
      cand.add(`/posts/${encodeURIComponent(name)}`);
      cand.add(`/posts/${encodeURIComponent(name)}.html`);
    }
  }

  // 标题作为保底匹配项
  if (p.title) cand.add(String(p.title));

  return Array.from(cand).map((c) => normalize(c));
});

/**
 * 在文章列表中查找当前页面的索引
 * @returns {ComputedRef<number>} 当前文章的索引，未找到返回 -1
 */
const currentIndex = computed(() => {
  const posts = postsStore.posts || [];
  const candidates = currentCandidates.value;
  const pTitle = (page.value as any)?.title;

  return posts.findIndex((post) => {
    const postNorm = normalize(post.url);
    // 路径/标识符匹配
    if (candidates.some((c) => c && postNorm === c)) return true;
    // 标题匹配（保底）
    if (pTitle && post.title && String(post.title) === String(pTitle)) return true;
    return false;
  });
});

/** 上一篇文章对象 */
const prev = computed(() => {
  const idx = currentIndex.value;
  return idx > 0 ? postsStore.posts[idx - 1] : null;
});

/** 下一篇文章对象 */
const next = computed(() => {
  const idx = currentIndex.value;
  return idx >= 0 && idx < postsStore.posts.length - 1 ? postsStore.posts[idx + 1] : null;
});
</script>

<template>
  <div class="PrevNext">
    <a v-if="prev" class="prev" :href="prev.url">
      <span class="label">上一篇</span>
      <span class="title">{{ prev.title }}</span>
    </a>
    <a v-if="next" class="next" :href="next.url">
      <span class="label">下一篇</span>
      <span class="title">{{ next.title }}</span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
/* 引用现有的导航组件样式 */
@include meta.load-css("../styles/components/PrevNext");
</style>
