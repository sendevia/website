<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";

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

// 缩放配置常量
const ZOOM_MIN = 0.9; // 最小缩放
const ZOOM_MAX = 1.6; // 最大缩放
const ZOOM_STEP = 0.15; // 缩放步长
const TOUCH_MOVE_THRESHOLD = 10; // 触摸移动阈值 (px)

// 状态
const isVisible = ref(false);
const isAnimating = ref(false);
const imageTransition = ref(false);
const windowSize = ref({ width: 0, height: 0 });
const initialTransform = ref({ scale: 0, translateX: 0, translateY: 0 });
const imageScale = ref(1);
const minScale = ref(ZOOM_MIN);
const maxScale = ref(ZOOM_MAX);
const isZooming = ref(false);
const isDragging = ref(false);
const imagePosition = ref({ x: 0, y: 0 });
const previousActiveElement = ref<HTMLElement | null>(null);

// 计算属性
const currentImage = computed(() => props.images[props.currentIndex]);
const hasPrevious = computed(() => props.currentIndex > 0);
const hasNext = computed(() => props.currentIndex < props.images.length - 1);

function calculateInitialTransform() {
  if (props.originPosition && props.originPosition.width > 0 && props.originPosition.height > 0) {
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const translateX = props.originPosition.x - viewportCenterX;
    const translateY = props.originPosition.y - viewportCenterY;
    const targetWidth = Math.min(window.innerWidth * 0.85, window.innerHeight * 0.75);
    const scale = targetWidth > 0 ? props.originPosition.width / targetWidth : 0.01;

    initialTransform.value = {
      scale,
      translateX,
      translateY,
    };
  }
}

function show() {
  // 保存之前焦点
  previousActiveElement.value = document.activeElement as HTMLElement | null;

  isVisible.value = true;

  // 每次打开都重置缩放和位置，确保从文章原位置展开
  resetZoom();
  calculateInitialTransform();

  // 开始入场
  setTimeout(() => {
    isAnimating.value = true;
  }, 10);

  // 在动画完成后，将焦点设置到关闭按钮
  // setTimeout(() => {
  //   const btn = document.querySelector<HTMLButtonElement>(".image-viewer__close");
  //   if (btn) {
  //     btn.focus();
  //   }
  // }, 300);
}

function hide() {
  // 重新计算 initialTransform（页面可能已滚动），以便回到正确位置
  calculateInitialTransform();

  // 在下一帧触发状态改变，确保浏览器能够检测到过渡的起点
  requestAnimationFrame(() => {
    // 开始退场
    isAnimating.value = false;

    setTimeout(() => {
      isVisible.value = false;

      // 还原之前的焦点
      if (previousActiveElement.value && typeof previousActiveElement.value.focus === "function") {
        previousActiveElement.value.focus();
      }

      emit("close");
    }, 300);
  });
}

function navigateTo(index: number) {
  if (index >= 0 && index < props.images.length) {
    emit("update:currentIndex", index);
  }
}

function previousImage() {
  if (hasPrevious.value) {
    navigateTo(props.currentIndex - 1);
  }
}

function nextImage() {
  if (hasNext.value) {
    navigateTo(props.currentIndex + 1);
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!isVisible.value) return;

  // Tab 陷阱：当按 Tab 时仅在弹窗内部循环焦点
  if (event.key === "Tab") {
    const container = document.querySelector(".image-viewer") as HTMLElement | null;
    if (container) {
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute("disabled"));

      if (focusable.length) {
        const activeIndex = focusable.indexOf(document.activeElement as HTMLElement);
        if (event.shiftKey) {
          // reverse
          const prev = activeIndex <= 0 ? focusable.length - 1 : activeIndex - 1;
          focusable[prev].focus();
          event.preventDefault();
        } else {
          const next = activeIndex === focusable.length - 1 ? 0 : activeIndex + 1;
          focusable[next].focus();
          event.preventDefault();
        }
      }
    }
    return;
  }

  switch (event.key) {
    case "Escape":
      hide();
      break;
    case "ArrowLeft":
      previousImage();
      break;
    case "ArrowRight":
      nextImage();
      break;
    case "+":
    case "=":
      imageScale.value = Math.min(maxScale.value, imageScale.value + ZOOM_STEP);
      event.preventDefault();
      break;
    case "-":
      imageScale.value = Math.max(minScale.value, imageScale.value - ZOOM_STEP);
      event.preventDefault();
      break;
    case "Home":
      navigateTo(0);
      event.preventDefault();
      break;
    case "End":
      navigateTo(props.images.length - 1);
      event.preventDefault();
      break;
  }
}

// 处理图片外围点击
function handleContentClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    hide();
  }
}

