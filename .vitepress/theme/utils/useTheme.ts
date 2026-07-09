import { useStorage } from "@vueuse/core";
import { generatePaletteTokens, injectPaletteTokens } from "./colorPalette";

/** 默认主题色 hex 值（持久化） */
export const defaultPalette = useStorage("default-palette", "#39C5BB");

/** 校验并规范化十六进制色值 */
function normalizeHex(input: string): string {
  const cleaned = input.trim().replace(/^#/, "");
  return /^[0-9a-fA-F]{6}$/.test(cleaned) ? `#${cleaned.toUpperCase()}` : "#39C5BB";
}

/** 根据当前 `defaultPalette` 值更新主题 */
export function updateTheme() {
  const safeHex = normalizeHex(defaultPalette.value);
  defaultPalette.value = safeHex;
  injectPaletteTokens(generatePaletteTokens(safeHex));
}
