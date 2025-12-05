import { defineStore } from "pinia";
import { ref, watch } from "vue";

/**
 * 屏幕宽度响应式状态管理
 */
export const useScreenWidthStore = defineStore("screenWidth", () => {
  // 响应式状态
  const screenWidth = ref<number>(0);
  const isAboveBreakpoint = ref<boolean>(true);
  const breakpoint = ref<number>(840);

  // 内部状态
  let resizeHandler: (() => void) | null = null;
  let fallbackHandler: (() => void) | null = null;
  let isInitialized = false;

  /**
   * 更新屏幕宽度状态
   */
  function update() {
    if (typeof window !== "undefined") {
      screenWidth.value = window.innerWidth;
      isAboveBreakpoint.value = screenWidth.value > breakpoint.value;
    }
  }

  /**
   * Fallback 检查
   */
  function runFallbackCheck() {
    update();
  }

  /**
   * 初始化监听器
   */
  function init() {
    if (typeof window !== "undefined" && !isInitialized) {
      update();
      resizeHandler = () => update();
      window.addEventListener("resize", resizeHandler);

      if (document.readyState === "complete") {
        runFallbackCheck();
      } else {
        fallbackHandler = () => runFallbackCheck();
        window.addEventListener("load", fallbackHandler);
      }

      isInitialized = true;
    }
  }

  /**
   * 清理监听器
   */
  function cleanup() {
    if (typeof window !== "undefined") {
      if (resizeHandler) {
        window.removeEventListener("resize", resizeHandler);
        resizeHandler = null;
      }
      if (fallbackHandler) {
        window.removeEventListener("load", fallbackHandler);
        fallbackHandler = null;
      }
      isInitialized = false;
    }
  }

  /**
   * 设置断点阈值
   * @param value - 新的断点阈值
   */
  function setBreakpoint(value: number) {
    breakpoint.value = value;
    update();
  }

  // 监听断点变化，自动更新状态
  watch(breakpoint, () => {
    update();
  });

  // 自动初始化
  if (typeof window !== "undefined") {
    init();
  }

  return {
    // 状态
    screenWidth,
    isAboveBreakpoint,
    breakpoint,

    // 方法
    update,
    init,
    cleanup,
    setBreakpoint,
  };
});
