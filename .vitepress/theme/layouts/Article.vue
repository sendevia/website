<template>
  <article class="article-layout">
    <header>
      <h1>{{ frontmatter.title }}</h1>
      <p v-if="frontmatter.date">发表于：{{ frontmatter.date }}</p>
    </header>
    <section>
      <Content />
    </section>
  </article>
</template>

<script setup lang="ts">
import { useGlobalData } from "../composables/useGlobalData";
const { frontmatter } = useGlobalData();
</script>
