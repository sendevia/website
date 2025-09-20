<script setup lang="ts">
import { useData } from "vitepress";
import Sidebar from "./components/Sidebar.vue";
const { site, page, frontmatter } = useData();
</script>

<template>
  <div id="main-layout" spec="feed">
    <Sidebar />
    <div id="main-layout-content-flow">
      <div id="main-layout-content-filler">
        <div v-if="frontmatter.home">
          <h1>{{ site.title }}</h1>
          <p>{{ site.description }}</p>
          <ul>
            <li><a href="/markdown-examples.html">Markdown Examples</a></li>
            <li><a href="/api-examples.html">API Examples</a></li>
          </ul>
        </div>
        <div v-else-if="page.isNotFound">
          <a href="/">Home</a>
          <p>404!</p>
        </div>
        <div v-else>
          <a href="/">Home</a>
          <Content />
        </div>
      </div>
    </div>
  </div>
</template>
