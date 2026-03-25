/**
 * WordPress REST API client
 * Fetches posts, pages, and media from the existing WordPress backend.
 * Set WP_API_URL in your environment or .env file.
 */

const WP_API_URL =
  import.meta.env.WP_API_URL ?? "https://kilogramme-shop.com/wp-json/wp/v2";

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

async function fetchWP<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${WP_API_URL}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`WP API error ${res.status}: ${endpoint}`);
  }
  return res.json() as Promise<T>;
}

export async function getPosts(page = 1, perPage = 100): Promise<WPPost[]> {
  return fetchWP<WPPost[]>("posts", {
    page: String(page),
    per_page: String(perPage),
    _embed: "true",
  });
}

export async function getAllPosts(): Promise<WPPost[]> {
  const posts: WPPost[] = [];
  let page = 1;
  let batch: WPPost[];
  do {
    batch = await getPosts(page, 100);
    posts.push(...batch);
    page++;
  } while (batch.length === 100);
  return posts;
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const posts = await fetchWP<WPPost[]>("posts", { slug, _embed: "true" });
  return posts[0] ?? null;
}

export async function getPages(): Promise<WPPage[]> {
  return fetchWP<WPPage[]>("pages", { per_page: "100" });
}

export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const pages = await fetchWP<WPPage[]>("pages", { slug });
  return pages[0] ?? null;
}

export async function getCategories(): Promise<WPCategory[]> {
  return fetchWP<WPCategory[]>("categories", { per_page: "100" });
}

export function getFeaturedImage(post: WPPost): string | undefined {
  return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}
