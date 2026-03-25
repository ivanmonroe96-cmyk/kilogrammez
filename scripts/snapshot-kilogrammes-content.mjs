import { mkdir, writeFile } from "node:fs/promises";

import { createSiteUrlRewriter, localizeAssetUrl, localizeAssetUrlsInHtml } from "./lib/kilogrammes-media.mjs";

const SOURCE_STORE_API_URL = "https://kilogrammes.com/wp-json/wc/store/v1";

const SOURCE_WP_API_URL = "https://kilogrammes.com/wp-json/wp/v2";
const OUTPUT_DIR = new URL("../src/data/content/", import.meta.url);

async function fetchJson(endpoint, params = {}) {
  const url = new URL(`${SOURCE_WP_API_URL}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status} for ${url}`);
  }

  return response.json();
}

async function fetchStoreJson(endpoint, params = {}) {
  const url = new URL(`${SOURCE_STORE_API_URL}/${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Store request failed with ${response.status} for ${url}`);
  }

  return response.json();
}

async function fetchAllProductSlugs() {
  const slugs = [];
  let page = 1;

  while (true) {
    const batch = await fetchStoreJson("products", { page, per_page: 100 });
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

async function fetchAllPosts() {
  const posts = [];
  let page = 1;

  while (true) {
    const batch = await fetchJson("posts", {
      page,
      per_page: 100,
      _embed: true,
    });

    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    posts.push(...batch);

    if (batch.length < 100) {
      break;
    }

    page += 1;
  }

  return posts;
}

async function fetchAllPages() {
  return fetchJson("pages", { per_page: 100 });
}

async function fetchAllCategories() {
  return fetchJson("categories", { per_page: 100 });
}

async function fetchCommentsByPostId(postId, siteUrlRewriter) {
  const comments = [];
  let page = 1;

  while (true) {
    const batch = await fetchJson("comments", {
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

  return Promise.all(
    comments
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
      })),
  );
}

async function normalisePost(post, siteUrlRewriter) {
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.map(async (media) => ({
    source_url: await localizeAssetUrl(media.source_url),
    alt_text: media.alt_text ?? "",
  })) ?? [];
  const embeddedTerms = (post._embedded?.["wp:term"] ?? []).map((termGroup) =>
    termGroup.map((term) => ({
      id: term.id,
      name: term.name,
      slug: term.slug,
    })),
  );

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: { rendered: siteUrlRewriter.rewriteTextReferences(await localizeAssetUrlsInHtml(post.excerpt?.rendered ?? "")) },
    content: { rendered: siteUrlRewriter.rewriteTextReferences(await localizeAssetUrlsInHtml(post.content?.rendered ?? "")) },
    date: post.date,
    modified: post.modified,
    featured_media: post.featured_media,
    categories: post.categories ?? [],
    _embedded: {
      "wp:featuredmedia": await Promise.all(featuredMedia),
      "wp:term": embeddedTerms,
    },
  };
}

async function normalisePage(page, siteUrlRewriter) {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    content: { rendered: siteUrlRewriter.rewriteTextReferences(await localizeAssetUrlsInHtml(page.content?.rendered ?? "")) },
    date: page.date,
    modified: page.modified,
  };
}

function normaliseCategory(category) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description ?? "",
    count: category.count ?? 0,
    parent: category.parent ?? 0,
  };
}

async function writeJson(fileName, value) {
  const outputFile = new URL(fileName, OUTPUT_DIR);
  await writeFile(outputFile, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  console.log("Fetching WordPress content from kilogrammes.com...");

  const [rawPosts, rawPages, rawCategories] = await Promise.all([
    fetchAllPosts(),
    fetchAllPages(),
    fetchAllCategories(),
  ]);

  const [productSlugs, storeCategories, storeTags] = await Promise.all([
    fetchAllProductSlugs(),
    fetchStoreJson("products/categories", { per_page: 100 }).catch(() => []),
    fetchStoreJson("products/tags", { per_page: 100 }).catch(() => []),
  ]);

  const siteUrlRewriter = createSiteUrlRewriter({
    productSlugs,
    categorySlugs: (Array.isArray(storeCategories) ? storeCategories : []).map((category) => category.slug).filter(Boolean),
    tagSlugs: (Array.isArray(storeTags) ? storeTags : []).map((tag) => tag.slug).filter(Boolean),
    postSlugs: rawPosts.map((post) => post.slug).filter(Boolean),
    pageSlugs: rawPages.map((page) => page.slug).filter(Boolean),
  });

  const [posts, pages] = await Promise.all([
    Promise.all(rawPosts.map((post) => normalisePost(post, siteUrlRewriter))),
    Promise.all(rawPages.map((page) => normalisePage(page, siteUrlRewriter))),
  ]);
  const categories = rawCategories.map(normaliseCategory);

  const commentsByPostId = Object.fromEntries(
    await Promise.all(
      posts.map(async (post) => [String(post.id), await fetchCommentsByPostId(post.id, siteUrlRewriter)]),
    ),
  );

  await mkdir(OUTPUT_DIR, { recursive: true });
  await Promise.all([
    writeJson("posts.json", posts),
    writeJson("pages.json", pages),
    writeJson("categories.json", categories),
    writeJson("comments.json", commentsByPostId),
  ]);

  console.log(`Content snapshot written: ${posts.length} posts, ${pages.length} pages, ${categories.length} categories.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});