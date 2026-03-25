/**
 * WooCommerce Store API client (public, no auth required)
 * Uses wc/store/v1 endpoints to fetch products and categories.
 */

const STORE_API_URL = "https://kilogrammes.com/wp-json/wc/store/v1";

/* ------------------------------------------------------------------ */
/*  Types – normalised to match v3-like shapes used across the site   */
/* ------------------------------------------------------------------ */

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
  images: Array<{ id: number; src: string; alt: string }>;
  attributes: Array<{ name: string; options: string[] }>;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  meta_data: Array<{ key: string; value: string }>;
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

export interface WCReview {
  id: number;
  product_id: number;
  reviewer: string;
  rating: number;
  review: string;
  date_created: string;
}

/* ------------------------------------------------------------------ */
/*  Fetch helper                                                      */
/* ------------------------------------------------------------------ */

async function fetchStore<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${STORE_API_URL}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Store API error ${res.status}: ${endpoint}`);
  }
  return res.json() as Promise<T>;
}

/* ------------------------------------------------------------------ */
/*  Normalise a Store-API product into our WCProduct shape             */
/* ------------------------------------------------------------------ */

function decodeHtml(html: string): string {
  return html
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function normaliseProduct(raw: any): WCProduct {
  const minor = raw.prices?.currency_minor_unit ?? 2;
  const divisor = 10 ** minor;
  const price = (parseInt(raw.prices?.price ?? "0", 10) / divisor).toFixed(2);
  const regularPrice = (parseInt(raw.prices?.regular_price ?? "0", 10) / divisor).toFixed(2);
  const salePrice = (parseInt(raw.prices?.sale_price ?? "0", 10) / divisor).toFixed(2);

  return {
    id: raw.id,
    name: decodeHtml(raw.name ?? ""),
    slug: raw.slug,
    permalink: raw.permalink ?? "",
    description: raw.description ?? "",
    short_description: raw.short_description ?? "",
    sku: raw.sku ?? "",
    price,
    regular_price: regularPrice,
    sale_price: raw.on_sale ? salePrice : "",
    on_sale: raw.on_sale ?? false,
    stock_status: raw.is_in_stock ? "instock" : "outofstock",
    categories: (raw.categories ?? []).map((c: any) => ({
      id: c.id,
      name: decodeHtml(c.name ?? ""),
      slug: c.slug,
    })),
    images: (raw.images ?? []).map((img: any) => ({
      id: img.id ?? 0,
      src: img.src ?? "",
      alt: img.alt ?? "",
    })),
    attributes: (raw.attributes ?? []).map((a: any) => ({
      name: a.name,
      options: (a.terms ?? []).map((t: any) => t.name),
    })),
    average_rating: raw.average_rating ?? "0",
    rating_count: raw.review_count ?? 0,
    related_ids: [],
    meta_data: [],
  };
}

/* ------------------------------------------------------------------ */
/*  Normalise a Store-API category into our WCCategory shape           */
/* ------------------------------------------------------------------ */

function normaliseCategory(raw: any): WCCategory {
  return {
    id: raw.id,
    name: decodeHtml(raw.name ?? ""),
    slug: raw.slug,
    description: raw.description ?? "",
    count: raw.count ?? 0,
    image: raw.image ? { src: raw.image.src ?? raw.image, alt: raw.image.alt ?? "" } : null,
    parent: raw.parent ?? 0,
  };
}

function normaliseTag(raw: any): WCTag {
  return {
    id: raw.id,
    name: decodeHtml(raw.name ?? ""),
    slug: raw.slug,
    description: raw.description ?? "",
    count: raw.count ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export async function getProducts(page = 1, perPage = 100): Promise<WCProduct[]> {
  const raw = await fetchStore<any[]>("products", {
    page: String(page),
    per_page: String(perPage),
  });
  return raw.map(normaliseProduct);
}

export async function getAllProducts(): Promise<WCProduct[]> {
  const products: WCProduct[] = [];
  let page = 1;
  let batch: WCProduct[];
  do {
    batch = await getProducts(page, 100);
    products.push(...batch);
    page++;
  } while (batch.length === 100);
  return products;
}

export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  const raw = await fetchStore<any[]>("products", { slug, per_page: "1" });
  return raw[0] ? normaliseProduct(raw[0]) : null;
}

export async function getProductCategories(): Promise<WCCategory[]> {
  const raw = await fetchStore<any[]>("products/categories", {
    per_page: "100",
  });
  return raw.filter((c: any) => c.count > 0).map(normaliseCategory);
}

export async function getProductCategoryBySlug(slug: string): Promise<WCCategory | null> {
  const cats = await getProductCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}

export async function getProductsByCategory(categoryId: number): Promise<WCProduct[]> {
  const raw = await fetchStore<any[]>("products", {
    category: String(categoryId),
    per_page: "100",
  });
  return raw.map(normaliseProduct);
}

export async function getProductTags(): Promise<WCTag[]> {
  const raw = await fetchStore<any[]>("products/tags", {
    per_page: "100",
  });
  return raw.filter((tag: any) => (tag.count ?? 0) > 0).map(normaliseTag);
}

export async function getProductsByTag(tagId: number): Promise<WCProduct[]> {
  const raw = await fetchStore<any[]>("products", {
    tag: String(tagId),
    per_page: "100",
  });
  return raw.map(normaliseProduct);
}

export async function getProductReviews(_productId: number): Promise<WCReview[]> {
  // Store API does not expose reviews — return empty
  return [];
}

export function getProductAvailability(
  stockStatus: WCProduct["stock_status"],
): "InStock" | "OutOfStock" | "PreOrder" {
  switch (stockStatus) {
    case "instock":
      return "InStock";
    case "onbackorder":
      return "PreOrder";
    default:
      return "OutOfStock";
  }
}

export function formatPrice(price: string | number, currency = "EUR"): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(num);
}
