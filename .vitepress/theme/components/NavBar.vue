<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
import { useColorMode, useCycleList } from "@vueuse/core";
import { isClient } from "../utils/env";
import { setupWidthObserver } from "../composables/useElementWidth";
import { useData } from "vitepress";
import { useScreenWidth } from "../composables/useScreenWidth";
import { useSearchStore } from "../stores/search";
import { getCookie, setCookie } from "../utils/cookie";
import StateLayer from "./StateLayer.vue";

const { page, theme } = useData();
const { screenWidth, isAboveBreakpoint } = useScreenWidth();
const searchStore = useSearchStore();

/** 导航栏展开/折叠状态 */
const isNavExpanded = ref(false);
const cookieName = "navbar_expanded";

function initNavState() {
  if (!isClient()) return;
  const cookieValue = getCookie(cookieName);
  if (cookieValue === "true" && isAboveBreakpoint.value) {
    isNavExpanded.value = true;
  } else {
    isNavExpanded.value = false;
    if (getCookie(cookieName) !== "false") {
      setCookie(cookieName, isNavExpanded.value.toString());
    }
  }
}

watch(isNavExpanded, (val) => {
  if (isClient()) setCookie(cookieName, val.toString());
});

watch(isAboveBreakpoint, (above) => {
  if (!above) isNavExpanded.value = false;
});

/** 主题切换 */
const mode = useColorMode({
  emitAuto: true,
  storageKey: "theme_preference",
  storage: {
    getItem: (key) => getCookie(key) || "auto",
    setItem: (key, value) => setCookie(key, value),
    removeItem: (key) => setCookie(key, "auto"),
  },
  onChanged: (val, defaultHandler) => {
    defaultHandler(val);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", val === "dark");
      document.documentElement.classList.toggle("light", val === "light");
    }
  },
});

const { next: cycleNext } = useCycleList(["auto", "light", "dark"] as const, {
  initialValue: mode.value as "auto" | "light" | "dark",
});

const THEME_MAP = {
  auto: { icon: "brightness_auto", label: "跟随系统" },
  light: { icon: "light_mode", label: "亮色模式" },
  dark: { icon: "dark_mode", label: "深色模式" },
} as const;

const currentIcon = computed(() => THEME_MAP[mode.value as keyof typeof THEME_MAP].icon);
const currentLabel = computed(() => THEME_MAP[mode.value as keyof typeof THEME_MAP].label);

/** 标签动画状态 */
const isLabelAnimating = ref(false);
/** 清理函数列表 */
const cleanupFunctions: Array<() => void> = [];
/** 已观察元素集合 */
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
    [el],
  );
  cleanupFunctions.push(cleanup);
}

/** 计算导航分段数据 */
const navSegment = computed(() => {
  const items = theme.value.navSegment;
  return Array.isArray(items) && items.length > 0 ? items : [];
});

/** 计算导航栏容器类名 */
const navClass = computed(() => {
  let baseClass = "";
  if (screenWidth.value > 840) {
    baseClass = "rail";
  } else if (screenWidth.value > 600) {
    baseClass = "bar horizontal";
  } else {
    baseClass = "bar vertical";
  }
  const expansionClass = isNavExpanded.value ? "expanded" : "collapsed";
  return `${baseClass} ${expansionClass}`;
});

/** 计算标签类名 */
const labelClass = computed(() => [
  isNavExpanded.value ? "right" : "bottom",
  isLabelAnimating.value ? "animating" : "",
]);

/**
 * 规范化路径，去除后缀及末尾斜杠
 * @param path 原始路径
 */
function normalizePath(path: string): string {
  return path.replace(/(\/index)?\.(md|html)$/, "").replace(/\/$/, "");
}

/**
 * 检查链接是否为当前活动页面的链接
 * @param link 目标链接
 */
function isActive(link: string): boolean {
  const currentPath = normalizePath(page.value.relativePath);
  const targetPath = normalizePath(link);
  return (
    currentPath === targetPath.replace(/^\//, "") || (targetPath === "" && currentPath === "index")
  );
}

/**
 * 检查链接是否为外部链接
 * @param link 目标链接
 */
function isExternalLink(link: string): boolean {
  return /^https?:\/\//.test(link);
}

/**
 * 键盘导航：空格键触发链接跳转
 * @param event 键盘事件
 */
function handleNavKeydown(event: KeyboardEvent) {
  if (event.key === " ") {
    event.preventDefault();
    (event.currentTarget as HTMLAnchorElement).click();
  }
}

function toggleSearch() {
  searchStore.toggle();
}

/**
 * 切换导航栏展开状态
 * @param event 鼠标事件
 */
function toggleNav(event: MouseEvent) {
  event.stopPropagation();
  if (isAboveBreakpoint.value) {
    isNavExpanded.value = !isNavExpanded.value;
  }
}

function toggleTheme(event: MouseEvent) {
  event.stopPropagation();
  mode.value = cycleNext();
}

/**
 * 设置 label 引用并初始化观察器
 * @param el DOM 元素
 * @param parentSelector 父级选择器
 */
function setLabelRef(el: unknown, parentSelector: string) {
  if (el instanceof HTMLElement) {
    observeWidth(el, parentSelector);
  }
}

function onAnimationEnd() {
  isLabelAnimating.value = false;
}

/** 监听导航栏展开状态，触发重绘和动画 */
watch(isNavExpanded, () => {
  isLabelAnimating.value = true;
  nextTick(() => {
    window.dispatchEvent(new Event("resize"));
  });
});

if (isClient()) {
  onMounted(() => {
    initNavState();
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
      <MaterialButton
        pattern="icon-button"
        color="text"
        aria-label="切换导航栏宽度"
        @click="toggleNav"
        >{{ isNavExpanded ? "menu_open" : "menu" }}</MaterialButton
      >
      <button class="fab" aria-label="搜索" @mousedown.prevent @click.stop="toggleSearch">
        <StateLayer />
        <span>{{ searchStore.isSearchActive ? "close" : "search" }}</span>
        <p :ref="(el) => setLabelRef(el, '.fab')">搜索</p>
      </button>
    </div>

    <div class="destinations">
      <div
        class="segment"
        v-for="item in navSegment"
        :key="item.link"
        :class="isActive(item.link) ? 'active' : 'inactive'"
      >
        <a
          :href="item.link"
          :target="isExternalLink(item.link) ? '_blank' : undefined"
          :aria-current="isActive(item.link) ? 'page' : undefined"
          @keydown="handleNavKeydown"
        >
          <div class="accent">
            <div class="icon">
              <span>{{ item.icon }}</span>
            </div>
          </div>
          <p
            class="label"
            :class="labelClass"
            :ref="(el) => setLabelRef(el, '.segment')"
            @animationend="onAnimationEnd"
          >
            {{ item.text }}
          </p>
        </a>
      </div>
    </div>

    <div class="actions">
      <MaterialButton
        pattern="icon-button"
        class="theme-btn"
        size="m"
        color="text"
        :aria-label="currentLabel"
        :title="currentLabel"
        @click="toggleTheme"
        >{{ currentIcon }}</MaterialButton
      >
    </div>
  </nav>
</template>

<style lang="scss">
@use "../styles/components/NavBar";
</style>
