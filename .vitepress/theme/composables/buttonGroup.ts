/**
 * ButtonGroup 共享类型和 InjectionKey
 * 抽离到独立文件以避免 Button ↔ ButtonGroup 循环引用
 */
import type { InjectionKey } from "vue";

export type ButtonVariant = "button" | "chip";
export type ButtonShape = "round" | "square";
export type ButtonSize = "xs" | "s" | "m" | "l" | "xl";
export type ButtonColor = "elevated" | "filled" | "tonal" | "outlined" | "standard" | "text";

/** 数组驱动模式下每个按钮的配置项 */
export interface ButtonConfig {
  /** 唯一标识，选中状态追踪 */
  value: string;
  /** 按钮文字 */
  label?: string;
  /** Material Symbols 图标名 */
  icon?: string;
  /** 覆盖组级尺寸 */
  size?: ButtonSize;
  /** 覆盖组级颜色 */
  color?: ButtonColor;
  /** 覆盖组级形状 */
  shape?: ButtonShape;
  /** 覆盖组级变体 */
  variant?: ButtonVariant;
  /** 是否禁用 */
  disabled?: boolean;
  /** 链接地址 */
  href?: string;
  /** 链接打开方式 */
  target?: "_blank" | "_self" | "_parent" | "_top";
}

/** 通过 provide/inject 注入给子 Button 的上下文 */
export interface ButtonGroupContext {
  /** 选择模式，undefined 表示无选中行为 */
  selectionMode: "single" | "multi" | "required" | undefined;
  /** 组级默认变体 */
  variant: ButtonVariant | undefined;
  /** 组级默认形状 */
  shape: ButtonShape | undefined;
  /** 组级默认尺寸 */
  size: ButtonSize | undefined;
  /** 组级默认颜色 */
  color: ButtonColor | undefined;
  /** 判断某 value 是否被选中 */
  isSelected: (value: string) => boolean;
  /** 切换某 value 的选中状态 */
  toggle: (value: string) => void;
}

/** ButtonGroup provide key */
export const BUTTON_GROUP_KEY: InjectionKey<ButtonGroupContext> = Symbol("ButtonGroup");
