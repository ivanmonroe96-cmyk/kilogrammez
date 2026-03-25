import { mkdir, writeFile } from "node:fs/promises";

import { createSiteUrlRewriter, localizeAssetUrl, localizeAssetUrlsInHtml } from "./lib/kilogrammes-media.mjs";

const SOURCE_STORE_API_URL = "https://kilogrammes.com/wp-json/wc/store/v1";
const SOURCE_WP_API_URL = "https://kilogrammes.com/wp-json/wp/v2";
const OUTPUT_DIR = new URL("../src/data/catalog/", import.meta.url);

const PRODUCT_MEDIA_OVERRIDES = {
  "purple-haze": {
    productImages: [
      {
        id: 200041,
        src: "/imported/kilogrammes/wp-content/uploads/2024/02/KGS_PURPLE_HAZE_V2_CBD_003.jpg",
        alt: "Fleur Buds CBD de Purple Haze",
      },
      {
        id: 200042,
        src: "/imported/kilogrammes/wp-content/uploads/2024/02/KGS_PURPLE_HAZE_V2_CBD_004.jpg",
        alt: "Buds CBD de Purple Haze",
      },
      {
        id: 200040,
        src: "/imported/kilogrammes/wp-content/uploads/2024/02/KGS_PURPLE_HAZE_V2_CBD_002.jpg",
        alt: "Buds CBD de Purple Haze",
      },
      {
        id: 200039,
        src: "/imported/kilogrammes/wp-content/uploads/2024/02/KGS_PURPLE_HAZE_V2_CBD_001.jpg",
        alt: "Buds CBD de Purple Haze",
      },
    ],
    variationImage: {
      src: "/imported/kilogrammes/wp-content/uploads/2024/02/KGS_PURPLE_HAZE_V2_CBD_003-600x600.jpg",
      full_src: "/imported/kilogrammes/wp-content/uploads/2024/02/KGS_PURPLE_HAZE_V2_CBD_003.jpg",
      alt: "Fleur Buds CBD de Purple Haze",
    },
    descriptionImageReplacements: [
      {
        fromSrc: "/imported/kilogrammes/wp-content/uploads/2024/02/culture-indoor-by-kilogrammes-cbd-qualite.jpg",
        fromAlt: "culture indoor by kilogrammes cbd qualité",
        toSrc: "/imported/kilogrammes/wp-content/uploads/2024/02/KGS_PURPLE_HAZE_V2_CBD_003.jpg",
        toAlt: "Fleur Buds CBD de Purple Haze",
      },
    ],
  },
  "purple-haze-cbd": {
    descriptionImageReplacements: [
      {
        fromSrc: "/imported/kilogrammes/wp-content/uploads/2024/02/culture-indoor-by-kilogrammes-cbd-qualite.jpg",
        fromAlt: "culture indoor by kilogrammes cbd qualité",
        toSrc: "/imported/kilogrammes/wp-content/uploads/2024/02/KGS_PURPLE_HAZE_V2_CBD_003.jpg",
        toAlt: "Fleur Buds CBD de Purple Haze",
      },
      {
        fromSrc: "/imported/kilogrammes/wp-content/uploads/2024/02/culture-indoor-workers-by-Kilogrammes-2.jpg",
        fromAlt: "jeune pousse de cannabis indoor kilogrammes",
        toSrc: "/imported/kilogrammes/wp-content/uploads/2024/02/KGS_PURPLE_HAZE_V2_CBD_003.jpg",
        toAlt: "Fleur Buds CBD de Purple Haze",
      },
      {
        fromSrc: "/imported/kilogrammes/wp-content/uploads/2024/02/se-detendre-avec-une-vue-sur-des-plants-de-cannabis-.jpg",
        fromAlt: "se détendre avec une vue sur des plants de cannabis",
        toSrc: "/imported/kilogrammes/wp-content/uploads/2024/02/KGS_PURPLE_HAZE_V2_CBD_004.jpg",
        toAlt: "Buds CBD de Purple Haze",
      },
    ],
  },
};

function applyDescriptionImageOverrides(html, slug) {
  const replacements = PRODUCT_MEDIA_OVERRIDES[slug]?.descriptionImageReplacements;
  if (!html || !replacements?.length) {
    return html;
  }

  let output = html;
  for (const replacement of replacements) {
    output = output.split(replacement.fromSrc).join(replacement.toSrc);
    if (replacement.fromAlt && replacement.toAlt) {
      output = output.split(`alt="${replacement.fromAlt}"`).join(`alt="${replacement.toAlt}"`);
    }
  }

  return output;
}

function decodeHtml(html) {
  return String(html ?? "")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#038;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function decodeHtmlAttribute(html) {
  return decodeHtml(html);
}

async function fetchJson(baseUrl, endpoint, params = {}) {
  const url = new URL(`${baseUrl}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url}`);
  }

  return response.json();
}

