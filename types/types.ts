/** 自定义主题配置的类型定义 */
export interface ThemeConfig {
  /** 默认主题色（十六进制） */
  defaultColor: string;
  /** 默认文章印象图 URL */
  defaultImpression: string;
  /** 站点版本号 */
  siteVersion: string;
  /** 导航栏分段 */
  navSegment: NavSegmentItem[];
}

/** 导航栏分段项 */
export interface NavSegmentItem {
  /** 显示文本 */
  text: string;
  /** Material Symbols 图标名 */
  icon: string;
  /** 导航链接 */
  link: string;
}
