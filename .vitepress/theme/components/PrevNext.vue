<script setup lang="ts">
import { computed } from "vue";
import { useGlobalData } from "../composables/useGlobalData";
import { usePostStore } from "../stores/posts";

const { page } = useGlobalData();

const postsStore = usePostStore();
const postsRef = computed(() => postsStore.posts);

function normalize(u: string | undefined | null) {
  if (!u) return "";

  try {
    const url = String(u);
    const withoutOrigin = url.replace(/^https?:\/\/[^/]+/, "");
    return withoutOrigin.replace(/(?:\.html)?\/?$/, "");
  } catch (e) {
    return String(u);
  }
}

const currentCandidates = computed(() => {
  const p = page.value as any;
  const cand: string[] = [];

  ["path", "regularPath", "url", "relativePath", "filePath", "_file"].forEach((k) => {
    if (p && p[k]) cand.push(String(p[k]));
  });

  if (p && p.frontmatter) {
    if (p.frontmatter.permalink) cand.push(String(p.frontmatter.permalink));
    if (p.frontmatter.slug) cand.push(String(p.frontmatter.slug));
  }

  const filePath = p && (p.filePath || p._file || p.relativePath || "");
  if (filePath && typeof filePath === "string") {
    const m = filePath.match(/posts\/(.+?)\.mdx?$/) || filePath.match(/posts\/(.+?)\.md$/);
    if (m && m[1]) {
      const name = m[1];
      cand.push(`/posts/${encodeURIComponent(name)}`);
      cand.push(`/posts/${encodeURIComponent(name)}.html`);
    }
  }

  if (p && p.title) cand.push(String(p.title));

  return Array.from(new Set(cand.map((c) => normalize(c))));
});

const currentIndex = computed(() => {
  const posts = postsRef.value || [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const postNorm = normalize(post.url);

    for (const c of currentCandidates.value) {
      if (!c) continue;
      if (postNorm === c) return i;
      if (postNorm === c + "") return i;
    }

    const pTitle = (page.value as any)?.title;
    if (pTitle && post.title && String(post.title) === String(pTitle)) return i;
  }

  return -1;
});

const prev = computed(() => {
  const posts = postsRef.value || [];
  const idx = currentIndex.value;
  if (idx > 0) return posts[idx - 1];
  return null;
});

const next = computed(() => {
  const posts = postsRef.value || [];
  const idx = currentIndex.value;
  if (idx >= 0 && idx < posts.length - 1) return posts[idx + 1];
  return null;
});
</script>

<template>
  <div class="PrevNext">
    <a class="prev" :href="prev.url" v-if="prev">
      <span class="label">上一篇</span>
      <span class="title">{{ prev.title }}</span>
    </a>
    <a class="next" :href="next.url" v-if="next">
      <span class="label">下一篇</span>
      <span class="title">{{ next.title }}</span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/PrevNext");
</style>