async function normaliseProduct(raw, siteUrlRewriter) {
  const minor = raw.prices?.currency_minor_unit ?? 2;
  const divisor = 10 ** minor;
  const price = (parseInt(raw.prices?.price ?? "0", 10) / divisor).toFixed(2);
  const regularPrice = (parseInt(raw.prices?.regular_price ?? raw.prices?.price ?? "0", 10) / divisor).toFixed(2);
  const salePrice = (parseInt(raw.prices?.sale_price ?? "0", 10) / divisor).toFixed(2);

  const mediaOverride = PRODUCT_MEDIA_OVERRIDES[raw.slug];

  return {
    id: raw.id,
    name: decodeHtml(raw.name),
    slug: raw.slug,
    permalink: siteUrlRewriter.rewriteSourceUrl(raw.permalink ?? ""),
    description: applyDescriptionImageOverrides(
      siteUrlRewriter.rewriteTextReferences(await localizeAssetUrlsInHtml(raw.description ?? "")),
      raw.slug,
    ),
    short_description: siteUrlRewriter.rewriteTextReferences(await localizeAssetUrlsInHtml(raw.short_description ?? "")),
    sku: raw.sku ?? "",
    price,
    regular_price: regularPrice,
    sale_price: raw.on_sale ? salePrice : "",
    on_sale: raw.on_sale ?? false,
    stock_status: raw.is_on_backorder ? "onbackorder" : raw.is_in_stock ? "instock" : "outofstock",
    categories: (raw.categories ?? []).map((category) => ({
      id: category.id,
      name: decodeHtml(category.name),
      slug: category.slug,
    })),
    tags: (raw.tags ?? []).map((tag) => ({
      id: tag.id,
      name: decodeHtml(tag.name),
      slug: tag.slug,
    })),
    images: mediaOverride?.productImages ?? await Promise.all((raw.images ?? []).map(async (image) => ({
      id: image.id ?? 0,
      src: await localizeAssetUrl(image.src ?? ""),
      alt: image.alt ?? "",
    }))),
    attributes: (raw.attributes ?? []).map((attribute) => ({
      name: attribute.name,
      taxonomy: attribute.taxonomy,
      has_variations: attribute.has_variations,
      options: (attribute.terms ?? []).map((term) => term.name),
    })),
    average_rating: raw.average_rating ?? "0",
    rating_count: raw.review_count ?? 0,
    related_ids: [],
    meta_data: [],
  };
}

async function normaliseCategory(raw) {
  return {
    id: raw.id,
    name: decodeHtml(raw.name),
    slug: raw.slug,
    description: raw.description ?? "",
    count: raw.count ?? 0,
    image: raw.image
      ? {
          src: await localizeAssetUrl(raw.image.src ?? raw.image),
          alt: raw.image.alt ?? "",
        }
      : null,
    parent: raw.parent ?? 0,
  };
}

function normaliseTag(raw) {
  return {
    id: raw.id,
    name: decodeHtml(raw.name),
    slug: raw.slug,
    description: raw.description ?? "",
    count: raw.count ?? 0,
  };
}

async function fetchAllProducts(siteUrlRewriter) {
  const products = [];
  let page = 1;

  while (true) {
    const batch = await fetchJson(SOURCE_STORE_API_URL, "products", {
      page,
      per_page: 100,
    });

    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    products.push(...(await Promise.all(batch.map((product) => normaliseProduct(product, siteUrlRewriter)))));

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  return products;
}

async function fetchAllProductSlugs() {
  const slugs = [];
  let page = 1;

  while (true) {
    const batch = await fetchJson(SOURCE_STORE_API_URL, "products", {
      page,
      per_page: 100,
    });

    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    slugs.push(...batch.map((product) => product.slug).filter(Boolean));

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  return slugs;
}

async function fetchCollection(endpoint, normalise) {
  const entries = await fetchJson(SOURCE_STORE_API_URL, endpoint, { per_page: 100 });
  return Array.isArray(entries) ? Promise.all(entries.map(normalise)) : [];
}

async function fetchProductPageHtml(sourceProductUrl) {
  if (!sourceProductUrl) {
    return "";
  }

  const response = await fetch(sourceProductUrl);
  if (!response.ok) {
    throw new Error(`Product page request failed with ${response.status} for ${sourceProductUrl}`);
  }

  return response.text();
}

async function extractProductGalleryImagesFromHtml(html, fallbackImages = []) {
  if (!html) {
    return [];
  }

  const galleryBlockMatch = html.match(
    /<div class="swiper swiper-product-gallery[\s\S]*?<div class="swiper swiper-product-gallery-navigation">/,
  );

  if (!galleryBlockMatch?.[0]) {
    return [];
  }

  const galleryBlock = galleryBlockMatch[0].split('<div class="swiper swiper-product-gallery-navigation">')[0];
  const fallbackImagesBySrc = new Map((fallbackImages ?? []).map((image) => [image.src, image]));
  const images = [];
  const seenSources = new Set();

  for (const imageTagMatch of galleryBlock.matchAll(/<img\b[^>]*>/g)) {
    const imageTag = imageTagMatch[0];
    const sourceMatch = imageTag.match(/\ssrc="([^"]+)"/);
    if (!sourceMatch?.[1]) {
      continue;
    }

    const localSource = await localizeAssetUrl(sourceMatch[1]);
    if (!localSource || seenSources.has(localSource)) {
      continue;
    }

    seenSources.add(localSource);

    const altMatch = imageTag.match(/\salt="([^"]*)"/);
    const fallbackImage = fallbackImagesBySrc.get(localSource);
    images.push({
      id: fallbackImage?.id ?? 0,
      src: localSource,
      alt: decodeHtml(altMatch?.[1] ?? fallbackImage?.alt ?? ""),
    });
  }

  return images;
}

