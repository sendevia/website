<template>
  <div class="search-posts-page">
    <h1>搜索文章</h1>
    <input v-model="query" placeholder="输入关键词..." class="search-input" />
    <div v-if="filteredPosts.length">
      <div v-for="post in filteredPosts" :key="post.url">
        <a :href="post.url">{{ post.title }}</a>
        <span v-if="post.date"> - {{ post.date }}</span>
      </div>
    </div>
    <p v-else>没有找到相关文章。</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAllPosts } from "../composables/useAllPosts";

const posts = useAllPosts(true);
const query = ref("");

const filteredPosts = computed(() => {
  if (!query.value) return posts.value;
  const q = query.value.toLowerCase();
  return posts.value.filter((post) => post.title.toLowerCase().includes(q) || (post.content && post.content.toLowerCase().includes(q)));
});
</script>
