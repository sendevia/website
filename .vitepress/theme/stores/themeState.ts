/**
 * 颜色主题偏好管理
 */

import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { usePreferredDark } from "@vueuse/core";
import { setCookie, getCookie } from "../utils/cookie";
import { isClient } from "../utils/env";

export type ThemePreference = "auto" | "light" | "dark";

export const useThemeStateStore = defineStore("themeState", () => {
  /** 系统是否偏好深色模式 */
  const systemDark = usePreferredDark();

  /** 用户当前的偏好设置 */
  const preference = ref<ThemePreference>("auto");

  /** 计算当前实际生效的颜色模式 */
  const isDarkActive = computed(() => {
    if (preference.value === "auto") {
      return systemDark.value;
    }
    return preference.value === "dark";
  });

  /** 初始化颜色主题，从 Cookie 读取配置，默认为 auto */
  const init = () => {
    const stored = getCookie("theme_preference");
    if (stored === "light" || stored === "dark" || stored === "auto") {
      preference.value = stored;
    }
  };

  /** 监听实际生效的深色状态变化，操作 DOM */
  watch(
    isDarkActive,
    (isDark) => {
      if (isClient()) {
        document.documentElement.classList.toggle("dark", isDark);
      }
    },
    { immediate: true },
  );

  /** 监听用户偏好变化，持久化到 Cookie */
  watch(preference, (val) => {
    setCookie("theme_preference", val);
  });

  /** 切换主题模式 */
  const cycleTheme = () => {
    const modes: ThemePreference[] = ["auto", "light", "dark"];
    const nextIndex = (modes.indexOf(preference.value) + 1) % modes.length;
    preference.value = modes[nextIndex];
  };

  /** 当前状态对应的图标 */
  const currentIcon = computed(() => {
    switch (preference.value) {
      case "light":
        return "light_mode";
      case "dark":
        return "dark_mode";
      default:
        return "brightness_auto";
    }
  });

  /** 当前状态对应的文本标签 */
  const currentLabel = computed(() => {
    switch (preference.value) {
      case "light":
        return "亮色模式";
      case "dark":
        return "深色模式";
      default:
        return "跟随系统";
    }
  });

  return {
    preference,
    currentIcon,
    currentLabel,
    init,
    cycleTheme,
  };
});
