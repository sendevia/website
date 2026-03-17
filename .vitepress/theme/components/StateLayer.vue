<script setup lang="ts">
/**
 * 状态层组件 (StateLayer)
 * 实现 MD3E 风格的状态叠加（Hover/Focus/Active）及水波纹（Ripple）反馈效果
 */
import { ref, computed, nextTick, type ComponentPublicInstance } from "vue";
import { useParentElement, useElementHover, useEventListener } from "@vueuse/core";

/** StateLayer 组件属性定义 */
interface Props {
  /** 悬停状态背景色 */
  hoverColor?: string;
  /** 聚焦状态背景色 */
  focusColor?: string;
  /** 激活状态背景色 */
  activeColor?: string;
  /** 是否启用悬停效果响应 */
  hoverEnabled?: boolean;
  /** 是否启用聚焦效果响应 */
  focusEnabled?: boolean;
  /** 是否启用激活效果响应 */
  activeEnabled?: boolean;
  /** 强制指定的当前状态，优先级高于内部交互状态 */
  currentState?: "hover" | "focus" | "active" | "none";
}

const props = withDefaults(defineProps<Props>(), {
  hoverColor: "var(--md-sys-state-hover-state-layer)",
  focusColor: "var(--md-sys-state-focus-state-layer)",
  activeColor: "var(--md-sys-state-pressed-state-layer)",
  hoverEnabled: true,
  focusEnabled: true,
  activeEnabled: true,
  currentState: "none",
});

/** 挂载的父容器元素引用，用于主动绑定交互事件 */
const parent = useParentElement();

/** 追踪是否处于悬停状态 */
const isHovered = useElementHover(parent);
/** 追踪是否处于聚焦状态 */
const isFocused = ref(false);
/** 追踪是否处于按压或激活动作中 */
const isActive = ref(false);

/** 单个水波纹数据模型 */
interface Ripple {
  /** 波纹的唯一标识符 */
  id: number;
  /** 波纹扩散原点 X 坐标 */
  x: number;
  /** 波纹扩散原点 Y 坐标 */
  y: number;
  /** 波纹扩散的最大直径 */
  size: number;
  /** 波纹是否已进入退场动画状态 */
  isClosing: boolean;
}

/** 当前处于活跃状态的水波纹实例列表 */
const ripples = ref<Ripple[]>([]);
/** 保存水波纹 DOM 元素的哈希映射，便于 O(1) 访问 */
const rippleElements = new Map<number, HTMLElement>();
/** 波纹 ID 生成器 */
let rippleIdCounter = 0;

/**
 * 设置对应水波纹的真实 DOM 引用
 * @param el 捕获的 DOM 节点或组件实例
 * @param id 所属波纹的唯一标识
 */
const setRippleRef = (el: Element | ComponentPublicInstance | null, id: number) => {
  if (el) {
    rippleElements.set(id, el as HTMLElement);
  } else {
    // 配合 Vue 生命周期当元素卸载(el为null)时释放引用，防止内存泄漏
    rippleElements.delete(id);
  }
};

/**
 * 移除指定的波纹数据实例
 * @param id 需要被清除逻辑的波纹标识
 */
const removeRipple = (id: number) => {
  const index = ripples.value.findIndex((it) => it.id === id);
  if (index !== -1) ripples.value.splice(index, 1);
};

/**
 * 响应按压动作（鼠标按下/触摸开始），生成新水波纹
 * @param e 触摸或鼠标事件对象
 */
