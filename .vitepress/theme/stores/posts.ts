import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { data as postsData, type PostData } from "./posts.data";

export const usePostStore = defineStore("posts", () => {
  const posts = ref<PostData[]>(postsData);

  // 最新文章
  const latestPosts = computed(() => posts.value.slice(0, 5));

  // 获取所有唯一的 Tags
  const allTags = computed(() => {
    const tagSet = new Set<string>();
    posts.value.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  });

  // 获取所有唯一的 Categories
  const allCategories = computed(() => {
    const catSet = new Set<string>();
    posts.value.forEach((p) => p.categories.forEach((c) => catSet.add(c)));
    return Array.from(catSet);
  });

  // 根据 URL 获取文章
  const getPostByUrl = (url: string) => {
    const target = url.replace(/(\.html|\/)$/, "");
    return posts.value.find((p) => p.url.replace(/(\.html|\/)$/, "") === target);
  };

  // 根据 ID 获取文章
  const getPostById = (id: string) => {
    return posts.value.find((p) => p.id === id);
  };

  // 根据 Tag 获取文章列表
  const getPostsByTag = (tag: string) => {
    return posts.value.filter((p) => p.tags.includes(tag));
  };

  // 根据 Category 获取文章列表
  const getPostsByCategory = (category: string) => {
    return posts.value.filter((p) => p.categories.includes(category));
  };

  return {
    posts,
    latestPosts,
    allTags,
    allCategories,
    getPostByUrl,
    getPostById,
    getPostsByTag,
    getPostsByCategory,
  };
});
