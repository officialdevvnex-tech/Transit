import type { MetadataRoute } from 'next';
import { SITE } from '@/content/site';
import { POSTS } from '@/content/posts';

const ROUTES = ['', '/services', '/track', '/quote', '/network', '/industries', '/about', '/careers', '/blog', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...ROUTES.map((r) => ({ url: `${SITE.url}${r}`, lastModified: now, changeFrequency: 'weekly' as const, priority: r === '' ? 1 : 0.7 })),
    ...POSTS.map((p) => ({ url: `${SITE.url}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: 'monthly' as const, priority: 0.5 })),
  ];
}
