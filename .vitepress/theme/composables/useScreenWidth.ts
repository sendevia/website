import { ref, onMounted, onBeforeUnmount } from "vue";

/**
 * 响应式屏幕宽度检测组合式函数
 * @param breakpoint 断点值，默认为840px
 * @returns 包含屏幕宽度和是否超过断点的响应式对象
 */
export function useScreenWidth(breakpoint = 840) {
  const screenWidth = ref<number>(0);
  const isAboveBreakpoint = ref<boolean>(true);

  function updateScreenWidth() {
    if (typeof window !== "undefined") {
      screenWidth.value = window.innerWidth;
      isAboveBreakpoint.value = screenWidth.value > breakpoint;
    }
  }

  if (typeof window !== "undefined") {
    onMounted(() => {
      updateScreenWidth();
      window.addEventListener("resize", updateScreenWidth);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", updateScreenWidth);
    });
  }

  return {
    screenWidth,
    isAboveBreakpoint,
    updateScreenWidth,
  };
}