// 更新窗口大小
function updateWindowSize() {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

// 缩放功能
function handleWheel(event: WheelEvent) {
  if (!isVisible.value) return;

  event.preventDefault();

  // 按住 Shift 键时，滚轮用于切换图片
  if (event.shiftKey) {
    if (event.deltaY > 0) {
      nextImage();
    } else {
      previousImage();
    }
  } else {
    // 不按 Shift 键时，滚轮用于缩放
    const step = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newScale = Math.min(Math.max(imageScale.value + step, ZOOM_MIN), ZOOM_MAX);

    imageScale.value = newScale;
  }
}

// 触摸缩放功能
let initialDistance = 0;
let initialScale = 1;

function getDistance(touch1: Touch, touch2: Touch) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// 重置缩放和位置
function resetZoom() {
  imageScale.value = 1;
  imagePosition.value = { x: 0, y: 0 };
}

// 双击重置
function handleDoubleClick() {
  resetZoom();
}

// 拖拽功能
const dragStartPosition = ref({ x: 0, y: 0 });
const dragStartImagePosition = ref({ x: 0, y: 0 });

function handleMouseDown(event: MouseEvent) {
  event.preventDefault();
  isDragging.value = true;

  // 记录拖拽开始时的位置
  dragStartPosition.value = { x: event.clientX, y: event.clientY };
  dragStartImagePosition.value = { ...imagePosition.value };
}

function handleMouseMove(event: MouseEvent) {
  if (isDragging.value) {
    event.preventDefault();

    // 计算光标移动的偏移量
    const deltaX = event.clientX - dragStartPosition.value.x;
    const deltaY = event.clientY - dragStartPosition.value.y;

    // 直接设置图片位置，使点击点跟随光标
    imagePosition.value = {
      x: dragStartImagePosition.value.x + deltaX,
      y: dragStartImagePosition.value.y + deltaY,
    };
  }
}

function handleMouseUp() {
  isDragging.value = false;
}

// 触摸拖拽功能
let lastTouchPosition = { x: 0, y: 0 };
let touchStartPosition = { x: 0, y: 0 };

function handleTouchStart(event: TouchEvent) {
  if (event.touches.length === 2) {
    event.preventDefault();
    isZooming.value = true;
    initialDistance = getDistance(event.touches[0], event.touches[1]);
    initialScale = imageScale.value;
  } else if (event.touches.length === 1) {
    // 不立即 preventDefault，先记录起始位置，由 handleTouchMove 判断是否是拖拽
    isDragging.value = false; // 初始不认为是拖拽
    touchStartPosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    lastTouchPosition = { ...touchStartPosition };
  }
}

function handleTouchMove(event: TouchEvent) {
  if (event.touches.length === 2 && isZooming.value) {
    event.preventDefault();
    const currentDistance = getDistance(event.touches[0], event.touches[1]);
    const scaleFactor = currentDistance / initialDistance;
    const newScale = Math.min(Math.max(initialScale * scaleFactor, ZOOM_MIN), ZOOM_MAX);

    imageScale.value = newScale;
  } else if (event.touches.length === 1) {
    const currentTouch = event.touches[0];
    const deltaX = currentTouch.clientX - touchStartPosition.x;
    const deltaY = currentTouch.clientY - touchStartPosition.y;

    // 判断是否超过阈值，决定是否作为拖拽
    if (Math.abs(deltaX) > TOUCH_MOVE_THRESHOLD || Math.abs(deltaY) > TOUCH_MOVE_THRESHOLD) {
      if (!isDragging.value) {
        // 第一次超过阈值时，标记为拖拽并阻止默认行为
        isDragging.value = true;
        event.preventDefault();
      }

      // 执行拖拽逻辑
      if (isDragging.value) {
        event.preventDefault();
        const moveDeltaX = currentTouch.clientX - lastTouchPosition.x;
        const moveDeltaY = currentTouch.clientY - lastTouchPosition.y;

        imagePosition.value = {
          x: imagePosition.value.x + moveDeltaX,
          y: imagePosition.value.y + moveDeltaY,
        };

        lastTouchPosition = { x: currentTouch.clientX, y: currentTouch.clientY };
      }
    }
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (event.touches.length < 2) {
    isZooming.value = false;
  }

  if (event.touches.length === 0) {
    // 检查是否是纯点击（未产生拖拽）
    if (!isDragging.value) {
      // 如果没有拖拽，说明是纯点击。判断点击位置是否在图片外部
      const eventTarget = event.target as HTMLElement;
      const contentContainer = eventTarget.closest(".image-viewer__content");

      // 如果触摸发生在 content 容器但不是图片本身，关闭查看器
      if (contentContainer && eventTarget === contentContainer) {
        hide();
      }
    }

    isDragging.value = false;
  }
}

// 切换图片时重置缩放和位置
watch(
  () => props.currentIndex,
  () => {
    resetZoom();
  }
);

onMounted(() => {
  show();
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", updateWindowSize);
  updateWindowSize();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", updateWindowSize);
  document.body.style.overflow = "";
});

defineExpose({
  show,
  hide,
});
</script>

<template>
  <div
    v-if="isVisible"
    class="image-viewer"
    :class="{ animating: isAnimating }"
    role="dialog"
    aria-modal="true"
    aria-label="图片查看器"
    tabindex="-1"
  >
    <!-- 控件 -->
    <MaterialButton @click="hide" aria-label="关闭图片查看器" class="btn-close" icon="close" color="text" size="m" />
    <MaterialButton
      v-if="hasPrevious"
      @click="previousImage"
      aria-label="上一张图片"
      class="btn-nav prev"
      icon="chevron_left"
      size="l"
    />
    <MaterialButton
      v-if="hasNext"
      @click="nextImage"
      aria-label="下一张图片"
      class="btn-nav next"
      icon="chevron_right"
      size="l"
    />

    <!-- 图片主体 -->
    <div
      class="content"
      @click="handleContentClick"
      @wheel="handleWheel"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <img
        :src="currentImage"
        :alt="`图片 ${currentIndex + 1} / ${images.length}`"
        class="content-image"
        :class="{
          transitioning: imageTransition,
          notransition: isDragging || isZooming,
        }"
        @dblclick="handleDoubleClick"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        :style="{
          transform: isAnimating
            ? `scale(${imageScale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`
            : `scale(${initialTransform.scale}) translate(${initialTransform.translateX}px, ${initialTransform.translateY}px)`,
          opacity: imageTransition ? 0.6 : isAnimating ? 1 : 0,
          cursor: imageScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          maxWidth: `${windowSize.width * 0.85}px`,
          maxHeight: `${windowSize.height * 0.75}px`,
        }"
      />
    </div>

    <!-- 缩略图导航 -->
    <p class="index-text">{{ currentIndex + 1 }} / {{ images.length }}</p>
    <div class="thumbnails" v-if="images.length > 1">
      <button
        v-for="(image, index) in images"
        :key="index"
        class="thumbnail"
        :class="{ 'thumbnail active': index === currentIndex }"
        @click="navigateTo(index)"
        :aria-label="`查看图片 ${index + 1}`"
      >
        <img :src="image" :alt="`缩略图 ${index + 1}`" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../styles/mixin";

