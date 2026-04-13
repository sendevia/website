/**
 * 统一的日期格式化工具
 * 支持多语言本地化
 */

import { useDateFormat } from "@vueuse/core";

export interface DateFormatOptions {
  locale?: string;
  format?: string;
}

/**
 * 格式化日期为本地化字符串
 * @param date 日期对象或字符串
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: string | number | Date, options: DateFormatOptions = {}): string {
  const { locale = "zh-CN", format } = options;

  // 默认格式根据语言
  const defaultFormats: Record<string, string> = {
    "zh-CN": "YYYY年M月D日",
    "en-US": "MMM D, YYYY",
    "ja-JP": "YYYY年M月D日",
  };

  const dateFormat = format || defaultFormats[locale] || "YYYY-MM-DD";

  return useDateFormat(date, dateFormat).value;
}

/**
 * 获取相对时间字符串（用于最后更新时间）
 * @param date 日期对象或字符串
 * @param locale 语言代码
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: string | number | Date, locale: string = "zh-CN"): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const messages: Record<string, Record<string, string>> = {
    "zh-CN": {
      justNow: "刚刚",
      minutes: "分钟前",
      hours: "小时前",
      days: "天前",
      weeks: "周前",
      months: "个月前",
      years: "年前",
    },
    "en-US": {
      justNow: "just now",
      minutes: "minutes ago",
      hours: "hours ago",
      days: "days ago",
      weeks: "weeks ago",
      months: "months ago",
      years: "years ago",
    },
    "ja-JP": {
      justNow: "たった今",
      minutes: "分前",
      hours: "時間前",
      days: "日前",
      weeks: "週間前",
      months: "ヶ月前",
      years: "年前",
    },
  };

  const msg = messages[locale] || messages["zh-CN"];

  if (diffMs < 60000) return msg.justNow; // 1分钟内
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}${msg.minutes}`; // 小时内
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}${msg.hours}`; // 天内
  if (diffDays < 7) return `${diffDays}${msg.days}`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}${msg.weeks}`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}${msg.months}`;
  return `${Math.floor(diffDays / 365)}${msg.years}`;
}