const handlePress = (e: MouseEvent | TouchEvent) => {
  if (!props.activeEnabled) return;

  isActive.value = true;
  const el = parent.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const point = "touches" in e ? e.touches[0] : e;
  if (!point) return;

  const x = point.clientX - rect.left;
  const y = point.clientY - rect.top;

  // 使用 Math.hypot 直接推导四角距离取最大值，避免无谓的数组重复分配
  const maxRadius = Math.max(
    Math.hypot(x, y),
    Math.hypot(rect.width - x, y),
    Math.hypot(x, rect.height - y),
    Math.hypot(rect.width - x, rect.height - y),
  );

  const size = maxRadius * 2;
  const id = rippleIdCounter++;

  ripples.value.push({ id, x, y, size, isClosing: false });

  // DOM 渲染结束后触发出场渲染与渐显组合动画
  nextTick(() => {
    const rippleEl = rippleElements.get(id);
    if (!rippleEl) return;

    rippleEl.animate(
      [
        { transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
        { opacity: 0.12, offset: 0.2 },
        { transform: "translate(-50%, -50%) scale(1)", opacity: 0.12 },
      ],
      // md-sys-motion-spring-slow-effect
      { duration: 300, easing: "cubic-bezier(0.34, 0.88, 0.34, 1)", fill: "forwards" },
    );
  });
};

/**
 * 响应释放按压，使未结束波纹平稳进入透明衰退动画
 */
const handleRelease = () => {
  isActive.value = false;

  ripples.value.forEach((ripple) => {
    if (ripple.isClosing) return;

    ripple.isClosing = true;
    const rippleEl = rippleElements.get(ripple.id);

    if (rippleEl) {
      // 提取计算当前实时的层级透明度，达成完美的非线性中断退场衔接
      const currentOpacity = window.getComputedStyle(rippleEl).opacity;

      const fadeOutAnim = rippleEl.animate([{ opacity: currentOpacity }, { opacity: 0 }], {
        // md-sys-motion-spring-slow-effect
        duration: 300,
        easing: "cubic-bezier(0.34, 0.88, 0.34, 1)",
        fill: "forwards",
      });

      fadeOutAnim.onfinish = () => removeRipple(ripple.id);
    } else {
      removeRipple(ripple.id);
    }
  });
};

useEventListener(parent, "focus", () => (isFocused.value = true));
useEventListener(parent, "blur", () => (isFocused.value = false));
useEventListener(parent, "mousedown", handlePress);
// 标记 passive 对于滚动页面时的触控性能有显著提升响应效果
useEventListener(parent, "touchstart", handlePress, { passive: true });
useEventListener(parent, "mouseup", handleRelease);
useEventListener(parent, "touchend", handleRelease);
useEventListener(parent, "mouseleave", handleRelease);
// 考虑设备因长按拖拽划出窗口或特殊情况产生的物理中断现象
useEventListener(parent, "touchcancel", handleRelease);

/**
 * 计算当前表现的层级底色，基于明确的层级优先级或外部传参推断
 */
const computedBackgroundColor = computed(() => {
  // 若外部明确强制指定了状态覆盖，优先校验该对应参数
  if (props.currentState !== "none") {
    if (props.currentState === "hover" && props.hoverEnabled) return props.hoverColor;
    if (props.currentState === "focus" && props.focusEnabled) return props.focusColor;
    if (props.currentState === "active" && props.activeEnabled) return props.activeColor;
    return "transparent";
  }

  // 内部优先级由高到底依次判断：Active > Focus > Hover
  if (isActive.value && props.activeEnabled) return props.activeColor;
  if (isFocused.value && props.focusEnabled) return props.focusColor;
  if (isHovered.value && props.hoverEnabled) return props.hoverColor;

  return "transparent";
});
</script>

<template>
  <div class="StateLayer" aria-hidden="true" :style="{ backgroundColor: computedBackgroundColor }">
    <div
      v-for="ripple in ripples"
      :key="ripple.id"
      :ref="(el) => setRippleRef(el, ripple.id)"
      class="ripple"
      :style="{
        '--ripple-x': ripple.x + 'px',
        '--ripple-y': ripple.y + 'px',
        '--ripple-size': ripple.size + 'px',
      }"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:meta";
@include meta.load-css("../styles/components/StateLayer");
</style>
