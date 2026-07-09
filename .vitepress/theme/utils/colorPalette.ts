import {
  argbFromHex,
  Blend,
  DynamicScheme,
  Hct,
  hexFromArgb,
  sourceColorFromImageBytes,
  TonalPalette,
  Variant,
} from "@material/material-color-utilities";

/** 主调色板列表 */
const MAIN_PALETTES = [
  { name: "error", key: "errorPalette" as const, tones: [10, 20, 30, 40, 80, 90, 100] },
  { name: "neutral-variant", key: "neutralVariantPalette" as const, tones: [30, 50, 60, 80, 90] },
  {
    name: "neutral",
    key: "neutralPalette" as const,
    tones: [0, 4, 6, 10, 12, 17, 20, 22, 24, 50, 87, 90, 92, 94, 95, 96, 98, 100],
  },
  { name: "tertiary", key: "tertiaryPalette" as const, tones: [10, 20, 30, 40, 80, 90, 100] },
  { name: "secondary", key: "secondaryPalette" as const, tones: [10, 20, 30, 40, 48, 80, 90, 100] },
  { name: "primary", key: "primaryPalette" as const, tones: [10, 20, 30, 40, 80, 90, 100] },
];
/** 协调色的预设 ARGB */
const HARMONIZED_ARGBS: number[] = [
  argbFromHex("#a020f0"),
  argbFromHex("#ffd700"),
  argbFromHex("#70c870"),
  argbFromHex("#4f84ff"),
  argbFromHex("#f03f24"),
];
/** 协调色对应的 CSS 变量名后缀 */
const HARMONIZED_NAMES = ["purple", "yellow", "green", "blue", "red"] as const;
/** 协调色使用的色调列表 */
const HARMONIZED_TONES = [10, 20, 30, 40, 80, 90, 95] as const;
/** ARGB → DynamicScheme 缓存 */
const SCHEME_CACHE = new Map<number, DynamicScheme>();
const CACHE_MAX = 50;
const DEFAULT_SPEC_VERSION = "2021";

function createScheme(argb: number): DynamicScheme {
  let scheme = SCHEME_CACHE.get(argb);
  if (scheme) return scheme;
  if (SCHEME_CACHE.size >= CACHE_MAX) {
    const key = SCHEME_CACHE.keys().next().value;
    if (key !== undefined) SCHEME_CACHE.delete(key);
  }
  scheme = new DynamicScheme({
    sourceColorHct: Hct.fromInt(argb),
    variant: Variant.TONAL_SPOT,
    isDark: false,
    contrastLevel: 0.0,
    specVersion: DEFAULT_SPEC_VERSION,
  });
  SCHEME_CACHE.set(argb, scheme);
  return scheme;
}

function assignTokens(
  target: Record<string, string>,
  scheme: DynamicScheme,
  entries: readonly { name: string; key: keyof DynamicScheme; tones: readonly number[] }[],
): void {
  for (const { name, key, tones } of entries) {
    const palette = scheme[key] as TonalPalette;
    for (const tone of tones) {
      target[`--md-ref-palette-${name}${tone}`] = hexFromArgb(palette.tone(tone));
    }
  }
}

/**
 * 根据 seed 色生成完整的 Material Design 调色板 CSS 变量映射。
 */
export function generatePaletteTokens(seedHex: string): Record<string, string> {
  const hex = seedHex.trim();
  const source = argbFromHex(hex.startsWith("#") ? hex : `#${hex}`);
  const tokens: Record<string, string> = {};
  const sourceScheme = createScheme(source);

  assignTokens(tokens, sourceScheme, MAIN_PALETTES);

  for (let i = 0; i < HARMONIZED_ARGBS.length; i++) {
    const harmonized = Blend.harmonize(HARMONIZED_ARGBS[i], source);
    const scheme = createScheme(harmonized);
    const palette = scheme.primaryPalette;
    const name = HARMONIZED_NAMES[i];
    for (const tone of HARMONIZED_TONES) {
      tokens[`--md-ref-palette-${name}${tone}`] = hexFromArgb(palette.tone(tone));
    }
  }

  return tokens;
}

/* ---- 图片取色（带去重缓存 + Worker） ---- */

/** URL → 提取结果 Promise 的映射，避免同一 URL 并发多次提取 */
const colorPromises = new Map<string, Promise<number>>();

/* Worker 单例：像素量化在独立线程执行 */
let colorWorker: Worker | null | undefined = undefined;
let workerId = 0;
const workerCallbacks = new Map<number, (argb: number) => void>();

function getWorker(): Worker | null {
  if (colorWorker !== undefined) return colorWorker;
  try {
    colorWorker = new Worker(new URL("./colorWorker.ts", import.meta.url), { type: "module" });
    colorWorker.onmessage = (e: MessageEvent<{ argb: number; id: number }>) => {
      const cb = workerCallbacks.get(e.data.id);
      cb?.(e.data.argb);
      workerCallbacks.delete(e.data.id);
    };
    colorWorker.onerror = () => {
      colorWorker?.terminate();
      colorWorker = null;
    };
  } catch {
    colorWorker = null;
  }
  return colorWorker;
}

/**
 * 在 Worker（或主线程 fallback）中运行像素量化。
 */
async function computeArgb(pixels: Uint8ClampedArray): Promise<number> {
  const worker = getWorker();
  if (worker) {
    return new Promise((resolve) => {
      const id = ++workerId;
      workerCallbacks.set(id, resolve);
      worker.postMessage({ pixels, id });
    });
  }
  // fallback：主线程直接计算
  return sourceColorFromImageBytes(pixels);
}

/**
 * 通过 Canvas 从 DOM 中的 `<img>` 元素提取主题色，量化在 Worker 中执行。
 */
async function extractFromImgElement(img: HTMLImageElement): Promise<number> {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D 上下文不可用");
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, w, h);

  const argb = await computeArgb(data);
  return argb;
}

/**
 * 从图片 URL 提取主题色（ARGB 格式）。
 * 如果该 URL 正在提取中，复用已有的 Promise。
 */
export async function extractColorFromImage(imageUrl: string): Promise<number> {
  const existing = colorPromises.get(imageUrl);
  if (existing) return existing;

  const promise = new Promise<number>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      extractFromImgElement(img).then(resolve).catch(reject);
    };
    img.onerror = () => reject(new Error(`图片加载失败: ${imageUrl}`));
    img.src = imageUrl;
  });

  colorPromises.set(imageUrl, promise);
  promise.finally(() => colorPromises.delete(imageUrl));
  return promise;
}

/**
 * 从 DOM 中已渲染的 `<img>` 元素取色，无需重新加载图片。
 */
export async function extractColorFromElement(imgEl: HTMLImageElement): Promise<number> {
  if (imgEl.complete && imgEl.naturalWidth > 0) {
    return extractFromImgElement(imgEl);
  }
  return extractColorFromImage(imgEl.src);
}

export function injectPaletteTokens(tokens: Record<string, string>): void {
  let styleEl = document.getElementById("md-ref-palette-style") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "md-ref-palette-style";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `:root{${Object.entries(tokens)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;
}
