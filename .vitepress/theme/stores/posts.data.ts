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
    return raw
      .map(({ url, frontmatter }) => {
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
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  },
});
