import { ref, Ref } from "vue";

type Data = {
  title: string;
  description?: string;
  impression?: string;
  date?: string;
  timestamp?: number;
  url: string;
  content?: string;
};

declare global {
  interface ImportMeta {
    glob: (pattern: string, options?: any) => Record<string, any>;
  }
}

const modules = import.meta.glob("../../../posts/**/*.md", { eager: true }) as Record<string, any>;

export function useAllPosts(asRef: true): Ref<Data[]>;
export function useAllPosts(asRef?: false): Data[];
export function useAllPosts(asRef = false) {
  const posts = Object.keys(modules).map((filePath) => {
    const mod: any = (modules as any)[filePath];
    const frontmatter =
      mod.frontmatter ||
      mod.default?.frontmatter ||
      mod.attributes ||
      mod.default?.attributes ||
      mod.__pageData?.frontmatter ||
      mod.default?.__pageData?.frontmatter ||
      {};

    const rawDate = frontmatter.date ?? null;

    let dateStr = "";
    let timestamp: number | undefined = undefined;

    if (rawDate != null) {
      let d: Date | null = null;
      if (rawDate instanceof Date) d = rawDate;
      else if (typeof rawDate === "number") d = new Date(rawDate);
      else if (typeof rawDate === "string") {
        const parsed = Date.parse(rawDate);
        if (!isNaN(parsed)) d = new Date(parsed);
        else d = new Date(rawDate);
      } else {
        const parsed = Date.parse(String(rawDate));
        if (!isNaN(parsed)) d = new Date(parsed);
      }

      if (d && !isNaN(d.getTime())) {
        dateStr = d.toISOString().slice(0, 10);
        timestamp = d.getTime();
      }
    }

    const filename = filePath.split("/").pop() || filePath;
    const name = filename.replace(/\.mdx?$/, "").replace(/\.md$/, "");
    const url = `/posts/${encodeURIComponent(name)}.html`;

    const content =
      mod.excerpt ||
      mod.excerpt?.text ||
      mod.attributes?.excerpt ||
      (typeof mod.default === "string" ? mod.default : undefined);

    const po: Data = {
      title: frontmatter.title || name,
      description:
        frontmatter.description || frontmatter.excerpt || (typeof content === "string" ? content.slice(0, 160) : "") || "",
      date: dateStr,
      timestamp,
      url,
      content: typeof content === "string" ? content : undefined,
      impression: frontmatter.impression,
    };

    return po;
  });

  posts.sort((a, b) => {
    if (a.timestamp && b.timestamp) return b.timestamp - a.timestamp;
    if (a.timestamp) return -1;
    if (b.timestamp) return 1;
    return 0;
  });

  const postsRef = ref<Data[]>(posts);

  return asRef ? postsRef : postsRef.value;
}

export type { Data as Post };
