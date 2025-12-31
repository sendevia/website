<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, reactive } from "vue";
import { useRafFn } from "@vueuse/core";
import { useGlobalData } from "../composables/useGlobalData";
import { isClient } from "../utils/env";

// 解析 CSS 时间变量，返回毫秒数
const parseTimeToken = (cssVar: string, defaultVal: number): number => {
  if (!isClient()) return defaultVal;
  const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  if (!val) return defaultVal;

  const num = parseFloat(val);
  if (isNaN(num)) return defaultVal;

  if (val.endsWith("s") && !val.endsWith("ms")) return num * 1000;
  return num;
};

const CSS_TOKENS = {
  DURATION: "", // 自动轮播间隔
  ANIM_NORMAL: "--md-sys-motion-spring-slow-spatial-duration", // 正常切换速度
  ANIM_FAST: "--md-sys-motion-spring-fast-spatial-duration", // 快速跳转速度
};

// 默认配置 (回退值)
const config = reactive({
  duration: 5000,
  animNormal: 600,
  animFast: 300,
});

const { frontmatter, theme } = useGlobalData();

// 数据源处理
const rawImgList = computed<string[]>(() => {
  const imp = frontmatter.value.impression;
  const list = Array.isArray(imp) ? imp : imp ? [imp] : [theme.value.defaultImpression];
  return list.filter(Boolean);
});

const hasMultiple = computed(() => rawImgList.value.length > 1);
const totalCount = computed(() => rawImgList.value.length);
const blobCache = reactive(new Map<string, string>());

// 并行加载图片并转换为 Blob URL
const cacheImages = async (urls: string[]) => {
  if (!isClient()) return;

  // 筛选未缓存的 URL
  const uncachedUrls = urls.filter((url) => !blobCache.has(url));
  if (uncachedUrls.length === 0) return;

  // 使用 Promise.all 并行请求，提高加载速度
  await Promise.all(
    uncachedUrls.map(async (url) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        blobCache.set(url, objectUrl);
      } catch (e) {
        console.warn(`[Carousel] Load failed: ${url}`, e);
        blobCache.set(url, url); // 失败回退
      }
    })
  );
};

// 清理 Blob URL 缓存
const clearCache = () => {
  blobCache.forEach((url) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  });
  blobCache.clear();
};

// 状态管理
const virtualIndex = ref(0);
const remainingTime = ref(config.duration);
const isHovering = ref(false);
const isFastForwarding = ref(false);
const isAnimating = ref(false);

// 核心计算逻辑
const currentRealIndex = computed(() => {
  if (totalCount.value === 0) return 0;
  return ((virtualIndex.value % totalCount.value) + totalCount.value) % totalCount.value;
});

const animDuration = computed(() => (isFastForwarding.value ? config.animFast : config.animNormal));

const progress = computed(() => {
  if (!hasMultiple.value) return 0;
  if (isFastForwarding.value) return 100;
  return ((config.duration - remainingTime.value) / config.duration) * 100;
});

// 计算槽位状态
const slotStates = computed(() => {
  if (!hasMultiple.value) return [];

  // 固定 4 个槽位逻辑
  return [0, 1, 2, 3].map((slotId) => {
    // 相对位置计算：0(当前), 1(下个), 2(等待), 3(上个)
    const relativePos = (slotId - (virtualIndex.value % 4) + 4) % 4;

    // 状态映射表
    const stateMap = [
      { cls: "current", order: 2, offset: 0 },
      { cls: "next", order: 3, offset: 1 },
      { cls: "standby", order: 4, offset: 2 },
      { cls: "previous", order: 1, offset: -1 },
    ];

    const { cls, order, offset } = stateMap[relativePos];
    const imgIndex = (((currentRealIndex.value + offset) % totalCount.value) + totalCount.value) % totalCount.value;
    const rawUrl = rawImgList.value[imgIndex];

    return {
      id: slotId,
      className: cls,
      imgUrl: blobCache.get(rawUrl) || rawUrl,
      order,
    };
  });
});

