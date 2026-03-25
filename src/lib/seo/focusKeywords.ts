import { readFileSync } from "node:fs";
import { resolve } from "node:path";

interface NamedEntity {
  id?: number;
  slug?: string;
  name?: string;
  title?: { rendered?: string };
}

const KEYWORDS_FILE = resolve(process.cwd(), "keywords_fr.txt");

function normaliseText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function slugifyKeyword(value: string): string {
  return normaliseText(value).replace(/ /g, "-");
}

function dedupeBySlug(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const slug = slugifyKeyword(value);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    output.push(value.trim());
  }

  return output;
}

function loadKeywordList(): string[] {
  try {
    const raw = readFileSync(KEYWORDS_FILE, "utf8");
    return dedupeBySlug(
      raw
        .split(/\r?\n/g)
        .map((line) => line.trim())
        .filter(Boolean),
    );
  } catch {
    return [];
  }
}

export const allFocusKeywords = loadKeywordList();
const keywordSet = new Set(allFocusKeywords.map(normaliseText));

function preferredKeyword(candidates: Array<string | undefined>, fallback: string): string {
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (keywordSet.has(normaliseText(candidate))) {
      return candidate.trim();
    }
  }
  return fallback.trim();
}

export const homepagePrimaryKeyword = "kilogramme shop";

export const staticPageKeywords = {
  boutique: "boutique cbd",
  support: "support cbd",
  contact: "contact service client cbd",
  safety: "qualite securite cbd",
  editorial: "processus editorial cbd",
  wholesale: "grossiste cbd france",
  franchise: "franchise cbd",
  affiliation: "programme affiliation cbd",
  delivery: "livraison cbd europe",
  cart: "panier cbd",
  checkout: "finaliser commande cbd",
  account: "mon compte kilogrammes",
  returns: "remboursements retours cbd",
  privacy: "politique confidentialite rgpd",
  terms: "conditions generales vente cbd",
  homeAlias: homepagePrimaryKeyword,
} as const;

export const staticPageSlugs = Object.fromEntries(
  Object.entries(staticPageKeywords).map(([key, value]) => [key, slugifyKeyword(value)]),
) as Record<keyof typeof staticPageKeywords, string>;

const categoryKeywordBySourceSlug: Record<string, string> = {
  "fleurs-cbd": "fleurs cbd",
  "resine-cbd-hash-cbg-pollen": "resine cbd",
  "equivalent-thc": "boutique thc",
  "extracts-cbd": "filtered hash",
  "trim-cbd": "trim cbd",
  "popcorns-cbd": "cbd popcorn",
  "edibles-cbd": "gummies 15",
  "cosmetique-cbd": "cosmetiques cbd",
  "accessoires-cbd": "vaporisateur cbd",
  "huiles-cbd": "huile cbd",
  champignons: "amanita vape",
  "bons-plans": "cbd achat",
  abonnements: "kilogrammes",
  "best-sellers": "kilogrammes",
  "pack-cbd": "packs puff",
  "cbd-promo": "achat cbd en ligne",
};

export function getCategoryFocusKeyword(category: NamedEntity): string {
  const fallback = category.name ?? category.slug ?? "categorie cbd";
  return preferredKeyword(
    [
      category.slug ? categoryKeywordBySourceSlug[category.slug] : undefined,
      category.name,
      category.slug?.replace(/-/g, " "),
    ],
    fallback,
  );
}

export function getCategoryRouteSlug(category: NamedEntity): string {
  return slugifyKeyword(getCategoryFocusKeyword(category));
}

export function getCategoryUrl(category: NamedEntity): string {
  return `/categorie-produit/${getCategoryRouteSlug(category)}/`;
}

export function getCategoryRouteAliases(category: NamedEntity): string[] {
  return Array.from(new Set([getCategoryRouteSlug(category), category.slug].filter(Boolean) as string[]));
}

export function getProductFocusKeyword(product: NamedEntity): string {
  const fallback = product.name ?? product.slug ?? "produit cbd";
  return preferredKeyword(
    [
      product.name,
      product.slug?.replace(/-/g, " "),
    ],
    fallback,
  );
}

export function getProductRouteSlug(product: NamedEntity): string {
  return slugifyKeyword(getProductFocusKeyword(product));
}

export function getProductUrl(product: NamedEntity): string {
  return `/produit/${getProductRouteSlug(product)}/`;
}

export function getProductRouteAliases(product: NamedEntity): string[] {
  return Array.from(new Set([getProductRouteSlug(product), product.slug].filter(Boolean) as string[]));
}

