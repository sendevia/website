<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import {
  useIntersectionObserver,
  useResizeObserver,
  useEventListener,
  useScroll,
} from "@vueuse/core";
import { useData } from "vitepress";
import { useScreenWidth } from "../composables/useScreenWidth";
import { isClient } from "../utils/env";

/** 全局数据与状态 */
const { page, frontmatter } = useData();
const { isAboveBreakpoint } = useScreenWidth();

/** 响应式引用 */
const pageIndicator = ref<HTMLElement | null>(null);
const headings = ref<Array<{ id: string; text: string; level: number }>>([]);
const headingsActiveId = ref<string>("");
const indicator = ref({ top: "0px", left: "0px", width: "100%", height: "0px", opacity: 0 });

/** 导航期间锁定，阻止 observer 更新活动标题 */
const isLocked = ref(false);
/** 当前处于激活区域的标题 ID 集合 */
const intersectingIds = new Set<string>();

/** 滚动容器 */
const scrollContainer = computed(() => {
  if (!isClient()) return void 0;
  return document.querySelector<HTMLElement>(".content-flow") ?? document.documentElement;
});

/** 标题 DOM 元素列表（计算属性，供 useIntersectionObserver 自动追踪） */
const headingElements = computed<HTMLElement[]>(() =>
  headings.value
    .map((h) => document.getElementById(h.id))
    .filter((el): el is HTMLElement => el !== null),
);

/**
 * 根据 IntersectionObserver 回调确定当前激活的标题。
 * 策略：选择 DOM 顺序中最后一个仍在激活区域内的标题。
 * - 向下滚动时自然过渡到下一个标题
 * - 向上滚动时回退到上一个标题
 * - 所有标题离开激活区则保持当前不变，避免闪烁
 */
const onIntersect = (entries: IntersectionObserverEntry[]) => {
  if (isLocked.value || headings.value.length === 0) return;

  for (const entry of entries) {
    if (entry.isIntersecting) {
      intersectingIds.add(entry.target.id);
    } else {
      intersectingIds.delete(entry.target.id);
    }
  }

  if (intersectingIds.size === 0) return;

  let activeId = headings.value[0].id;
  for (const h of headings.value) {
    if (intersectingIds.has(h.id)) {
      activeId = h.id;
    }
  }
  headingsActiveId.value = activeId;
};

/**
 * 使用 VueUse useIntersectionObserver 观察标题可见性。
 * 激活区域：视口顶部 20%～25% 的窄带。
 * headingElements 变化时自动重建观察。
 */
useIntersectionObserver(headingElements, onIntersect, {
  rootMargin: "-20% 0px -75% 0px",
  threshold: [0, 0.25],
});

/**
 * 使用 VueUse useScroll 监听滚动停止事件。
 * 导航锁定后等待滚动停止（idle=150ms），再解除锁定并同步标题状态。
 */
useScroll(scrollContainer, {
  idle: 150,
  onStop: () => {
    if (isLocked.value) {
      isLocked.value = false;
      intersectingIds.clear();
      computeActiveFromPosition();
      nextTick(updateIndicator);
    }
  },
});

/** 收集页面中的 h1 和 h2 标题 */
const collectHeadings = () => {
  if (!isClient()) return;
  const nodes = document.querySelectorAll("h1[id], h2[id]");
  headings.value = Array.from(nodes).map((n) => {
    const clone = n.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".AnchorLink.inline, .inline-symbol").forEach((el) => el.remove());
    return {
      id: n.id,
      text: clone.textContent?.trim() || n.id,
      level: +n.tagName.replace("H", ""),
    };
  });
};

/** 更新高亮指示器的位置和尺寸 */
const updateIndicator = () => {
  const container = pageIndicator.value;
  const id = headingsActiveId.value;
  if (!container || !id) {
    indicator.value.opacity = 0;
    return;
  }

  const activeElement = container.querySelector(
    `span[data-id="${CSS.escape(id)}"]`,
  ) as HTMLElement | null;
  if (!activeElement || !activeElement.offsetParent) {
    indicator.value.opacity = 0;
    return;
  }

  const conRect = container.getBoundingClientRect();
  const elRect = activeElement.getBoundingClientRect();

  indicator.value = {
    top: `${elRect.top - conRect.top}px`,
    left: `${elRect.left - conRect.left}px`,
    width: `${elRect.width}px`,
    height: `${elRect.height}px`,
    opacity: 0.5,
  };
};

/** 根据滚动位置计算当前应激活的标题（导航结束后兜底同步） */
const computeActiveFromPosition = () => {
  if (headings.value.length === 0) return;

  const container = document.querySelector<HTMLElement>(".content-flow");
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  const activeZone = containerRect.top + containerRect.height * 0.2;

  let activeId = headings.value[0].id;
  for (const h of headings.value) {
    const el = document.getElementById(h.id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= activeZone) {
      activeId = h.id;
    }
  }
  headingsActiveId.value = activeId;
};

/**
 * 导航到指定标题。
 * 锁定 observer 避免滚动过程中干扰，滚动结束后由 useScroll 的回调解除锁定。
 * @param id 标题 ID
 */
const navigateTo = (id: string) => {
  isLocked.value = true;
  intersectingIds.clear();
  headingsActiveId.value = id;

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }
};

/** 客户端专用初始化 */
if (isClient()) {
  useResizeObserver(pageIndicator, updateIndicator);
  useEventListener("resize", updateIndicator);
  useEventListener(["hashchange", "popstate"], () => {
    if (isAboveBreakpoint.value) {
      collectHeadings();
      nextTick(() => {
        updateIndicator();
      });
    }
  });
}

/** 断点变化：大屏时初始化，小屏时隐藏 */
watch(
  () => isAboveBreakpoint.value,
  (val) => {
    if (val) {
      collectHeadings();
      nextTick(() => {
        if (headings.value.length > 0) {
          headingsActiveId.value = headings.value[0].id;
        }
        updateIndicator();
      });
    } else {
      indicator.value.opacity = 0;
      intersectingIds.clear();
    }
  },
);

/** 活动标题变化时重算指示器位置 */
watch(headingsActiveId, () => {
  if (isAboveBreakpoint.value) nextTick(updateIndicator);
});

onMounted(() => {
  if (isClient() && isAboveBreakpoint.value) {
    collectHeadings();
    nextTick(() => {
      if (headings.value.length > 0) {
        headingsActiveId.value = headings.value[0].id;
      }
      updateIndicator();
    });
  }
});
</script>

<template>
  <div ref="pageIndicator" class="PageIndicator">
    <h3 class="article-title">{{ frontmatter.title || page.title }}</h3>
    <div
      :style="{
        top: indicator.top,
        left: indicator.left,
        width: indicator.width,
        height: indicator.height,
        opacity: indicator.opacity,
      }"
      aria-hidden="true"
      class="indicator"
    ></div>
    <div class="indicator-container">
      <span
        v-for="h in headings"
        :key="h.id"
        :data-id="h.id"
        :class="{ active: h.id === headingsActiveId }"
      >
        <StateLayer />
        <a
          :href="`#${h.id}`"
          @click.prevent="navigateTo(h.id)"
          :aria-current="h.id === headingsActiveId ? 'true' : undefined"
        >
          {{ h.text }}
        </a>
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../styles/components/PageIndicator";
</style>
