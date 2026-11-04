import { PageHero } from '@/components/sections/PageHero';
import { BlogIndex } from '@/components/sections/BlogIndex';
import { NextStop } from '@/components/sections/NextStop';
import { JsonLd } from '@/components/ui/JsonLd';
import { POSTS } from '@/content/posts';
import { pageMeta, webPageLd } from '@/lib/seo';

const desc = 'The TransitArc journal: operations, customs, sustainability and technology, written by the people who run the network.';
export const metadata = pageMeta('Journal', desc, '/blog');

export default function BlogPage() {
  return (
    <>
      <JsonLd data={[webPageLd('Blog', 'TransitArc Journal', desc, '/blog'), ...POSTS.map((p) => ({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, datePublished: p.date, description: p.excerpt }))]} />
      <PageHero crumb="Journal" title="Notes from *the tower.*" intro="Monthly, specific, and light on adjectives. Real numbers from the people who run the network." />
      <BlogIndex />
      <NextStop beat={2} title="Questions *left?*" href="/contact" cta="Talk to us" sub="Ask the control tower. A person answers." secondary={{ href: '/services', label: 'Browse services' }} />
    </>
  );
}
