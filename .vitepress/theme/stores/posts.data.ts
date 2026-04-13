/**
 * 文章数据获取
 * 生成文章 ID，格式化头部数据
 */

import { createContentLoader, type ContentData } from "vitepress";
import { formatDate } from "../utils/date";

export interface PostData {
  id: string;
  url: string;
  title: string;
  description: string;
  impression?: string[];
  timestamp: number;
  date: string;
  tags: string[];
  categories: string[];
  external_links?: Array<{
    type: string;
    label: string;
    link: string;
  }>;
  draft?: boolean;
}

declare const data: PostData[];
export { data };

const generateHashId = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
};

const formatDateTimestamp = (rawDate: any): { timestamp: number } => {
  const d = new Date(rawDate || 0);
  if (isNaN(d.getTime())) return { timestamp: 0 };
  return { timestamp: d.getTime() };
};

const toArray = (val: any): string[] => {
  if (Array.isArray(val)) return val;
  return val ? [val] : [];
};

export default createContentLoader("./posts/**/*.md", {
  includeSrc: false,
  excerpt: true,
  transform(raw: ContentData[]): PostData[] {
    const posts = raw.map(({ url, frontmatter }) => {
      const { timestamp } = formatDateTimestamp(frontmatter.date);

      return {
        id: generateHashId(url),
        url,
        title: frontmatter.title || "",
        description: frontmatter.description || "",
        impression: toArray(frontmatter.impression),
        timestamp,
        date: formatDate(frontmatter.date, { locale: "zh-CN" }),
        tags: toArray(frontmatter.tags),
        categories: toArray(frontmatter.categories),
        external_links: frontmatter.external_links,
        draft: frontmatter.draft || false,
      };
    });

    // 在开发模式下显示所有文章（包括草稿），在生产模式下过滤掉草稿
    const isDev = process.env.NODE_ENV === "development";
    const filteredPosts = isDev
      ? posts // 开发模式：显示所有文章
      : posts.filter((post) => !post.draft); // 生产模式：过滤掉草稿

    return filteredPosts.sort((a, b) => b.timestamp - a.timestamp);
  },
});
