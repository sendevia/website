import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { isClient } from "../utils/env";
import { getCookie, setCookie } from "../utils/cookie";
import { useScreenWidthStore } from "./screenWidth";

/**
 * 侧边导航栏状态管理
 */
export const useNavStateStore = defineStore("navState", () => {
  const isNavExpanded = ref<boolean>(false);
  const cookieName = "nav-expanded";
  const screenWidthStore = useScreenWidthStore();

  /**
   * 初始从 Cookie 读取状态
   */
  function init() {
    if (!isClient()) return;
    screenWidthStore.update();

    const cookieValue = getCookie(cookieName);
    if (cookieValue !== null) {
      const cookieExpanded = cookieValue === "true";

      if (cookieExpanded) {
        if (screenWidthStore.isAboveBreakpoint) {
          isNavExpanded.value = true;
        } else {
          isNavExpanded.value = false;

          const stop = watch(
            () => screenWidthStore.isAboveBreakpoint,
            (isAbove) => {
              if (isAbove) {
                isNavExpanded.value = true;
                stop();
              }
            }
          );
        }
      } else {
        isNavExpanded.value = false;
        if (getCookie(cookieName) !== "false") {
          saveToCookie();
        }
      }
    } else {
      isNavExpanded.value = false;
      saveToCookie();
    }
  }

  /**
   * 保存状态到 Cookie
   */
  function saveToCookie() {
    if (!isClient()) return;

    setCookie(cookieName, isNavExpanded.value.toString());
  }

  /**
   * 展开导航栏
   */
  function expand() {
    if (screenWidthStore.isAboveBreakpoint) {
      isNavExpanded.value = true;
    }
  }

  /**
   * 折叠导航栏
   */
  function collapse() {
    isNavExpanded.value = false;
  }

  /**
   * 切换导航栏状态
   */
  function toggle() {
    if (isNavExpanded.value) {
      collapse();
    } else {
      expand();
    }
  }

  // 监听状态变化，自动保存到 Cookie
  watch(isNavExpanded, () => {
    saveToCookie();
  });

  // 监听屏幕宽度变化，当小于断点时强制折叠
  watch(
    () => screenWidthStore.isAboveBreakpoint,
    (isAbove) => {
      if (!isAbove) {
        isNavExpanded.value = false;
      }
    }
  );

  return {
    // 状态
    isNavExpanded,

    // 方法
    init,
    expand,
    collapse,
    toggle,
  };
});
