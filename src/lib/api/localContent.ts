import { readFile } from "node:fs/promises";

import type { WPComment } from "./localCatalog";

export interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  featured_media: number;
  categories: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string; alt_text: string }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

export interface WPPage {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
}

export interface WPCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  count: number;
  parent: number;
}

export interface LocalContentData {
  posts: WPPost[];
  pages: WPPage[];
  categories: WPCategory[];
  commentsByPostId: Record<string, WPComment[]>;
}

const CONTENT_DIR = new URL("../../data/content/", import.meta.url);

let contentPromise: Promise<LocalContentData> | null = null;

async function readContentFile<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const fileUrl = new URL(fileName, CONTENT_DIR);
    const content = await readFile(fileUrl, "utf8");
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

export async function getLocalContent() {
  if (!contentPromise) {
    contentPromise = Promise.all([
      readContentFile<WPPost[]>("posts.json", []),
      readContentFile<WPPage[]>("pages.json", []),
      readContentFile<WPCategory[]>("categories.json", []),
      readContentFile<Record<string, WPComment[]>>("comments.json", {}),
    ]).then(([posts, pages, categories, commentsByPostId]) => ({
      posts,
      pages,
      categories,
      commentsByPostId,
    }));
  }

  return contentPromise;
}