// 动作控制
const step = async (dir: 1 | -1) => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  virtualIndex.value += dir;

  // 这里的 duration 需要动态读取当前的 config
  await new Promise((resolve) => setTimeout(resolve, animDuration.value));
  isAnimating.value = false;
};

// 使用 useRafFn 进行倒计时
const { pause, resume } = useRafFn(
  ({ delta }) => {
    if (!hasMultiple.value || isAnimating.value || isFastForwarding.value || isHovering.value) return;
    remainingTime.value -= delta;
    if (remainingTime.value <= 0) {
      step(1).then(() => (remainingTime.value = config.duration));
    }
  },
  { immediate: false }
);

// 导航控制
const handleNav = async (dir: 1 | -1) => {
  if (isFastForwarding.value || !hasMultiple.value || isAnimating.value) return;
  await step(dir);
  remainingTime.value = config.duration;
};

// 快速跳转到指定索引
const jumpTo = async (targetIdx: number) => {
  if (!hasMultiple.value || targetIdx === currentRealIndex.value || isFastForwarding.value || isAnimating.value) return;
  isFastForwarding.value = true;

  // 简单计算最短路径方向
  const dir = targetIdx > currentRealIndex.value ? 1 : -1;

  const runFast = async () => {
    await step(dir);
    if (currentRealIndex.value !== targetIdx) await runFast();
    else {
      isFastForwarding.value = false;
      remainingTime.value = config.duration;
    }
  };
  await runFast();
};

// 初始化配置
const initConfig = () => {
  config.duration = parseTimeToken(CSS_TOKENS.DURATION, config.duration);
  config.animNormal = parseTimeToken(CSS_TOKENS.ANIM_NORMAL, config.animNormal);
  config.animFast = parseTimeToken(CSS_TOKENS.ANIM_FAST, config.animFast);

  // 重置倒计时以匹配新时长
  remainingTime.value = config.duration;
};

watch(
  rawImgList,
  async (newList) => {
    remainingTime.value = config.duration;
    virtualIndex.value = 0;
    isAnimating.value = false;
    isFastForwarding.value = false;
    pause();

    // 并行预加载
    await cacheImages(newList);

    if (hasMultiple.value && isClient()) resume();
  },
  { immediate: true }
);

onMounted(() => {
  if (isClient()) {
    initConfig();
    if (hasMultiple.value) resume();
  }
});

onUnmounted(() => {
  clearCache();
});
</script>

<template>
  <header class="Header" @mouseenter="hasMultiple && (isHovering = true)" @mouseleave="hasMultiple && (isHovering = false)">
    <div class="carousel-container" :impression-color="frontmatter.color">
      <template v-if="hasMultiple">
        <div class="stage" :style="{ '--anim-duration': `${animDuration}ms` }">
          <div
            v-for="slot in slotStates"
            :key="slot.id"
            class="item"
            :class="slot.className"
            :style="{
              backgroundImage: `url('${slot.imgUrl}')`,
              order: slot.order,
            }"
          ></div>
        </div>

        <div class="progress-ring">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--md-sys-color-tertiary-container)" stroke-width="5" />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="var(--md-sys-color-tertiary)"
              stroke-width="5"
              stroke-linecap="round"
              :style="{
                strokeDasharray: `${2 * Math.PI * 10}`,
                strokeDashoffset: `${2 * Math.PI * 10 * (1 - progress / 100)}`,
                transition: isFastForwarding
                  ? 'none'
                  : 'stroke-dashoffset var(--md-sys-motion-spring-fast-spatial-duration) linear',
              }"
            />
          </svg>
        </div>

        <div class="controls">
          <div class="prev" title="上一张" @click="handleNav(-1)"></div>
          <div class="next" title="下一张" @click="handleNav(1)"></div>
        </div>

        <div class="indicators">
          <button
            v-for="(_, idx) in rawImgList"
            :key="idx"
            class="dot"
            :class="{ active: currentRealIndex === idx }"
            tabindex="-1"
            @click="jumpTo(idx)"
          ></button>
        </div>
      </template>
      <template v-else>
        <div class="single" :style="{ backgroundImage: `url('${blobCache.get(rawImgList[0]) || rawImgList[0]}')` }"></div>
      </template>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Header");
</style>
