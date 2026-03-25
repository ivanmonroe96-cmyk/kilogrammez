export interface SiteMetadata {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  noindex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
  };
}

const SITE_NAME = "Kilogrammes";
const SITE_URL = "https://kilogramme-shop.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

export function buildTitle(pageTitle?: string): string {
  if (!pageTitle) return `${SITE_NAME} – Cannabis Shop : Fleurs CBD, Hash & Simili-THC depuis 2016`;
  return `${pageTitle} | ${SITE_NAME}`;
}

export function buildCanonical(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

export function getOgImage(image?: string): string {
  return image || DEFAULT_OG_IMAGE;
}

export function buildMetadata(opts: {
  title?: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: SiteMetadata["ogType"];
  noindex?: boolean;
  article?: SiteMetadata["article"];
}): SiteMetadata {
  return {
    title: buildTitle(opts.title),
    description: opts.description,
    canonical: buildCanonical(opts.path),
    ogImage: getOgImage(opts.ogImage),
    ogType: opts.ogType ?? "website",
    noindex: opts.noindex ?? false,
    article: opts.article,
  };
}
