import { CorePalette, hexFromArgb, Blend, argbFromHex } from "@material/material-color-utilities";

/**
 * 调色板提供器
 * @param argbColor 颜色来源
 * @param name token的后缀
 * @param append 调色板的类型
 * @param tones 调色板的色相
 * @return CorePalette Object
 */
function createPaletteProvider(argbColor: number, name: string, append: "a1" | "a2" | "a3" | "n1" | "n2" | "error", tones: number[]) {
  const palette = CorePalette.of(argbColor);
  return {
    rawPalette: {
      [name]: palette[append],
    },
    tones: tones,
  };
}

const globalPaletteTokens: Record<string, string> = {};
let paletteUpdateTimer: number | null = null;

function flushPaletteTokens() {
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

function setPalette(paletteProvider: { rawPalette: Record<string, any>; tones: number[] }) {
  Object.entries(paletteProvider.rawPalette).forEach(([key, palette]) => {
    const paletteKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    paletteProvider.tones.forEach((tone) => {
      const varName = `--md-ref-palette-${paletteKey}${tone}`;
      globalPaletteTokens[varName] = hexFromArgb(palette.tone(tone));
    });
  });

  if (paletteUpdateTimer !== null) {
    clearTimeout(paletteUpdateTimer);
  }
  paletteUpdateTimer = window.setTimeout(() => {
    flushPaletteTokens();
    paletteUpdateTimer = null;
  }, 50);
}

/**
 * 根据颜色生成调色板
 * @param baseColor - 输入一个 argb 颜色
 */
export async function generateColorPalette(baseColor: number) {
  type PaletteAppend = "a1" | "a2" | "a3" | "n1" | "n2" | "error";
  type Palette = { name: string; append: PaletteAppend; tones: number[] };
  type HarmonizedPalette = { color: string; name: string; append: PaletteAppend; tones: number[] };

  const palettes: Palette[] = [
    { name: "error", append: "error", tones: [10, 20, 30, 40, 80, 90, 100] },
    { name: "neutralVariant", append: "n2", tones: [30, 50, 60, 80, 90] },
    { name: "neutral", append: "n1", tones: [0, 4, 6, 10, 12, 17, 20, 22, 24, 50, 87, 90, 92, 94, 95, 96, 98, 100] },
    { name: "tertiary", append: "a3", tones: [10, 20, 30, 40, 80, 90, 100] },
    { name: "secondary", append: "a2", tones: [10, 20, 30, 40, 48, 80, 90, 100] },
    { name: "primary", append: "a1", tones: [10, 20, 30, 40, 80, 90, 100] },
  ];

  const harmonizedPalettes: HarmonizedPalette[] = [
    { color: "#a48ec0", name: "purple", append: "a1", tones: [10, 20, 30, 40, 80, 90, 95] },
    { color: "#f9d770", name: "yellow", append: "a1", tones: [10, 20, 30, 40, 80, 90, 95] },
    { color: "#68b88e", name: "green", append: "a1", tones: [10, 20, 30, 40, 80, 90, 95] },
    { color: "#5cb3cc", name: "blue", append: "a1", tones: [10, 20, 30, 40, 80, 90, 95] },
    { color: "#c27c88", name: "red", append: "a1", tones: [10, 20, 30, 40, 80, 90, 95] },
  ];

  for (const palette of palettes) {
    const paletteObject = createPaletteProvider(baseColor, palette.name, palette.append, palette.tones);
    setPalette(paletteObject);
  }

  for (const palette of harmonizedPalettes) {
    const paletteObject = createPaletteProvider(Blend.harmonize(argbFromHex(palette.color), baseColor), palette.name, palette.append, palette.tones);
    setPalette(paletteObject);
  }
}
