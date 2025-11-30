<script setup lang="ts">
import { computed } from "vue";
import { useGlobalData } from "../composables/useGlobalData";
import { useScreenWidthStore } from "../stores/screenWidth";
import { useSearchStateStore } from "../stores/searchState";

const { page, theme } = useGlobalData();
const screenWidthStore = useScreenWidthStore();
const searchStateStore = useSearchStateStore();

// 计算导航段落
const navSegment = computed(() => {
  const items = theme.value.navSegment;
  return Array.isArray(items) && items.length > 0 ? items : [];
});

// 规范化路径
function normalizePath(path: string): string {
  return path.replace(/(\/index)?\.(md|html)$/, "").replace(/\/$/, "");
}

// 检查链接是否为当前活动链接
function isActive(link: string): boolean {
  const currentPath = normalizePath(page.value.relativePath);
  const targetPath = normalizePath(link);

  return currentPath === targetPath.replace(/^\//, "") || (targetPath === "" && currentPath === "index");
}

// 处理fab点击事件 - 切换搜索状态
function toggleSearch(event: MouseEvent) {
  event.stopPropagation();
  searchStateStore.toggle();
}
</script>

<template>
  <nav :class="screenWidthStore.isAboveBreakpoint ? 'rail' : 'bar'">
    <button class="fab" @mousedown.prevent @click.stop="toggleSearch">
      <span>{{ searchStateStore.isSearchActive ? "close" : "search" }}</span>
    </button>
    <div class="destinations">
      <div class="segment" v-for="item in navSegment" :key="item.link" :class="isActive(item.link) ? 'active' : 'inactive'">
        <a :href="item.link">
          <div class="destination-accent">
            <div class="segment-icon">
              <span>
                {{ item.icon }}
              </span>
            </div>
          </div>
          <div class="destination-label">
            {{ item.text }}
          </div>
        </a>
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/components/NavBar");
</style>
