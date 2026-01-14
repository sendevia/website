/**
 * 屏幕宽度响应式状态管理
 */

import { defineStore } from "pinia";
import { ref, watch, onUnmounted } from "vue";
import { isClient } from "../utils/env";

/** 导出 */
export const useScreenWidthStore = defineStore("screenWidth", () => {
  // 响应式状态
  const screenWidth = ref<number>(0);
  const isAboveBreakpoint = ref<boolean>(true);
  const breakpoint = ref<number>(840);

  // 内部状态
  let resizeHandler: (() => void) | null = null;
  let isInitialized = false;

  /** 更新屏幕宽度状态 */
  function update() {
    if (!isClient()) return;

    screenWidth.value = window.innerWidth;
    isAboveBreakpoint.value = screenWidth.value > breakpoint.value;
  }

  /** 初始化监听器 */
  function init() {
    if (!isClient() || isInitialized) return;

    update();

    resizeHandler = () => {
      requestAnimationFrame(() => {
        update();
      });
    };

    window.addEventListener("resize", resizeHandler);
    isInitialized = true;
  }

  /** 清理监听器 */
  function cleanup() {
    if (resizeHandler && isClient()) {
      window.removeEventListener("resize", resizeHandler);
      resizeHandler = null;
      isInitialized = false;
    }
  }

  /**
   * 设置断点阈值
   * @param value - 新的断点阈值
   */
  function setBreakpoint(value: number) {
    breakpoint.value = value;
    if (isClient()) {
      update();
    }
  }

  // 监听断点变化，自动更新状态
  watch(breakpoint, () => {
    if (isClient()) {
      update();
    }
  });

  // 在组件卸载时自动清理
  if (isClient()) {
    onUnmounted(() => {
      cleanup();
    });
  }

  return {
    // 状态
    screenWidth,
    isAboveBreakpoint,
    breakpoint,

    // 方法
    init,
    update,
    setBreakpoint,
    cleanup,
  };
});
