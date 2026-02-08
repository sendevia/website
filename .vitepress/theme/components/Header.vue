<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, reactive } from "vue";
import { useRafFn, useElementHover } from "@vueuse/core";
import { useGlobalData } from "../composables/useGlobalData";
import { isClient } from "../utils/env";

/**
 * 配置与状态管理
 * CSS_TOKENS: 对应样式表中的时间变量名
 */
const CSS_TOKENS = {
  DURATION: "--carousel-duration", // 自动轮播间隔
  ANIM_NORMAL: "--md-sys-motion-spring-slow-spatial-duration", // 正常切换速度
  ANIM_FAST: "--md-sys-motion-spring-fast-spatial-duration", // 快速追赶速度
};

/** 默认配置 */
const config = reactive({
  duration: 5000,
  animNormal: 600,
  animFast: 300,
});

const { frontmatter, theme, page } = useGlobalData();
const headerRef = ref<HTMLElement | null>(null);
const isHovering = useElementHover(headerRef);

/** 图片数据与缓存 */
const blobCache = reactive(new Map<string, string>());
const virtualIndex = ref(0);
const remainingTime = ref(config.duration);
const isFastForwarding = ref(false);
const isAnimating = ref(false);

/** 计算当前应该显示的文章印象图列表 */
const rawImgList = computed<string[]>(() => {
  const imp = frontmatter.value.impression;
  const list = Array.isArray(imp) ? imp : imp ? [imp] : [theme.value.defaultImpression];
  return list.filter(Boolean);
});

const totalCount = computed(() => rawImgList.value.length);
const hasMultiple = computed(() => totalCount.value > 1);
const animDuration = computed(() => (isFastForwarding.value ? config.animFast : config.animNormal));

/** 计算环形进度条百分比 */
const progress = computed(() => {
  if (!hasMultiple.value) return 0;
  if (isFastForwarding.value) return 100;
  return ((config.duration - remainingTime.value) / config.duration) * 100;
});

/** 获取真实的索引（对总数取模） */
const currentRealIndex = computed(() => {
  if (totalCount.value === 0) return 0;
  return ((virtualIndex.value % totalCount.value) + totalCount.value) % totalCount.value;
});

/**
 * 获取带 _mesh-gradient 后缀的图片地址
 * @param url 原始图片地址
 */
const getGradientUrl = (url: string): string => {
  if (!url) return "";
  // 在扩展名前插入 _mesh-gradient
  return url.replace(/(\.[^.]+)$/, "_mesh-gradient$1");
};

/**
 * 解析 CSS 变量中的时间值
 * @param cssVar CSS 变量名
 * @param defaultVal 回退默认值
 */
const parseTimeToken = (cssVar: string, defaultVal: number): number => {
  if (!isClient()) return defaultVal;
  const val = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  if (!val) return defaultVal;
  const num = parseFloat(val);
  if (isNaN(num)) return defaultVal;
  return val.endsWith("s") && !val.endsWith("ms") ? num * 1000 : num;
};

/**
 * 并行加载图片并存入 Blob 缓存以消除闪烁
 * 同时缓存原图和梯度背景图
 * @param urls 图片地址列表
 */
const cacheImages = async (urls: string[]) => {
  if (!isClient()) return;

  // 生成所有需要缓存的 URL（原图 + 梯度图）
  const allUrls = urls.flatMap((url) => [url, getGradientUrl(url)]);
  const uncached = allUrls.filter((url) => !blobCache.has(url));

  await Promise.all(
    uncached.map(async (url) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        blobCache.set(url, URL.createObjectURL(blob));
      } catch {
        blobCache.set(url, url); // 失败时回退到原始 URL
      }
    }),
  );
};

/**
 * 执行切换步进动作
 * @param dir 方向: 1 为后一项, -1 为前一项
 */
const step = async (dir: 1 | -1) => {
  if (isAnimating.value) return;
  isAnimating.value = true;
  virtualIndex.value += dir;
  await new Promise((resolve) => setTimeout(resolve, animDuration.value));
  isAnimating.value = false;
};

/**
 * 虚拟槽位状态计算 (4 槽位无限轮播逻辑)
 * 将 4 个 DOM 元素映射到：当前、下一张、等待中、上一张
 */
