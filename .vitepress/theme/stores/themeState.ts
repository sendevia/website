/**
 * 颜色主题偏好管理
 */

import { defineStore } from "pinia";
import { computed } from "vue";
import { useColorMode, useCycleList } from "@vueuse/core";
import { setCookie, getCookie, deleteCookie } from "../utils/cookie";

export type ThemePreference = "auto" | "light" | "dark";

/** 偏好映射配置 */
const THEME_MAP = {
  auto: { icon: "brightness_auto", label: "跟随系统" },
  light: { icon: "light_mode", label: "亮色模式" },
  dark: { icon: "dark_mode", label: "深色模式" },
} as const;

export const useThemeStateStore = defineStore("themeState", () => {
  const mode = useColorMode({
    emitAuto: true,
    storageKey: "theme_preference",
    storage: {
      getItem: (key) => getCookie(key) || "auto",
      setItem: (key, value) => setCookie(key, value),
      removeItem: (key) => deleteCookie(key),
    },
    onChanged: (val, defaultHandler) => {
      defaultHandler(val);
      // 确保同时切换 light/dark 类
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", val === "dark");
        document.documentElement.classList.toggle("light", val === "light");
      }
    },
  });

  /** 循环切换列表 */
  const { next } = useCycleList(["auto", "light", "dark"] as ThemePreference[], {
    initialValue: mode.value as ThemePreference,
  });

  /** 切换主题模式 */
  const cycleTheme = () => {
    mode.value = next();
  };

  /** 当前偏好设置 */
  const preference = computed(() => mode.value as ThemePreference);

  /** 当前状态对应的图标 */
  const currentIcon = computed(() => THEME_MAP[preference.value].icon);

  /** 当前状态对应的文本标签 */
  const currentLabel = computed(() => THEME_MAP[preference.value].label);

  return {
    preference,
    currentIcon,
    currentLabel,
    cycleTheme,
  };
});
