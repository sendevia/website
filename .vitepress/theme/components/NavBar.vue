<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
import { isClient } from "../utils/env";
import { setupWidthObserver } from "../composables/useElementWidth";
import { useGlobalData } from "../composables/useGlobalData";
import { useNavStateStore } from "../stores/navState";
import { useScreenWidthStore } from "../stores/screenWidth";
import { useSearchStateStore } from "../stores/searchState";

const { page, theme } = useGlobalData();
const screenWidthStore = useScreenWidthStore();
const searchStateStore = useSearchStateStore();
const navStateStore = useNavStateStore();

const isLabelAnimating = ref(false);
const cleanupFunctions: Array<() => void> = [];
const observedElements = new WeakSet<HTMLElement>();

/**
 * 设置元素宽度观察器
 * @param el 目标元素
 * @param parentSelector 父级选择器
 */
function observeWidth(el: HTMLElement, parentSelector: string) {
  if (observedElements.has(el)) return;
  observedElements.add(el);

  const cleanup = setupWidthObserver(
    {
      selector: "", // 使用 targetElements 时忽略此项
      variableName: "label-width",
      parentSelector,
      ignoreParentLimit: true, // 允许撑开父级
    },
    [el]
  );
  cleanupFunctions.push(cleanup);
}

// 计算 Segments
const navSegment = computed(() => {
  const items = theme.value.navSegment;
  return Array.isArray(items) && items.length > 0 ? items : [];
});

const navClass = computed(() => {
  let baseClass = "";
  if (screenWidthStore.screenWidth > 840) {
    baseClass = "rail";
  } else if (screenWidthStore.screenWidth > 600) {
    baseClass = "bar horizontal";
  } else {
    baseClass = "bar vertical";
  }
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
 * 设置 label 引用并初始化观察器
 * @param el
 * @param parentSelector
 */
function setLabelRef(el: any, parentSelector: string) {
  if (el instanceof HTMLElement) {
    observeWidth(el, parentSelector);
  }
}

/**
 * 处理动画结束
 * @param el
 */
function onAnimationEnd(el: EventTarget | null) {
  if (el) {
    isLabelAnimating.value = false;
  }
}

/** 监听状态变化，触发宽度计算 */
watch(
  () => [navStateStore.isNavExpanded],
  () => {
    isLabelAnimating.value = true;
    nextTick(() => {
      window.dispatchEvent(new Event("resize"));
    });
  }
);

if (isClient()) {
  onMounted(() => {
    screenWidthStore.init();
    navStateStore.init();

    nextTick(() => {
      window.dispatchEvent(new Event("resize"));
    });
  });

  onBeforeUnmount(() => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  });
}
</script>

<template>
  <nav class="NavBar" :class="navClass">
    <div class="fab-container">
      <MaterialButton color="text" :icon="navStateStore.isNavExpanded ? 'menu_open' : 'menu'" @click="toggleNav" />
      <button class="fab" @mousedown.prevent @click.stop="toggleSearch">
        <span>{{ searchStateStore.isSearchActive ? "close" : "search" }}</span>
        <p :ref="(el) => setLabelRef(el, '.fab')">搜索</p>
      </button>
    </div>

    <div class="destinations">
      <div class="segment" v-for="item in navSegment" :key="item.link" :class="isActive(item.link) ? 'active' : 'inactive'">
        <a :href="item.link" :target="isExternalLink(item.link) ? '_blank' : undefined">
          <div class="accent">
            <div class="icon">
              <span>{{ item.icon }}</span>
            </div>
          </div>
          <p
            class="label"
            :class="labelClass"
            :ref="(el) => setLabelRef(el, '.segment')"
            @animationend="onAnimationEnd($event.target)"
          >
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
