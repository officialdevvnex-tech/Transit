import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PageHero } from '@/components/sections/PageHero';
import { NextStop } from '@/components/sections/NextStop';
import { Reveal } from '@/components/ui/Reveal';
import { JsonLd } from '@/components/ui/JsonLd';
import { POSTS, postBySlug } from '@/content/posts';
import { SITE } from '@/content/site';
import { pageMeta } from '@/lib/seo';

export const dynamicParams = false;
export const generateStaticParams = () => POSTS.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = postBySlug((await params).slug);
  return p ? pageMeta(p.title, p.excerpt, `/blog/${p.slug}`) : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = postBySlug((await params).slug);
  if (!post) notFound();
  const i = POSTS.indexOf(post);
  const next = POSTS[(i + 1) % POSTS.length];

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt, datePublished: post.date, author: { '@type': 'Organization', name: SITE.name }, publisher: { '@type': 'Organization', name: SITE.name }, mainEntityOfPage: `${SITE.url}/blog/${post.slug}` }} />
      <PageHero crumb={`Journal / ${post.category}`} title={post.title.replace(/(\S+)$/, '*$1*')} intro={`${new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · ${post.read} min read`} />
      <article data-chapter="Article" data-beat="1" className="veil-soft pb-[var(--section)] pt-24">
        <div className="wrap grid grid-cols-12 gap-x-4">
          <p className="display col-span-12 text-[clamp(1.6rem,2.8vw,2.8rem)] leading-[1.1] lg:col-span-8 lg:col-start-3">{post.excerpt}</p>
          <div className="col-span-12 mt-12 space-y-7 lg:col-span-6 lg:col-start-4">
            {post.body.map((para, k) => (
              <Reveal as="p" key={k} className="prose-body text-[clamp(1.05rem,1.3vw,1.2rem)] leading-[1.75]">
                {para}
              </Reveal>
            ))}
          </div>
        </div>
      </article>
      <NextStop beat={2} label="Next article" title={next.title} href={`/blog/${next.slug}`} cta="Read next" sub={next.excerpt} secondary={{ href: '/blog', label: 'All articles' }} />
    </>
  );
}
