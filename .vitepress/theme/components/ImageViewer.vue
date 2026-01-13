<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useWindowSize, useEventListener, useVModel } from "@vueuse/core";
import { handleTabNavigation } from "../utils/tabNavigation";

/**
 * 组件属性定义
 */
interface Props {
  images: string[];
  currentIndex: number;
  originPosition?: { x: number; y: number; width: number; height: number };
}

const props = withDefaults(defineProps<Props>(), {
  originPosition: () => ({ x: 0, y: 0, width: 0, height: 0 }),
});

const emit = defineEmits<{
  close: [];
  "update:currentIndex": [index: number];
}>();

/** 响应式双向绑定当前索引 */
const activeIndex = useVModel(props, "currentIndex", emit);

/** 常量配置 */
const ZOOM_CONFIG = {
  MIN: 0.9,
  MAX: 2.0,
  MAX_TOUCH: 5.0,
  STEP: 0.15,
  TOUCH_THRESHOLD: 10,
};

/** 状态管理 */
const isVisible = ref(false);
const isAnimating = ref(false);
const imageTransition = ref(false);
const imageScale = ref(1);
const isZooming = ref(false);
const isDragging = ref(false);
const imagePosition = ref({ x: 0, y: 0 });
const initialTransform = ref({ scale: 0, translateX: 0, translateY: 0 });

/** 存储打开前的焦点元素 */
const lastActiveElement = ref<HTMLElement | null>(null);

/** 获取窗口尺寸 */
const { width: winWidth, height: winHeight } = useWindowSize();

/** 计算属性 */
const currentImage = computed(() => props.images[activeIndex.value]);
const hasPrevious = computed(() => activeIndex.value > 0);
const hasNext = computed(() => activeIndex.value < props.images.length - 1);

/**
 * 计算图片从文章位置飞出的初始变换参数
 */
const calculateInitialTransform = () => {
  const { x, y, width, height } = props.originPosition;
  if (width > 0 && height > 0) {
    const viewportCenterX = winWidth.value / 2;
    const viewportCenterY = winHeight.value / 2;
    const targetWidth = Math.min(winWidth.value * 0.85, winHeight.value * 0.75);

    initialTransform.value = {
      scale: targetWidth > 0 ? width / targetWidth : 0.01,
      translateX: x - viewportCenterX,
      translateY: y - viewportCenterY,
    };
  }
};

/**
 * 重置缩放与平移位置
 */
const resetZoom = () => {
  imageScale.value = 1;
  imagePosition.value = { x: 0, y: 0 };
};

/**
 * 显示查看器，并记录当前焦点
 */
const show = () => {
  // 立即记录当前活跃元素
  lastActiveElement.value = document.activeElement as HTMLElement;

  isVisible.value = true;
  resetZoom();
  calculateInitialTransform();

  nextTick(() => {
    // 延迟一帧触发动画，确保 CSS 过渡生效
    isAnimating.value = true;
    // 将焦点转移到查看器内部的关闭按钮
    const closeBtn = document.querySelector<HTMLElement>(".btn-close");
    closeBtn?.focus();
  });
};

/**
 * 隐藏查看器，并还原焦点
 */
const hide = () => {
  calculateInitialTransform();
  isAnimating.value = false;

  // 等待动画结束后卸载组件并归还焦点
  setTimeout(() => {
    isVisible.value = false;

    // 焦点还原逻辑
    if (lastActiveElement.value && document.body.contains(lastActiveElement.value)) {
      lastActiveElement.value.focus();
    }

    emit("close");
  }, 300);
};

/** 导航动作 */
const prevImage = () => hasPrevious.value && activeIndex.value--;
const nextImage = () => hasNext.value && activeIndex.value++;

/** 键盘交互处理 */
useEventListener("keydown", (e: KeyboardEvent) => {
  if (!isVisible.value) return;

  // 陷阱焦点逻辑
  if (e.key === "Tab") {
    const container = document.querySelector(".ImageViewer") as HTMLElement;
    const focusable = container?.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    if (focusable?.length) {
      e.preventDefault();
      handleTabNavigation(container, focusable, e.shiftKey);
    }
    return;
  }

  switch (e.key) {
    case "Escape":
      hide();
      break;
    case "ArrowLeft":
      prevImage();
      break;
    case "ArrowRight":
      nextImage();
      break;
    case "+":
    case "=":
      imageScale.value = Math.min(ZOOM_CONFIG.MAX, imageScale.value + ZOOM_CONFIG.STEP);
      break;
    case "-":
      imageScale.value = Math.max(ZOOM_CONFIG.MIN, imageScale.value - ZOOM_CONFIG.STEP);
      break;
  }
});

