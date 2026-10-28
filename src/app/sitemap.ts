import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog-service";
import { PLATFORMS } from "@/lib/platforms";
import { getAllWikiSystems } from "@/lib/wiki";

const SITE_URL = "https://www.riescade.com.br";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: posts } = await getBlogPosts({ limit: 5000 });
  const latestPost = posts[0]?.updated_at || posts[0]?.published_at || undefined;

  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/platforms`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/tutorial`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/wiki`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/recordes`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/blog`, lastModified: latestPost, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/termos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/politica`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/app-data`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const platforms: MetadataRoute.Sitemap = PLATFORMS.filter((p) => p.indexable).map((p) => ({
    url: `${SITE_URL}/platforms/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const wikiPages: MetadataRoute.Sitemap = getAllWikiSystems().map((s) => ({
    url: `${SITE_URL}/wiki/${s.slug}`,
    changeFrequency: "monthly",
    priority: s.isCustomRiescade ? 0.85 : 0.75,
  }));

  const articles: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at || post.published_at || undefined,
    changeFrequency: "monthly",
    priority: 0.6,
    images: post.cover_image?.startsWith("/") ? [`${SITE_URL}${post.cover_image}`] : undefined,
  }));

  return [...pages, ...platforms, ...wikiPages, ...articles];
}
