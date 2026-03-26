import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  images: Array<{ id: number; src: string; alt: string }>;
  attributes: Array<{ name: string; options: string[]; taxonomy?: string; has_variations?: boolean }>;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  meta_data: Array<{ key: string; value: string }>;
}

export interface WCProductVariation {
  id: number;
  attributes: Record<string, string>;
  display_price: number;
  display_regular_price: number;
  image?: {
    src?: string;
    full_src?: string;
    alt?: string;
  };
  sku?: string;
  variation_is_active?: boolean;
  variation_is_visible?: boolean;
}

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  image: { src: string; alt: string } | null;
  parent: number;
}

export interface WCTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface WPComment {
  id: number;
  post: number;
  parent: number;
  author_name: string;
  date: string;
  content: { rendered: string };
  link: string;
  status?: string;
  type?: string;
}

export interface LocalCatalogData {
  products: WCProduct[];
  categories: WCCategory[];
  tags: WCTag[];
  variationsByPermalink: Record<string, WCProductVariation[]>;
  commentsByPostId: Record<string, WPComment[]>;
}

const CATALOG_DIR = resolve(process.cwd(), "src/data/catalog");

let catalogPromise: Promise<LocalCatalogData> | null = null;

async function readCatalogFile<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const filePath = resolve(CATALOG_DIR, fileName);
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

export async function getLocalCatalog(): Promise<LocalCatalogData> {
  if (!catalogPromise) {
    catalogPromise = Promise.all([
      readCatalogFile<WCProduct[]>("products.json", []),
      readCatalogFile<WCCategory[]>("categories.json", []),
      readCatalogFile<WCTag[]>("tags.json", []),
      readCatalogFile<Record<string, WCProductVariation[]>>("variations.json", {}),
      readCatalogFile<Record<string, WPComment[]>>("product-comments.json", {}),
    ]).then(([products, categories, tags, variationsByPermalink, commentsByPostId]) => ({
      products,
      categories,
      tags,
      variationsByPermalink,
      commentsByPostId,
    }));
  }

  return catalogPromise;
}