/**
 * 元素宽度测量组合式函数
 * 获取元素实际宽度，并以CSS变量的形式设置到父级元素上
 */

import { onMounted, onBeforeUnmount } from "vue";
import { isClient } from "../utils/env";

/** 元素宽度观察器配置 */
interface ElementWidthObserverConfig {
  /** CSS选择器 */
  selector: string;
  /** CSS变量名（可选，默认为基于选择器生成的名称） */
  variableName?: string;
  /** 父级选择器（可选，默认为直接父级） */
  parentSelector?: string;
  /** 精度（小数位数，默认2位） */
  precision?: number;
  /** 是否忽略父级宽度限制（默认false，即确保宽度不超过父级） */
  ignoreParentLimit?: boolean;
}

/** 生成有效的CSS变量名 */
function generateVariableName(selector: string): string {
  // 移除特殊字符，用连字符连接
  let name = selector
    .replace(/[#\.\s>+~\[\]="']/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  if (!name) {
    name = "element-width";
  }

  if (!/^[a-z]/.test(name)) {
    name = "el-" + name + "-width";
  }

  return name + "-width";
}

/** 格式化宽度值，保留指定精度 */
function formatWidth(width: number, precision: number = 2): string {
  // 使用toFixed确保精度，但移除不必要的尾随零
  const fixed = width.toFixed(precision);
  // 移除尾随的零和小数点（如果不需要）
  return parseFloat(fixed).toString();
}

/** 设置元素宽度CSS变量到父级元素 */
export function setupWidthObserver(config: ElementWidthObserverConfig, targetElements?: HTMLElement[]): () => void {
  const { selector, variableName, parentSelector, precision = 2, ignoreParentLimit = false } = config;

  // 如果提供了 targetElements，则使用它们；否则使用 selector 查询
  const elements = targetElements || Array.from(document.querySelectorAll<HTMLElement>(selector));

  if (elements.length === 0) {
    return () => {};
  }

  const varName = variableName || generateVariableName(selector);

  const updateWidths = () => {
    elements.forEach((element) => {
      // 使用getBoundingClientRect获取浮点数宽度
      const elementWidth = element.getBoundingClientRect().width;

      // 获取父级元素
      let parentElement: HTMLElement | null = null;
      if (parentSelector) {
        parentElement = element.closest<HTMLElement>(parentSelector);
      } else {
        parentElement = element.parentElement;
      }

      let finalWidth = elementWidth;

      // 如果未忽略父级限制，则确保宽度不超过父元素和祖父元素宽度
      if (!ignoreParentLimit && parentElement) {
        const parentWidth = parentElement.getBoundingClientRect().width;
        // 取元素宽度和父元素宽度中较小的值
        finalWidth = Math.min(elementWidth, parentWidth);

        // 获取祖父级元素（父级的父级）
        const grandParentElement = parentElement.parentElement;
        if (grandParentElement) {
          const grandParentWidth = grandParentElement.getBoundingClientRect().width;
          // 取元素宽度、父元素宽度和祖父元素宽度中最小的值
          finalWidth = Math.min(finalWidth, grandParentWidth);
        }
      }

      const formattedWidth = formatWidth(finalWidth, precision);

      // 确定变量设置的目标元素
      // 如果指定了 parentSelector，则必须设置在父级；否则尝试设置在父元素或自身
      let targetElement: HTMLElement | null = null;
      if (parentSelector) {
        targetElement = parentElement;
      } else {
        targetElement = parentElement || element;
      }

      if (targetElement) {
        targetElement.style.setProperty(`--${varName}`, `${formattedWidth}px`);
      }
    });
  };

  // 初始计算
  updateWidths();

  // 监听窗口大小变化
  window.addEventListener("resize", updateWidths);

  // 返回清理函数
  return () => {
    window.removeEventListener("resize", updateWidths);
  };
}

/**
 * 元素宽度观察器
 * 在组件挂载时设置宽度观察器，组件卸载时自动清理
 */
export function useElementWidthObserver(configs: ElementWidthObserverConfig[]) {
  if (!isClient()) return;

  const cleanupFunctions: Array<() => void> = [];

  onMounted(() => {
    configs.forEach((config) => {
      const cleanup = setupWidthObserver(config);
      cleanupFunctions.push(cleanup);
    });
  });

  onBeforeUnmount(() => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  });
}
