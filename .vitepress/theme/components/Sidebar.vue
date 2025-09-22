<template>
  <nav id="navigation" spec="rail">
    <ul id="navigation-destinations">
      <li v-for="item in navItems" :key="item.link" :class="isActive(item.link) ? 'navigation-segment-active' : 'navigation-segment-inactive'">
        <a :href="item.link">
          <div class="navigation-destination-accent">
            <div class="navigation-segment-icon">
              <span>
                {{ item.icon }}
              </span>
            </div>
          </div>
          <div class="navigation-destination-label">
            {{ item.text }}
          </div>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";

import { useGlobalData } from "../composables/useGlobalData";
const { page } = useGlobalData();

const navItems = computed(() => [
  { text: "首页", icon: "home", link: "/" },
  { text: "所有文章", icon: "list", link: "/posts" },
  { text: "搜索文章", icon: "search", link: "/search.html" },
  { text: "Markdown 示例", icon: "counter_1", link: "/posts/markdown-examples" },
  { text: "API 示例", icon: "counter_2", link: "/posts/api-examples" },
]);

function isActive(link: string) {
  const current = page.value.relativePath.replace(/(\/index)?\.md$/, "");
  const target = link.replace(/\/$/, "").replace(/\.html$/, "");
  return current === target.replace(/^\//, "") || (target === "" && current === "index");
}
</script>
