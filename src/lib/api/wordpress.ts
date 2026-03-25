/**
 * Local WordPress content accessor.
 * Posts, pages, categories, and comments are snapshotted into src/data/content.
 */

import { getLocalContent } from "./localContent";
import { getLocalCatalog } from "./localCatalog";
import type { WPComment } from "./localCatalog";
import type { WPPost } from "./localContent";

export type { WPCategory, WPPage, WPPost } from "./localContent";

const commentCache = new Map<number, Promise<WPComment[]>>();

export async function getPosts(page = 1, perPage = 100) {
  const { posts } = await getLocalContent();
  const startIndex = Math.max(page - 1, 0) * perPage;
  return posts.slice(startIndex, startIndex + perPage);
}

export async function getAllPosts() {
  const { posts } = await getLocalContent();
  return posts;
}

export async function getPostBySlug(slug: string) {
  const { posts } = await getLocalContent();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPages() {
  const { pages } = await getLocalContent();
  return pages;
}

export async function getPageBySlug(slug: string) {
  const { pages } = await getLocalContent();
  return pages.find((page) => page.slug === slug) ?? null;
}

export async function getCategories() {
  const { categories } = await getLocalContent();
  return categories;
}

async function getLocalProductComments(postId: number): Promise<WPComment[] | null> {
  const catalog = await getLocalCatalog();
  const isProductPost = catalog.products.some((product) => product.id === postId);
  if (!isProductPost) {
    return null;
  }

  return (catalog.commentsByPostId[String(postId)] ?? []).slice().sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

async function getLocalContentComments(postId: number): Promise<WPComment[]> {
  const { commentsByPostId } = await getLocalContent();
  return (commentsByPostId[String(postId)] ?? []).slice().sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

async function fetchCommentsByPostId(postId: number): Promise<WPComment[]> {
  const localComments = await getLocalProductComments(postId);
  if (localComments) {
    return localComments;
  }

  return getLocalContentComments(postId);
}

export async function getCommentsByPostId(postId: number): Promise<WPComment[]> {
  if (!postId) return [];
  if (!commentCache.has(postId)) {
    commentCache.set(postId, fetchCommentsByPostId(postId).catch(() => []));
  }
  return commentCache.get(postId) ?? Promise.resolve([]);
}

export function getFeaturedImage(post: WPPost): string | undefined {
  return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}
