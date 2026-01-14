/**
 * 适用本项目的再包装 useScroll 工具函数
 */

import { ref, computed, watch, onMounted } from "vue";
import { useScroll } from "@vueuse/core";
import { isClient } from "../utils/env";

/** 全局状态 */
const globalThreshold = ref(80);
const globalPrecision = ref(1);
const globalTargetScrollable = ref(".content-flow");
const globalContainer = ref<HTMLElement | Window | null>(null);
const globalIsScrolled = ref(false);
const globalScrollPosition = ref(0);
const globalScrollPercentage = ref(0);

/**
 * 容器能否滚动
 * @param el 容器
 */
function isScrollable(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  return overflowY === "auto" || overflowY === "scroll" || el.scrollHeight > el.clientHeight;
}

/**
 * 检测容器
 * @param targetScrollable 目标容器
 * @returns 判断通过的滚动容器
 */
function detectContainer(targetScrollable: string) {
  if (!isClient()) return window;

  const el = document.querySelector(targetScrollable);
  if (el && el instanceof HTMLElement && isScrollable(el)) return el;
  return window;
}

/**
 * 计算滚动百分比
 * @param scrollTop 顶部距离
 * @param scrollContainer 滚动容器
 * @param precision 浮点精度
 * @returns 百分比
 */
function calculatePercentage(scrollTop: number, scrollContainer: HTMLElement | Window, precision: number): number {
  try {
    let scrollHeight: number, clientHeight: number;

    if (scrollContainer === window) {
      scrollHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      clientHeight = window.innerHeight;
    } else {
      scrollHeight = (scrollContainer as HTMLElement).scrollHeight;
      clientHeight = (scrollContainer as HTMLElement).clientHeight;
    }

    const maxScroll = Math.max(scrollHeight - clientHeight, 0);
    if (maxScroll <= 0) return 0;

    const percentage = Math.min(scrollTop / maxScroll, 1) * 100;
    return Number(percentage.toFixed(precision));
  } catch (e) {
    return 0;
  }
}

/** 更新全局状态 */
function updateGlobalState(y: number, container: HTMLElement | Window, threshold: number, precision: number) {
  globalScrollPosition.value = y;
  globalIsScrolled.value = y > threshold;
  globalScrollPercentage.value = calculatePercentage(y, container, precision);
}

/** 导出 */
export function useGlobalScroll(options?: { threshold?: number; container?: string; precision?: number }) {
  const localThreshold = options?.threshold ?? globalThreshold.value;
  const localPrecision = options?.precision ?? globalPrecision.value;
  const localTargetScrollable = options?.container ?? globalTargetScrollable.value;

  const containerRef = ref<HTMLElement | Window | null>(null);
  const localIsScrolled = ref(false);
  const localScrollPosition = ref(0);
  const localScrollPercentage = ref(0);

  // 初始化容器
  const initContainer = () => {
    if (!isClient()) return;

    const container = detectContainer(localTargetScrollable);
    containerRef.value = container;

    // 更新全局容器引用（如果是第一个实例）
    if (!globalContainer.value) {
      globalContainer.value = container;
    }
  };

  const scrollResult = useScroll(containerRef, {
    throttle: 0,
    idle: 200,
    eventListenerOptions: { passive: true },
  });

  // 监听滚动位置变化
  watch(
    () => scrollResult.y.value,
    (y) => {
      if (containerRef.value) {
        const yValue = y || 0;

        // 更新本地状态
        localScrollPosition.value = yValue;
        localIsScrolled.value = yValue > localThreshold;
        localScrollPercentage.value = calculatePercentage(yValue, containerRef.value, localPrecision);

        // 更新全局状态
        updateGlobalState(yValue, containerRef.value, globalThreshold.value, globalPrecision.value);
      }
    },
    { immediate: true }
  );

  // 容器检测和初始化
  onMounted(() => {
    if (isClient()) {
      initContainer();

      // 定期检查容器是否变化
      const checkContainerInterval = setInterval(() => {
        const newContainer = detectContainer(localTargetScrollable);
        if (newContainer !== containerRef.value) {
          containerRef.value = newContainer;
        }
      }, 1000);

      // 清理函数
      return () => {
        clearInterval(checkContainerInterval);
      };
    }
  });

  // 监听选项变化
  watch(
    () => options?.container,
    () => {
      if (isClient()) {
        initContainer();
      }
    }
  );

  watch(
    () => options?.threshold,
    (newThreshold) => {
      if (newThreshold !== undefined && containerRef.value) {
        localIsScrolled.value = localScrollPosition.value > newThreshold;
      }
    }
  );

  return {
    // 本地状态
    isScrolled: computed(() => localIsScrolled.value),
    scrollPosition: computed(() => localScrollPosition.value),
    scrollPercentage: computed(() => localScrollPercentage.value),

    // 原始 useScroll 结果
    scrollResult,

    // 容器引用
    container: containerRef,

    // 阈值和精度
    threshold: localThreshold,
    precision: localPrecision,
  };
}

/** 全局滚动状态 */
export const globalScrollState = {
  isScrolled: computed(() => globalIsScrolled.value),
  threshold: computed(() => globalThreshold.value),
  scrollPosition: computed(() => globalScrollPosition.value),
  scrollPercentage: computed(() => globalScrollPercentage.value),
  precision: computed(() => globalPrecision.value),
  container: computed(() => globalContainer.value),
};
