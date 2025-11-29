import { CorePalette, hexFromArgb, Blend, argbFromHex } from "@material/material-color-utilities";

/**
 * 创建调色板提供器
 * @param argbColor - 颜色来源（ARGB 格式）
 * @param name - 调色板名称
 * @param append - 调色板类型
 * @param tones - 调色板色相列表
 * @returns 包含原始调色板和色相的对象
 */
function createPaletteProvider(
  argbColor: number,
  name: string,
  append: "a1" | "a2" | "a3" | "n1" | "n2" | "error",
  tones: number[]
): { rawPalette: Record<string, any>; tones: number[] } {
  const palette = CorePalette.of(argbColor);
  return {
    rawPalette: {
      [name]: palette[append],
    },
    tones: tones,
  };
}

// 全局调色板 token 存储
const globalPaletteTokens: Record<string, string> = {};
let paletteUpdateTimer: number | null = null;

/**
 * 将调色板 token 刷新到 DOM 样式
 */
function flushPaletteTokens(): void {
  let styleElement = document.getElementById("md-ref-palette-style") as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "md-ref-palette-style";
    document.head.appendChild(styleElement);
  }

  styleElement.innerHTML = `:root { ${Object.entries(globalPaletteTokens)
    .map(([varName, color]) => `${varName}: ${color};`)
    .join(" ")} }`;
}

/**
 * 设置调色板到全局 token 存储
 * @param paletteProvider - 调色板提供器对象
 */
function setPalette(paletteProvider: { rawPalette: Record<string, any>; tones: number[] }): void {
  Object.entries(paletteProvider.rawPalette).forEach(([key, palette]) => {
    const paletteKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

    paletteProvider.tones.forEach((tone) => {
      const varName = `--md-ref-palette-${paletteKey}${tone}`;
      globalPaletteTokens[varName] = hexFromArgb(palette.tone(tone));
    });
  });

  // 使用防抖机制避免频繁更新
  if (paletteUpdateTimer !== null) {
    clearTimeout(paletteUpdateTimer);
  }

  paletteUpdateTimer = window.setTimeout(() => {
    flushPaletteTokens();
    paletteUpdateTimer = null;
  }, 50);
}

/**
 * 根据基础颜色生成完整的调色板
 * @param baseColor - 基础颜色（ARGB 格式）
 */
export async function generateColorPalette(baseColor: number): Promise<void> {
  type PaletteAppend = "a1" | "a2" | "a3" | "n1" | "n2" | "error";
  type Palette = { name: string; append: PaletteAppend; tones: number[] };
  type HarmonizedPalette = { color: string; name: string; append: PaletteAppend; tones: number[] };

  // 主要调色板配置
  const palettes: Palette[] = [
    { name: "error", append: "error", tones: [10, 20, 30, 40, 80, 90, 100] },
    { name: "neutralVariant", append: "n2", tones: [30, 50, 60, 80, 90] },
    { name: "neutral", append: "n1", tones: [0, 4, 6, 10, 12, 17, 20, 22, 24, 50, 87, 90, 92, 94, 95, 96, 98, 100] },
    { name: "tertiary", append: "a3", tones: [10, 20, 30, 40, 80, 90, 100] },
    { name: "secondary", append: "a2", tones: [10, 20, 30, 40, 48, 80, 90, 100] },
    { name: "primary", append: "a1", tones: [10, 20, 30, 40, 80, 90, 100] },
  ];

  // 协调调色板配置
  const harmonizedPalettes: HarmonizedPalette[] = [
    { color: "#a48ec0", name: "purple", append: "a1", tones: [10, 20, 30, 40, 80, 90, 95] },
    { color: "#f9d770", name: "yellow", append: "a1", tones: [10, 20, 30, 40, 80, 90, 95] },
    { color: "#68b88e", name: "green", append: "a1", tones: [10, 20, 30, 40, 80, 90, 95] },
    { color: "#5cb3cc", name: "blue", append: "a1", tones: [10, 20, 30, 40, 80, 90, 95] },
    { color: "#c27c88", name: "red", append: "a1", tones: [10, 20, 30, 40, 80, 90, 95] },
  ];

  const palettePromises = [
    // 处理主要调色板
    ...palettes.map((palette) => {
      const paletteObject = createPaletteProvider(baseColor, palette.name, palette.append, palette.tones);
      setPalette(paletteObject);
    }),

    // 处理协调调色板
    ...harmonizedPalettes.map((palette) => {
      const paletteObject = createPaletteProvider(
        Blend.harmonize(argbFromHex(palette.color), baseColor),
        palette.name,
        palette.append,
        palette.tones
      );
      setPalette(paletteObject);
    }),
  ];

  await Promise.all(palettePromises);
}
