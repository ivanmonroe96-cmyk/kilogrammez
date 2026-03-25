import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_HOSTS = new Set([
  "kilogrammes.com",
  "www.kilogrammes.com",
  "kilogramme-shop.com",
  "www.kilogramme-shop.com",
]);

const DOWNLOADABLE_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".mov",
  ".mp4",
  ".pdf",
  ".png",
  ".svg",
  ".ttf",
  ".webm",
  ".webp",
  ".woff",
  ".woff2",
]);

const PUBLIC_PREFIX = "/imported/kilogrammes";
const OUTPUT_ROOT = new URL("../../public/imported/kilogrammes/", import.meta.url);
const MAX_CONCURRENT_DOWNLOADS = 8;
const downloadCache = new Map();
const waitQueue = [];
let activeDownloads = 0;

function hasDownloadableExtension(pathname) {
  const lowerPath = pathname.toLowerCase();
  return [...DOWNLOADABLE_EXTENSIONS].some((extension) => lowerPath.endsWith(extension));
}

function normaliseUrl(value) {
  if (typeof value === "string" && value.startsWith("//")) {
    try {
      return new URL(`https:${value}`);
    } catch {
      return null;
    }
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function isMirrorableAssetUrl(value) {
  const url = normaliseUrl(value);
  if (!url) return false;
  if (!SOURCE_HOSTS.has(url.hostname)) return false;
  return hasDownloadableExtension(url.pathname);
}

function getOutputFileUrl(remoteUrl) {
  const url = new URL(remoteUrl);
  const assetPath = url.pathname.replace(/^\/+/, "");
  return new URL(assetPath, OUTPUT_ROOT);
}

function getLocalAssetPath(remoteUrl) {
  const url = new URL(remoteUrl);
  return `${PUBLIC_PREFIX}/${url.pathname.replace(/^\/+/, "")}`;
}

async function ensureAssetDownloaded(remoteUrl) {
  const outputFileUrl = getOutputFileUrl(remoteUrl);
  const outputFilePath = fileURLToPath(outputFileUrl);

  await mkdir(dirname(outputFilePath), { recursive: true });

  try {
    await access(outputFilePath);
    return getLocalAssetPath(remoteUrl);
  } catch {
    await acquireDownloadSlot();
    try {
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          const response = await fetch(remoteUrl);
          if (!response.ok) {
            throw new Error(`Asset download failed with ${response.status} for ${remoteUrl}`);
          }

          const body = Buffer.from(await response.arrayBuffer());
          await writeFile(outputFilePath, body);
          return getLocalAssetPath(remoteUrl);
        } catch (error) {
          if (attempt === 3) {
            console.warn(`Skipping asset mirror for ${remoteUrl}: ${error.message}`);
            return remoteUrl;
          }
        }
      }

      return remoteUrl;
    } finally {
      releaseDownloadSlot();
    }
  }
}

async function acquireDownloadSlot() {
  if (activeDownloads < MAX_CONCURRENT_DOWNLOADS) {
    activeDownloads += 1;
    return;
  }

  await new Promise((resolve) => {
    waitQueue.push(resolve);
  });
  activeDownloads += 1;
}

function releaseDownloadSlot() {
  activeDownloads = Math.max(0, activeDownloads - 1);
  const next = waitQueue.shift();
  if (next) {
    next();
  }
}

export async function mirrorAsset(remoteUrl) {
  if (!isMirrorableAssetUrl(remoteUrl)) {
    return remoteUrl;
  }

  if (!downloadCache.has(remoteUrl)) {
    downloadCache.set(remoteUrl, ensureAssetDownloaded(remoteUrl));
  }

  return downloadCache.get(remoteUrl);
}

export async function localizeAssetUrl(remoteUrl) {
  if (!remoteUrl) return remoteUrl;
  return mirrorAsset(remoteUrl);
}

export async function localizeAssetUrlsInHtml(html) {
  if (!html) return html;

  const matches = html.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
  const mirrorableUrls = [...new Set(matches.filter((url) => isMirrorableAssetUrl(url)))];
  if (mirrorableUrls.length === 0) {
    return html;
  }

  let output = html;
  for (const remoteUrl of mirrorableUrls) {
    const localUrl = await mirrorAsset(remoteUrl);
    output = output.split(remoteUrl).join(localUrl);
  }

  return output;
}

function normaliseSourcePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function createSiteUrlRewriter({
  productSlugs = [],
  categorySlugs = [],
  tagSlugs = [],
  postSlugs = [],
  pageSlugs = [],
} = {}) {
  const products = new Set(productSlugs);
  const categories = new Set(categorySlugs);
  const tags = new Set(tagSlugs);
  const posts = new Set(postSlugs);
  const pages = new Set(pageSlugs);

  function rewriteSourceUrl(value) {
    const url = normaliseUrl(value);
    if (!url || !SOURCE_HOSTS.has(url.hostname)) {
      return value;
    }

    const segments = url.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);

    if (segments.length >= 2 && segments[0] === "produit" && products.has(segments[1])) {
      return `/produit/${segments[1]}/${url.search}${url.hash}`;
    }

    if (segments.length >= 2 && ["categorie-produit", "product-category"].includes(segments[0]) && categories.has(segments[1])) {
      return `/categorie-produit/${segments[1]}/${url.search}${url.hash}`;
    }

    if (segments.length >= 2 && ["tag-produit", "product-tag", "tag"].includes(segments[0]) && tags.has(segments[1])) {
      return `/tag-produit/${segments[1]}/${url.search}${url.hash}`;
    }

    if (segments.length >= 2 && segments[0] === "blog" && posts.has(segments[1])) {
      return `/blog/${segments[1]}/${url.search}${url.hash}`;
    }

    if (segments.length === 1 && posts.has(segments[0])) {
      return `/blog/${segments[0]}/${url.search}${url.hash}`;
    }

    if (segments.length === 1 && pages.has(segments[0])) {
      return `/${segments[0]}/${url.search}${url.hash}`;
    }

    return `${normaliseSourcePath(url.pathname)}${url.search}${url.hash}`;
  }

  function rewriteTextReferences(text) {
    if (!text) return text;

    return text
      .replace(/mailto:([a-z0-9._%+-]+)@kilogrammes\.com/gi, (_match, localPart) => `mailto:${localPart}@kilogramme-shop.com`)
      .replace(/([a-z0-9._%+-]+)@kilogrammes\.com/gi, (_match, localPart) => `${localPart}@kilogramme-shop.com`)
      .replace(/(?:https?:)?\/\/(?:www\.)?kilogrammes\.com[^\s"'<>]*/gi, (match) => rewriteSourceUrl(match))
      .replace(/(?:www\.)?kilogrammes\.com/gi, "kilogramme-shop.com");
  }

  return {
    rewriteSourceUrl,
    rewriteTextReferences,
  };
}