/** 滚轮缩放与翻页 */
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  if (e.shiftKey) {
    e.deltaY > 0 ? nextImage() : prevImage();
  } else {
    const step = e.deltaY > 0 ? -ZOOM_CONFIG.STEP : ZOOM_CONFIG.STEP;
    imageScale.value = Math.min(Math.max(imageScale.value + step, ZOOM_CONFIG.MIN), ZOOM_CONFIG.MAX);
  }
};

/** 拖拽逻辑 */
const dragStart = { x: 0, y: 0, imgX: 0, imgY: 0 };
const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault();
  isDragging.value = true;
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
  dragStart.imgX = imagePosition.value.x;
  dragStart.imgY = imagePosition.value.y;
};

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const dx = (e.clientX - dragStart.x) / imageScale.value;
  const dy = (e.clientY - dragStart.y) / imageScale.value;
  imagePosition.value = { x: dragStart.imgX + dx, y: dragStart.imgY + dy };
};

/** 触摸交互逻辑 (多指缩放与单指拖拽) */
let initialTouchDist = 0;
let initialTouchScale = 1;
let lastTouchPos = { x: 0, y: 0 };

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    isZooming.value = true;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    initialTouchDist = Math.sqrt(dx * dx + dy * dy);
    initialTouchScale = imageScale.value;
  } else if (e.touches.length === 1) {
    lastTouchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (isZooming.value && e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    imageScale.value = Math.min(
      Math.max((dist / initialTouchDist) * initialTouchScale, ZOOM_CONFIG.MIN),
      ZOOM_CONFIG.MAX_TOUCH
    );
  } else if (e.touches.length === 1) {
    const touch = e.touches[0];
    const dx = touch.clientX - lastTouchPos.x;
    const dy = touch.clientY - lastTouchPos.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      isDragging.value = true;
      imagePosition.value.x += dx;
      imagePosition.value.y += dy;
      lastTouchPos = { x: touch.clientX, y: touch.clientY };
    }
  }
};

/** 监听图片切换 */
watch(activeIndex, resetZoom);

onMounted(show);

defineExpose({ show, hide });
</script>

<template>
  <div
    v-if="isVisible"
    class="ImageViewer"
    :class="{ animating: isAnimating }"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <MaterialButton @click="hide" class="btn-close" icon="close" color="text" size="m" aria-label="关闭" />
    <MaterialButton
      v-if="hasPrevious"
      @click="prevImage"
      class="btn-nav prev"
      icon="chevron_left"
      size="l"
      aria-label="上一张"
    />
    <MaterialButton
      v-if="hasNext"
      @click="nextImage"
      class="btn-nav next"
      icon="chevron_right"
      size="l"
      aria-label="下一张"
    />
    <div
      class="content"
      @click.self="hide"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="isZooming = isDragging = false"
    >
      <img
        :src="currentImage"
        :alt="`Image ${activeIndex + 1}`"
        class="content-image"
        :class="{ transitioning: imageTransition, notransition: isDragging || isZooming }"
        @dblclick="resetZoom"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="isDragging = false"
        @mouseleave="isDragging = false"
        :style="{
          transform: isAnimating
            ? `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`
            : `scale(${initialTransform.scale}) translate(${initialTransform.translateX}px, ${initialTransform.translateY}px)`,
          opacity: isAnimating ? 1 : 0,
          cursor: imageScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          maxWidth: `${winWidth * 0.85}px`,
          maxHeight: `${winHeight * 0.75}px`,
        }"
      />
    </div>
    <p class="index-text">{{ activeIndex + 1 }} / {{ images.length }}</p>
    <div class="thumbnails" v-if="images.length > 1">
      <button
        v-for="(img, idx) in images"
        :key="idx"
        class="thumbnail"
        :class="{ active: idx === activeIndex }"
        @click="activeIndex = idx"
      >
        <img :src="img" alt="thumbnail" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/ImageViewer");
</style>