const slotStates = computed(() => {
  if (!hasMultiple.value) return [];
  return [0, 1, 2, 3].map((slotId) => {
    const relativePos = (slotId - (virtualIndex.value % 4) + 4) % 4;
    const stateMap = [
      { cls: "current", order: 2, offset: 0 },
      { cls: "next", order: 3, offset: 1 },
      { cls: "standby", order: 4, offset: 2 },
      { cls: "previous", order: 1, offset: -1 },
    ];
    const { cls, order, offset } = stateMap[relativePos];
    const imgIndex = (((currentRealIndex.value + offset) % totalCount.value) + totalCount.value) % totalCount.value;

    const rawUrl = rawImgList.value[imgIndex];
    const rawGradientUrl = getGradientUrl(rawUrl);

    return {
      id: slotId,
      className: cls,
      imgUrl: blobCache.get(rawUrl) || rawUrl,
      gradientUrl: blobCache.get(rawGradientUrl) || rawGradientUrl,
      order,
    };
  });
});

/** 自动轮播计时器 */
const { pause, resume } = useRafFn(
  ({ delta }) => {
    if (!hasMultiple.value || isAnimating.value || isFastForwarding.value || isHovering.value) return;
    remainingTime.value -= delta;
    if (remainingTime.value <= 0) {
      step(1).then(() => (remainingTime.value = config.duration));
    }
  },
  { immediate: false },
);

/**
 * 跳转到指定索引
 * @param targetIdx 目标图片索引
 */
const jumpTo = async (targetIdx: number) => {
  if (!hasMultiple.value || targetIdx === currentRealIndex.value || isFastForwarding.value || isAnimating.value) return;
  isFastForwarding.value = true;
  const dir = targetIdx > currentRealIndex.value ? 1 : -1;
  const run = async () => {
    await step(dir);
    if (currentRealIndex.value !== targetIdx) await run();
    else {
      isFastForwarding.value = false;
      remainingTime.value = config.duration;
    }
  };
  await run();
};

/**
 * 处理手动导航
 * @param dir 方向
 */
const handleNav = async (dir: 1 | -1) => {
  if (isFastForwarding.value || !hasMultiple.value || isAnimating.value) return;
  await step(dir);
  remainingTime.value = config.duration;
};

watch(
  rawImgList,
  async (newList) => {
    remainingTime.value = config.duration;
    virtualIndex.value = 0;
    pause();
    await cacheImages(newList);
    if (hasMultiple.value && isClient()) resume();
  },
  { immediate: true },
);

onMounted(() => {
  if (isClient()) {
    config.duration = parseTimeToken(CSS_TOKENS.DURATION, config.duration);
    config.animNormal = parseTimeToken(CSS_TOKENS.ANIM_NORMAL, config.animNormal);
    config.animFast = parseTimeToken(CSS_TOKENS.ANIM_FAST, config.animFast);
    remainingTime.value = config.duration;
    if (hasMultiple.value) resume();
  }
});

onUnmounted(() => {
  blobCache.forEach((url) => url.startsWith("blob:") && URL.revokeObjectURL(url));
  blobCache.clear();
});
</script>

<template>
  <header ref="headerRef" class="Header">
    <div class="carousel-container" :impression-color="frontmatter.color">
      <template v-if="hasMultiple">
        <div class="stage" :style="{ '--carousel-duration': `${animDuration}ms` }">
          <div v-for="slot in slotStates" :key="slot.id" class="item" :class="slot.className" :style="{ order: slot.order }">
            <img :src="slot.imgUrl" />
          </div>
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
                strokeDasharray: `${2 * Math.PI * 9}`,
                strokeDashoffset: `${2 * Math.PI * 9 * (1 - progress / 100)}`,
                transition: isFastForwarding ? 'none' : 'stroke-dashoffset 100ms linear',
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
            @click="jumpTo(idx)"
          ></button>
        </div>
      </template>
      <template v-else>
        <ClientOnly>
          <svg width="0" height="0" style="display: none">
            <defs>
              <filter id="noise-filter" x="0" y="0" width="100%" height="100%">
                <feTurbulence
                  :seed="frontmatter.date ? new Date(frontmatter.date).getTime() : 0"
                  type="turbulence"
                  baseFrequency="0.15"
                  numOctaves="2"
                  stitchTiles="stitch"
                ></feTurbulence>
                <feColorMatrix type="saturate" values="1"></feColorMatrix>
                <feComponentTransfer>
                  <feFuncA type="discrete" tableValues="0 0.1"></feFuncA>
                </feComponentTransfer>
                <feBlend mode="multiply" in2="SourceGraphic"></feBlend>
              </filter>
            </defs>
          </svg>
        </ClientOnly>
        <div class="single">
          <h1>{{ frontmatter.title || page.title }}</h1>
          <img :src="getGradientUrl(rawImgList[0])" />
          <img :src="rawImgList[0]" />
        </div>
      </template>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/Header");
</style>
