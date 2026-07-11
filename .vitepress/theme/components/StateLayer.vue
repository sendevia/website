<script setup lang="ts">
/**
 * 状态层组件 (StateLayer)
 * 实现 MD3E 风格的状态叠加（Hover/Focus/Active）及水波纹（Ripple）和边缘噪点反馈效果
 */
import { ref, computed, nextTick, type ComponentPublicInstance } from "vue";
import { useParentElement, useElementHover, useEventListener } from "@vueuse/core";

interface Props {
  /** 悬停状态层颜色 */
  hoverColor?: string;
  /** 聚焦状态层颜色 */
  focusColor?: string;
  /** 激活/按压状态层颜色 */
  activeColor?: string;
  /** 是否启用悬停效果 */
  hoverEnabled?: boolean;
  /** 是否启用聚焦效果 */
  focusEnabled?: boolean;
  /** 是否启用按压效果 */
  activeEnabled?: boolean;
  /** 强制指定状态（外部控制，优先级高于自动检测） */
  state?: "hover" | "focus" | "active" | "none";
}

const props = withDefaults(defineProps<Props>(), {
  hoverColor: "var(--md-sys-state-hover-state-layer)",
  focusColor: "var(--md-sys-state-focus-state-layer)",
  activeColor: "var(--md-sys-state-pressed-state-layer)",
  hoverEnabled: true,
  focusEnabled: true,
  activeEnabled: true,
  state: "none",
});

/** 噪点密度与直径 */
const NOISE_DENSITY = 2000;
const NOISE_DOT_SIZE = 1.5;

const parent = useParentElement();
const isHovered = useElementHover(parent);
const isFocused = ref(false);
const isActive = ref(false);
const isPointerFocus = ref(false);
const isKeyboardFocus = ref(false);
const isFocusVisible = computed(() => isFocused.value && isKeyboardFocus.value);

interface NoiseDot {
  angle: number;
  distance: number;
  delay: number;
  duration: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
  isClosing: boolean;
  noiseDots: NoiseDot[];
}

interface CanvasAnim {
  animFrame: number;
  startTime: number;
  fadeStartTime: number;
}

const ripples = ref<Ripple[]>([]);
const rippleEl = new Map<number, HTMLElement>();
const canvasAnims = new Map<number, CanvasAnim>();
let rippleIdCounter = 0;

const setRippleRef = (el: Element | ComponentPublicInstance | null, id: number): void => {
  if (el) rippleEl.set(id, el as HTMLElement);
  else rippleEl.delete(id);
};

const removeRipple = (id: number): void => {
  const idx = ripples.value.findIndex((r) => r.id === id);
  if (idx >= 0) ripples.value.splice(idx, 1);
};

const stopNoiseCanvas = (id: number): void => {
  const anim = canvasAnims.get(id);
  if (anim) {
    cancelAnimationFrame(anim.animFrame);
    canvasAnims.delete(id);
  }
};

/**
 * 初始化噪点 Canvas 并启动动画循环
 * 使用 requestAnimationFrame + Canvas 2D 绘制，性能优于 DOM 元素
 */