.image-viewer {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;

  position: fixed;
  left: 0;
  top: 0;

  height: 100%;
  width: 100%;

  background-color: #ffffffb9;
  backdrop-filter: blur(20px);

  opacity: 0;
  transition: var(--md-sys-motion-spring-slow-effect-duration) var(--md-sys-motion-spring-slow-effect);
  user-select: none;
  -moz-user-select: none;
  z-index: 9999;

  .index-text {
    padding-block: 3px;
    padding-inline: 9px;

    color: var(--md-sys-color-surface-variant);

    border-radius: var(--md-sys-shape-corner-medium);

    background-color: var(--md-sys-color-on-surface-variant);

    z-index: 3;
  }

  .btn-close,
  .btn-nav {
    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute !important;

    z-index: 3;
  }

  .btn-close {
    right: 20px;
    top: 20px;
  }

  .btn-nav {
    top: 50%;

    &.prev {
      left: 20px;
    }

    &.next {
      right: 20px;
    }
  }

  .content {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;

    width: 100%;

    padding-block-start: 5vh;

    z-index: 2;
  }

  .content-image {
    border-radius: var(--md-sys-shape-corner-full);

    clip-path: circle(10%);
    object-fit: contain;
    transition: var(--md-sys-motion-spring-slow-spatial-duration) var(--md-sys-motion-spring-slow-spatial);

    &.transitioning {
      opacity: 0.6;
    }

    &.notransition {
      transition: none !important;
    }
  }

  .thumbnails {
    display: flex;
    gap: 8px;

    max-width: calc(100% - 66px);

    padding: 24px;

    overflow-x: auto;
    overflow-y: hidden;
    z-index: 3;
  }

  .thumbnail {
    flex-shrink: 0;

    width: 66px;
    height: 66px;

    padding: 0px;

    border: 0px;
    border-radius: var(--md-sys-shape-corner-large);

    cursor: pointer;
    overflow: hidden;
    transition: transform var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial);

    &.active {
      @include mixin.focus-ring($thickness: 1, $offset: 2);

      outline-color: var(--md-sys-color-on-surface-variant) !important;
      transition: transform var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial);
    }

    &:hover {
      transform: scale(0.9);
    }

    &:focus-visible {
      @include mixin.focus-ring($thickness: 2, $offset: 2);
    }

    img {
      height: 100%;
      width: 100%;

      object-fit: cover;
    }
  }

  // 入场结束
  &.animating {
    opacity: 1;

    .content-image {
      border-radius: var(--md-sys-shape-corner-large);

      clip-path: circle(100%);
    }
  }

  @media (prefers-color-scheme: dark) {
    background-color: #000000b9;
  }
}

@media screen and (max-width: 1600px) {
}

@media screen and (max-width: 1200px) {
}

@media screen and (max-width: 840px) {
}

@media screen and (max-width: 600px) {
}
</style>
