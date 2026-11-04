import type { Metadata } from 'next';
import { SITE } from '@/content/site';

export function pageMeta(title: string, description: string, path: string): Metadata {
  const og = `/api/og?title=${encodeURIComponent(title)}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · ${SITE.short}`,
      description,
      url: path,
      siteName: SITE.name,
      type: 'website',
      images: [{ url: og, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title: `${title} · ${SITE.short}`, description, images: [og] },
  };
}

export const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/icon.svg`,
  description: SITE.description,
  contactPoint: { '@type': 'ContactPoint', telephone: SITE.phone, email: SITE.email, contactType: 'customer service' },
};

export const webPageLd = (type: string, name: string, description: string, path: string, extra: Record<string, unknown> = {}) => ({
  '@context': 'https://schema.org',
  '@type': type,
  name,
  description,
  url: `${SITE.url}${path}`,
  isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
  ...extra,
});
