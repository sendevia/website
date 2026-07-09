/**
 * Web Worker：在独立线程中运行 `sourceColorFromImageBytes`，
 * 避免像素量化（QuantizerCelebi + Score）阻塞主线程渲染。
 */

import { sourceColorFromImageBytes } from "@material/material-color-utilities";

self.onmessage = (e: MessageEvent<{ pixels: Uint8ClampedArray; id: number }>) => {
  const { pixels, id } = e.data;
  const argb = sourceColorFromImageBytes(pixels);
  self.postMessage({ argb, id });
};