async function extractProductVariationsFromHtml(html) {
  if (!html) {
    return [];
  }

  const match = html.match(/data-product_variations="([\s\S]*?)"/);
  if (!match?.[1]) {
    return [];
  }

  const rawVariations = JSON.parse(decodeHtmlAttribute(match[1]));
  return Promise.all(rawVariations.map(async (variation) => ({
    id: variation.variation_id,
    attributes: variation.attributes ?? {},
    display_price: variation.display_price ?? 0,
    display_regular_price: variation.display_regular_price ?? variation.display_price ?? 0,
    image: variation.image
      ? {
          src: await localizeAssetUrl(variation.image.src),
          full_src: await localizeAssetUrl(variation.image.full_src),
          alt: variation.image.alt,
        }
      : undefined,
    sku: variation.sku,
    variation_is_active: variation.variation_is_active,
    variation_is_visible: variation.variation_is_visible,
  })));
}

function getImageLookupKey(source) {
  const cleanSource = String(source ?? "").split("?")[0].toLowerCase();
  const fileName = cleanSource.slice(cleanSource.lastIndexOf("/") + 1);
  return fileName.replace(/-\d+x\d+(?=\.[a-z0-9]+$)/, "");
}

function resolveVariationImage(image, galleryImages = [], productName = "") {
  if (!image) {
    return undefined;
  }

  if (!galleryImages.length) {
    return image;
  }

  const galleryImagesBySource = new Map();
  const galleryImagesByKey = new Map();

  for (const galleryImage of galleryImages) {
    if (!galleryImage?.src) {
      continue;
    }

    galleryImagesBySource.set(galleryImage.src, galleryImage);
    galleryImagesByKey.set(getImageLookupKey(galleryImage.src), galleryImage);
  }

  const matchedImage = [image.full_src, image.src]
    .filter(Boolean)
    .map((source) => galleryImagesBySource.get(source) ?? galleryImagesByKey.get(getImageLookupKey(source)))
    .find(Boolean);

  const resolvedImage = matchedImage ?? galleryImages[0];
  return {
    src: resolvedImage.src,
    full_src: resolvedImage.src,
    alt: resolvedImage.alt || image.alt || productName,
  };
}

function buildManualVariationFallback(product) {
  const mediaOverride = PRODUCT_MEDIA_OVERRIDES[product.slug];
  if (product.slug !== "purple-haze") {
    return [];
  }

  const baseImage = mediaOverride?.variationImage;
  const image = baseImage ?? (product.images?.[0]?.src
    ? {
        src: product.images[0].src,
        full_src: product.images[0].src,
        alt: product.images[0].alt ?? product.name,
      }
    : undefined);

  return [
    {
      id: 217278035,
      attributes: {
        attribute_pa_poids: "3-5g",
      },
      display_price: 24.9,
      display_regular_price: 24.9,
      image,
      sku: "PURPLEHAZE35",
      variation_is_active: true,
      variation_is_visible: true,
    },
    {
      id: 217278012,
      attributes: {
        attribute_pa_poids: "12g",
      },
      display_price: 59.9,
      display_regular_price: 59.9,
      image,
      sku: "PURPLEHAZE12",
      variation_is_active: true,
      variation_is_visible: true,
    },
    {
      id: 217278100,
      attributes: {
        attribute_pa_poids: "100g",
      },
      display_price: 249.9,
      display_regular_price: 249.9,
      image,
      sku: "PURPLEHAZE100",
      variation_is_active: true,
      variation_is_visible: true,
    },
  ];
}