const initNoiseCanvas = (el: HTMLCanvasElement | null, ripple: Ripple): void => {
  if (!el || ripple.noiseDots.length === 0) return;

  const dpr = window.devicePixelRatio || 1;
  const cssSize = ripple.size;
  const bufferSize = Math.round(cssSize * dpr);
  const halfBuffer = bufferSize / 2;

  el.style.top = "0";
  el.style.left = "0";
  el.style.width = cssSize + "px";
  el.style.height = cssSize + "px";
  el.width = bufferSize;
  el.height = bufferSize;

  const ctx = el.getContext("2d")!;
  const dotRadius = (NOISE_DOT_SIZE * dpr) / 2;
  const dotPositions = ripple.noiseDots.map((dot) => ({
    x: halfBuffer + Math.cos(dot.angle) * dot.distance * dpr,
    y: halfBuffer + Math.sin(dot.angle) * dot.distance * dpr,
  }));

  const anim: CanvasAnim = { startTime: performance.now(), animFrame: 0, fadeStartTime: 0 };
  const FADE_DURATION = 400;

  const tick = (now: number): void => {
    const elapsed = (now - anim.startTime) / 1000;

    if (ripple.isClosing && anim.fadeStartTime === 0) anim.fadeStartTime = now;

    let fadeAlpha = 1;
    if (anim.fadeStartTime > 0) {
      fadeAlpha = 1 - Math.min(1, (now - anim.fadeStartTime) / FADE_DURATION);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, bufferSize, bufferSize);
    ctx.fillStyle = "#ffffff";

    for (let i = 0; i < ripple.noiseDots.length; i++) {
      const dot = ripple.noiseDots[i];
      const phase = ((elapsed - dot.delay) / dot.duration) * Math.PI * 2;
      const opacity = Math.max(0, Math.sin(phase)) * fadeAlpha;

      if (opacity > 0.01) {
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(dotPositions[i].x, dotPositions[i].y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (fadeAlpha > 0) anim.animFrame = requestAnimationFrame(tick);
  };

  anim.animFrame = requestAnimationFrame(tick);
  canvasAnims.set(ripple.id, anim);
};

/**
 * 按压处理：创建水波纹并播放展开动画
 */
const handlePress = (e: MouseEvent | TouchEvent): void => {
  if (!props.activeEnabled) return;

  isActive.value = true;
  isPointerFocus.value = true;
  isKeyboardFocus.value = false;

  const el = parent.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const point = "touches" in e ? e.touches[0] : e;
  if (!point) return;

  const x = point.clientX - rect.left;
  const y = point.clientY - rect.top;
  const radius = Math.max(
    Math.hypot(x, y),
    Math.hypot(rect.width - x, y),
    Math.hypot(x, rect.height - y),
    Math.hypot(rect.width - x, rect.height - y),
  );
  const size = radius * 2;
  const id = rippleIdCounter++;

  const noiseDots: NoiseDot[] =
    NOISE_DENSITY > 0
      ? Array.from({ length: NOISE_DENSITY }, () => ({
          angle: Math.random() * Math.PI * 2,
          distance: Math.pow(Math.random(), 0.15) * radius,
          delay: Math.random() * 0.6,
          duration: 0.5 + Math.random() * 0.8,
        }))
      : [];

  ripples.value.push({ id, x, y, size, isClosing: false, noiseDots });

  nextTick(() => {
    const rippleNode = rippleEl.get(id);
    if (!rippleNode) return;

    rippleNode.animate(
      [
        { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
        { opacity: 0.12, offset: 0.2 },
        { transform: "translate(-50%, -50%) scale(1)", opacity: 0.1 },
      ],
      { duration: 300, easing: "cubic-bezier(0.34, 0.88, 0.34, 1)", fill: "forwards" },
    );
  });
};

/**
 * 释放处理：播放波纹淡出动画并移除
 */
const handleRelease = (): void => {
  isActive.value = false;

  for (const ripple of ripples.value) {
    if (ripple.isClosing) continue;
    ripple.isClosing = true;

    const rippleNode = rippleEl.get(ripple.id);
    if (!rippleNode) {
      removeRipple(ripple.id);
      continue;
    }

    const fadeOut = rippleNode.animate(
      [{ opacity: window.getComputedStyle(rippleNode).opacity }, { opacity: 0 }],
      { duration: 300, easing: "cubic-bezier(0.34, 0.88, 0.34, 1)", fill: "forwards" },
    );
    fadeOut.onfinish = () => {
      stopNoiseCanvas(ripple.id);
      removeRipple(ripple.id);
    };
  }
};

useEventListener(parent, "focus", () => {
  isFocused.value = true;
  isKeyboardFocus.value = !isPointerFocus.value;
});

useEventListener(parent, "blur", () => {
  isFocused.value = false;
  isPointerFocus.value = false;
  isKeyboardFocus.value = false;
});

useEventListener(parent, "mousedown", handlePress);
useEventListener(parent, "touchstart", handlePress, { passive: true });
useEventListener(parent, "keydown", () => {
  isPointerFocus.value = false;
  isKeyboardFocus.value = true;
});

useEventListener(parent, "mouseup", handleRelease);
useEventListener(parent, "touchend", handleRelease);
useEventListener(parent, "mouseleave", handleRelease);
useEventListener(parent, "touchcancel", handleRelease);

/** 计算当前状态层背景色 */
const stateLayerBg = computed((): string => {
  if (props.state !== "none") {
    if (props.state === "active") return props.activeColor;
    if (props.state === "focus") return props.focusColor;
    return props.hoverColor;
  }
  if (isActive.value && props.activeEnabled) return props.activeColor;
  if (isFocusVisible.value && props.focusEnabled) return props.focusColor;
  if (isHovered.value && props.hoverEnabled) return props.hoverColor;
  return "transparent";
});
</script>

<template>
  <div class="StateLayer" aria-hidden="true" :style="{ backgroundColor: stateLayerBg }">
    <div
      v-for="ripple in ripples"
      :key="ripple.id"
      class="ripple-wrapper"
      :style="{
        '--ripple-x': ripple.x + 'px',
        '--ripple-y': ripple.y + 'px',
        '--ripple-size': ripple.size + 'px',
      }"
    >
      <div :ref="(el) => setRippleRef(el, ripple.id)" class="ripple">
        <canvas
          v-if="ripple.noiseDots.length > 0"
          :ref="(el) => initNoiseCanvas(el as HTMLCanvasElement | null, ripple)"
          class="noise-canvas"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../styles/components/StateLayer";
</style>
