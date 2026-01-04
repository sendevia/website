import { computed } from "vue";

/**
 * 时间格式化组合式函数
 * 统一处理客户端时间格式化
 */
export function useTimeFormatter() {
  /**
   * 将时间字符串或时间戳转换为客户端本地时间
   */
  const toLocalTime = (time: string | number | Date): Date => {
    if (!time) return new Date(0);

    if (typeof time === "string") {
      // 处理 ISO 格式时间字符串
      return new Date(time);
    } else if (typeof time === "number") {
      // 时间戳
      return new Date(time);
    } else {
      // Date 对象
      return time;
    }
  };

  /**
   * 格式化日期
   * @param time 时间字符串、时间戳或 Date 对象
   * @param format 格式类型：'chinese' 或 'iso'
   */
  const formatDate = (time: string | number | Date, format: "chinese" | "iso" = "chinese"): string => {
    if (!time) return "";

    const date = toLocalTime(time);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (format === "iso") {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${year}年${month}月${day}日${hours}时${minutes}分`;
  };

  /**
   * 计算相对时间（多久以前）
   * @param time 过去的时间
   * @param now 当前时间，默认为客户端当前时间
   */
  const formatTimeAgo = (time: string | number | Date, now: number = Date.now()): string => {
    if (!time) return "刚刚";

    const pastTime = toLocalTime(time).getTime();
    if (isNaN(pastTime)) return "刚刚";

    const diffMs = now - pastTime;
    if (diffMs <= 0) return "刚刚";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    const timeUnits = [
      { value: years, unit: "年前" },
      { value: months, unit: "个月前" },
      { value: days, unit: "天前" },
      { value: hours, unit: "小时前" },
      { value: minutes, unit: "分钟前" },
      { value: seconds, unit: "秒前" },
    ];

    for (const { value, unit } of timeUnits) {
      if (value > 0) return `${value}${unit}`;
    }

    return "刚刚";
  };

  /**
   * 创建时间格式化计算属性
   */
  const useFormattedTime = (
    timeSource: () => string | number | Date | undefined | null,
    options: {
      format?: "chinese" | "iso";
      isTimeAgo?: boolean;
      now?: number;
    } = {}
  ) => {
    const { format = "chinese", isTimeAgo = false, now = Date.now() } = options;

    return computed(() => {
      const time = timeSource();
      if (!time) return "";

      if (isTimeAgo) {
        return formatTimeAgo(time, now);
      } else {
        return formatDate(time, format);
      }
    });
  };

  return {
    toLocalTime,
    formatDate,
    formatTimeAgo,
    useFormattedTime,
  };
}