async function fetchCommentsByPostId(postId, siteUrlRewriter) {
  const comments = [];
  let page = 1;

  while (true) {
    const batch = await fetchJson(SOURCE_WP_API_URL, "comments", {
      post: postId,
      page,
      per_page: 100,
    }).catch(() => []);

    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    comments.push(...batch);

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  return comments
    .filter((comment) => (comment.status ?? "approved") === "approved")
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .map(async (comment) => ({
      id: comment.id,
      post: comment.post,
      parent: comment.parent,
      author_name: comment.author_name,
      date: comment.date,
      content: {
        rendered: siteUrlRewriter.rewriteTextReferences(
          await localizeAssetUrlsInHtml(comment.content?.rendered ?? ""),
        ),
      },
      link: siteUrlRewriter.rewriteSourceUrl(comment.link),
      status: comment.status,
      type: comment.type,
    }));
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex;
      currentIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length || 1) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function writeJson(fileName, value) {
  const outputFile = new URL(fileName, OUTPUT_DIR);
  await writeFile(outputFile, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  console.log("Fetching source catalog from kilogrammes.com...");

  const rawCategories = await fetchJson(SOURCE_STORE_API_URL, "products/categories", { per_page: 100 });
  const rawTags = await fetchJson(SOURCE_STORE_API_URL, "products/tags", { per_page: 100 });
  const productSlugs = await fetchAllProductSlugs();

  const siteUrlRewriter = createSiteUrlRewriter({
    productSlugs,
    categorySlugs: (Array.isArray(rawCategories) ? rawCategories : []).map((category) => category.slug).filter(Boolean),
    tagSlugs: (Array.isArray(rawTags) ? rawTags : []).map((tag) => tag.slug).filter(Boolean),
  });

  const [products, categories, tags] = await Promise.all([
    fetchAllProducts(siteUrlRewriter),
    fetchCollection("products/categories", normaliseCategory),
    fetchCollection("products/tags", normaliseTag),
  ]);

  console.log(`Fetched ${products.length} products, ${categories.length} categories, ${tags.length} tags.`);

  const productPageEntries = await mapWithConcurrency(products, 6, async (product) => {
    try {
      const sourceProductUrl = `https://kilogrammes.com/produit/${product.slug}/`;
      const html = await fetchProductPageHtml(sourceProductUrl);
      const [galleryImages, variations] = await Promise.all([
        extractProductGalleryImagesFromHtml(html, product.images),
        extractProductVariationsFromHtml(html),
      ]);

      return [product.permalink, { galleryImages, variations, error: null }];
    } catch (error) {
      return [product.permalink, { galleryImages: [], variations: [], error: error.message }];
    }
  });

  const productPageDataByPermalink = Object.fromEntries(productPageEntries);
  const productsWithResolvedImages = products.map((product) => {
    const mediaOverride = PRODUCT_MEDIA_OVERRIDES[product.slug];
    const productPageData = productPageDataByPermalink[product.permalink];

    return {
      ...product,
      images: mediaOverride?.productImages
        ?? (productPageData?.galleryImages?.length ? productPageData.galleryImages : product.images),
    };
  });

  const variationEntries = await mapWithConcurrency(productsWithResolvedImages, 6, async (product) => {
    const productPageData = productPageDataByPermalink[product.permalink];
    const variations = productPageData?.variations ?? [];

    if (variations.length > 0) {
      return [
        product.permalink,
        variations.map((variation) => ({
          ...variation,
          image: resolveVariationImage(variation.image, product.images, product.name),
        })),
      ];
    }

    const fallbackVariations = buildManualVariationFallback(product);
    if (fallbackVariations.length > 0) {
      if (productPageData?.error) {
        console.warn(`Using manual variation fallback for ${product.slug}: ${productPageData.error}`);
      } else {
        console.warn(`Using manual variation fallback for ${product.slug}.`);
      }
      return [product.permalink, fallbackVariations];
    }

    if (productPageData?.error) {
      console.warn(`Skipping variations for ${product.slug}: ${productPageData.error}`);
    }

    return [product.permalink, []];
  });

  const commentEntries = await mapWithConcurrency(productsWithResolvedImages, 8, async (product) => {
    try {
      return [String(product.id), await Promise.all(await fetchCommentsByPostId(product.id, siteUrlRewriter))];
    } catch (error) {
      console.warn(`Skipping comments for ${product.slug}: ${error.message}`);
      return [String(product.id), []];
    }
  });

  const variationsByPermalink = Object.fromEntries(variationEntries);
  const commentsByPostId = Object.fromEntries(commentEntries);

  await mkdir(OUTPUT_DIR, { recursive: true });
  await Promise.all([
    writeJson("products.json", productsWithResolvedImages),
    writeJson("categories.json", categories),
    writeJson("tags.json", tags),
    writeJson("variations.json", variationsByPermalink),
    writeJson("product-comments.json", commentsByPostId),
  ]);

  console.log("Catalog snapshot written to src/data/catalog.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});