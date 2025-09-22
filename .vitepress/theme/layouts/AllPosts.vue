<template>
  <div class="all-posts-page">
    <h1>所有文章</h1>
    <ul>
      <li v-for="post in posts" :key="post.url">
        <a :href="post.url">{{ post.title }}</a>
        <span v-if="post.date"> - {{ post.date }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useAllPosts } from "../composables/useAllPosts";
const posts = useAllPosts();
</script>
