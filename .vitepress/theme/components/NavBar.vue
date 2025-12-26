<!-- todo: 细分小尺寸设备上导航栏状态 -->

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { useGlobalData } from "../composables/useGlobalData";
import { useScreenWidthStore } from "../stores/screenWidth";
import { useSearchStateStore } from "../stores/searchState";
import { useNavStateStore } from "../stores/navState";

const { page, theme } = useGlobalData();
const screenWidthStore = useScreenWidthStore();
const searchStateStore = useSearchStateStore();
const navStateStore = useNavStateStore();

const fabParagraphRef = ref<HTMLParagraphElement>();
const isLabelAnimating = ref(false);
const labelRefs = ref<HTMLParagraphElement[]>([]);
const labelWidths = ref<Record<string, number>>({});

// 计算 Segments
const navSegment = computed(() => {
  const items = theme.value.navSegment;
  return Array.isArray(items) && items.length > 0 ? items : [];
});

const navClass = computed(() => {
  const baseClass = screenWidthStore.isAboveBreakpoint ? "rail" : "bar";
  const expansionClass = navStateStore.isNavExpanded ? "expanded" : "collapsed";
  return `${baseClass} ${expansionClass}`;
});

const labelClass = computed(() => [
  navStateStore.isNavExpanded ? "right" : "bottom",
  isLabelAnimating.value ? "animating" : "",
]);

/**
 * 规范化路径，去除 /index.md、.md、.html 后缀及末尾斜杠
 * @param path
 */
function normalizePath(path: string): string {
  return path.replace(/(\/index)?\.(md|html)$/, "").replace(/\/$/, "");
}

/**
 * 检查链接是否为当前活动页面的链接
 * @param link
 */
function isActive(link: string): boolean {
  const currentPath = normalizePath(page.value.relativePath);
  const targetPath = normalizePath(link);
  return currentPath === targetPath.replace(/^\//, "") || (targetPath === "" && currentPath === "index");
}

/**
 * 检查链接是否为外部链接
 * @param link
 */
function isExternalLink(link: string): boolean {
  return /^https?:\/\//.test(link);
}

/**
 * 切换搜索栏状态
 * @param event
 */
function toggleSearch(event: MouseEvent) {
  event.stopPropagation();
  searchStateStore.toggle();
}

/**
 * 切换导航栏状态
 * @param event
 */
function toggleNav(event: MouseEvent) {
  event.stopPropagation();
  // 暂时只有在屏幕宽度大于断点时才能切换导航栏状态
  if (screenWidthStore.isAboveBreakpoint) {
    navStateStore.toggle();
  }
}

/**
 * 更新元素宽度
 * @param element
 * @param containerSelector 容器选择器
 */
function updateElementWidth(element: HTMLElement | null | undefined, containerSelector: string) {
  if (!element) return;

  const width = element.offsetWidth;
  const container = element.closest(containerSelector) as HTMLElement;

  if (container) {
    container.style.setProperty("--label-width", `${width}px`);
    labelWidths.value[containerSelector] = width;
  }

  return width;
}

/**
 * 批量更新所有元素宽度
 */
function updateAllWidths() {
  // 更新 fab 的 label 宽度
  const fabWidth = updateElementWidth(fabParagraphRef.value, ".fab");

  // 更新所有 segment 的 label 宽度
  labelRefs.value.forEach((label) => {
    updateElementWidth(label, ".segment");
  });

  return { fabWidth };
}

/**
 * 设置 label 引用
 * @param el
 * @param index
 */
function setLabelRef(el: any, index: number) {
  if (el) {
    labelRefs.value[index] = el;

    // 添加 animationend 事件监听
    el.addEventListener("animationend", () => {
      isLabelAnimating.value = false;
    });

    // 初始更新宽度
    nextTick(() => updateElementWidth(el, ".segment"));
  }
}

onMounted(() => {
  screenWidthStore.init();
  navStateStore.init();
  nextTick(updateAllWidths);
});

// 监听屏幕宽度变化，更新搜索状态和 label 宽度
watch(
  () => searchStateStore.isSearchActive,
  () => {
    nextTick(() => updateElementWidth(fabParagraphRef.value, ".fab"));
  }
);

// 监听导航栏展开状态变化，更新 label 宽度并触发动画
watch(
  () => navStateStore.isNavExpanded,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      isLabelAnimating.value = true;
      nextTick(() => {
        labelRefs.value.forEach((label) => {
          updateElementWidth(label, ".segment");
        });
      });
    }
  }
);
</script>

<template>
  <nav class="NavBar" :class="navClass">
    <div>
      <MaterialButton color="text" icon="menu" @click="toggleNav" />
      <button
        class="fab"
        @mousedown.prevent
        @click.stop="toggleSearch"
        :style="{ '--label-width': `${labelWidths['.fab'] || 0}px` }"
      >
        <span>{{ searchStateStore.isSearchActive ? "close" : "search" }}</span>
        <p ref="fabParagraphRef">搜索</p>
      </button>
    </div>

    <div class="destinations">
      <div
        class="segment"
        v-for="(item, index) in navSegment"
        :key="item.link"
        :class="isActive(item.link) ? 'active' : 'inactive'"
      >
        <a :href="item.link" :target="isExternalLink(item.link) ? '_blank' : undefined">
          <div class="accent">
            <div class="icon">
              <span>{{ item.icon }}</span>
            </div>
          </div>
          <p class="label" :class="labelClass" :ref="(el) => setLabelRef(el, index)">
            {{ item.text }}
          </p>
        </a>
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
@use "sass:meta";
@include meta.load-css("../styles/components/NavBar");
</style>
