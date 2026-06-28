import { computed, ref } from "vue";
import { useWindowSize } from "@vueuse/core";
import { isClient } from "../utils/env";

const { width } = useWindowSize({
  initialWidth: isClient() ? window.innerWidth : 1200,
});

export function useScreenWidth() {
  const breakpoint = ref(840);
  const isAboveBreakpoint = computed(() => width.value > breakpoint.value);

  return { screenWidth: width, isAboveBreakpoint, breakpoint };
}