const staticBlogKeywordBySlug: Record<string, string> = {
  "comment-choisir-un-grossiste-cbd": "grossiste cbd france",
  "quest-ce-que-le-trim-cbd": "trim cbd",
  "resine-cbd-vs-fleur-cbd": "resine cbd",
  "difference-entre-thc-et-thcp": "difference between thc and thcp",
  "comment-choisir-une-huile-cbd": "achat huile cbd",
  "cbd-est-il-legal-en-italie": "is cbd legal in italy 2025",
  "amnesia-haze-cbd-effets-aromes-differences": "amnesia haze cbd",
};

export function getBlogFocusKeyword(post: NamedEntity): string {
  const title = post.title?.rendered ?? post.name ?? "blog cbd";
  return preferredKeyword(
    [
      post.slug ? staticBlogKeywordBySlug[post.slug] : undefined,
      title,
      post.slug?.replace(/-/g, " "),
    ],
    title,
  );
}

export function getBlogRouteSlug(post: NamedEntity): string {
  return slugifyKeyword(getBlogFocusKeyword(post));
}

export function getBlogUrl(post: NamedEntity): string {
  return `/blog/${getBlogRouteSlug(post)}/`;
}

export function getBlogRouteAliases(post: NamedEntity): string[] {
  return Array.from(new Set([getBlogRouteSlug(post), post.slug].filter(Boolean) as string[]));
}

interface DeliveryLocationLike {
  name: string;
  slug: string;
  country: string;
}

export function getDeliveryFocusKeyword(location: DeliveryLocationLike): string {
  return preferredKeyword(
    [`cbd ${location.name.toLowerCase()}`, `livraison cbd ${location.name.toLowerCase()}`],
    `livraison cbd ${location.name}`,
  );
}

export function getDeliveryRouteSlug(location: DeliveryLocationLike): string {
  return slugifyKeyword(getDeliveryFocusKeyword(location));
}

export function getDeliveryUrl(location: DeliveryLocationLike): string {
  return `/shop/${getDeliveryRouteSlug(location)}/`;
}

export function getDeliveryRouteAliases(location: DeliveryLocationLike): string[] {
  return Array.from(new Set([getDeliveryRouteSlug(location), location.slug].filter(Boolean) as string[]));
}

interface ProductTagLike {
  name: string;
  slug?: string;
}

export function getTagFocusKeyword(tag: ProductTagLike): string {
  return preferredKeyword([tag.name, tag.slug?.replace(/-/g, " ")], tag.name);
}

export function getTagRouteSlug(tag: ProductTagLike): string {
  return slugifyKeyword(getTagFocusKeyword(tag));
}

export function getTagUrl(tag: ProductTagLike): string {
  return `/tag-produit/${getTagRouteSlug(tag)}/`;
}

export function getTagRouteAliases(tag: ProductTagLike): string[] {
  return Array.from(new Set([getTagRouteSlug(tag), tag.slug].filter(Boolean) as string[]));
}

export function getKeywordLandingSlugs(existingRootSlugs: Iterable<string>): Array<{ keyword: string; slug: string }> {
  const reserved = new Set(Array.from(existingRootSlugs, (value) => slugifyKeyword(value)));
  const pages: Array<{ keyword: string; slug: string }> = [];

  for (const keyword of allFocusKeywords) {
    const slug = slugifyKeyword(keyword);
    if (!slug || reserved.has(slug)) continue;
    reserved.add(slug);
    pages.push({ keyword, slug });
  }

  return pages;
}

export function getKeywordTopic(keyword: string): "legal" | "recipe" | "strain" | "shop" | "general" {
  const value = normaliseText(keyword);

  if (/(legal|laws|law|italy|finland|barcelona|420|spain|malta|cuba)/.test(value)) {
    return "legal";
  }
  if (/(butter|cannabutter|recipe|recipes|lollipop|edible|cake|cookie|brownies|rice crispy|crock pot|slow cooker)/.test(value)) {
    return "recipe";
  }
  if (/(haze|kush|strain|purple|amnesia|mango|gelato|moonrock|sunrock|hash|rosin)/.test(value)) {
    return "strain";
  }
  if (/(shop|achat|acheter|boutique|grossiste|wholesale|supplier|suppliers|franchise|cbd|kilogramme)/.test(value)) {
    return "shop";
  }
  return "general";
}

export function shouldNoindexKeywordLanding(keyword: string): boolean {
  const topic = getKeywordTopic(keyword);

  return topic === "recipe" || topic === "general";
}