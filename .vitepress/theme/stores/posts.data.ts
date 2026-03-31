/**
 * 文章数据获取
 * 生成文章 ID，格式化头部数据
 */

import { createContentLoader, type ContentData } from "vitepress";

export interface PostData {
  id: string;
  title: string;
  url: string;
  date: string;
  timestamp: number;
  description: string;
  impression?: string[];
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

const formatDate = (rawDate: any): { dateStr: string; timestamp: number } => {
  const d = new Date(rawDate || 0);
  if (isNaN(d.getTime())) return { dateStr: "", timestamp: 0 };
  return {
    dateStr: d.toISOString().split("T")[0],
    timestamp: d.getTime(),
  };
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
      const { dateStr, timestamp } = formatDate(frontmatter.date);

      return {
        id: generateHashId(url),
        title: frontmatter.title || "",
        url,
        date: dateStr,
        timestamp,
        description: frontmatter.description || "",
        impression: toArray(frontmatter.impression),
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
