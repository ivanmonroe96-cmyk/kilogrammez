/**
 * Local product catalog accessor.
 * Product data is snapshotted into src/data/catalog and read at build time.
 */

import { getLocalCatalog } from "./localCatalog";
import type { WCProduct } from "./localCatalog";

export type { WCCategory, WCProduct, WCProductVariation, WCTag } from "./localCatalog";

export interface WCReview {
  id: number;
  product_id: number;
  reviewer: string;
  rating: number;
  review: string;
  date_created: string;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

export async function getProducts(page = 1, perPage = 100) {
  const { products } = await getLocalCatalog();
  const startIndex = Math.max(page - 1, 0) * perPage;
  return products.slice(startIndex, startIndex + perPage);
}

export async function getAllProducts() {
  const { products } = await getLocalCatalog();
  return products;
}

export async function getProductBySlug(slug: string) {
  const { products } = await getLocalCatalog();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductCategories() {
  const { categories } = await getLocalCatalog();
  return categories.filter((category) => category.count > 0);
}

export async function getProductCategoryBySlug(slug: string) {
  const cats = await getProductCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}

export async function getProductsByCategory(categoryId: number) {
  const { products } = await getLocalCatalog();
  return products.filter((product) => product.categories.some((category) => category.id === categoryId));
}

export async function getProductTags() {
  const { tags } = await getLocalCatalog();
  return tags.filter((tag) => (tag.count ?? 0) > 0);
}

export async function getProductsByTag(tagId: number) {
  const { products } = await getLocalCatalog();
  return products.filter((product) => product.tags.some((tag) => tag.id === tagId));
}

export async function getProductReviews(_productId: number): Promise<WCReview[]> {
  // Store API does not expose reviews — return empty
  return [];
}

export async function getProductVariations(productUrl: string) {
  if (!productUrl) return [];
  const { variationsByPermalink } = await getLocalCatalog();
  return variationsByPermalink[productUrl] ?? [];
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
