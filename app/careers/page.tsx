import { PageHero } from '@/components/sections/PageHero';
import { CareersBoard } from '@/components/sections/CareersBoard';
import { NextStop } from '@/components/sections/NextStop';
import { JsonLd } from '@/components/ui/JsonLd';
import { JOBS } from '@/content/jobs';
import { SITE } from '@/content/site';
import { pageMeta, webPageLd } from '@/lib/seo';

const desc = 'Open roles at TransitArc across operations, engineering, customs and commercial. Work that ships, on time.';
export const metadata = pageMeta('Careers', desc, '/careers');

export default function CareersPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageLd('CollectionPage', 'Careers', desc, '/careers'),
          ...JOBS.map((j) => ({
            '@context': 'https://schema.org', '@type': 'JobPosting', title: j.title, description: j.summary,
            datePosted: '2026-09-01', employmentType: 'FULL_TIME', hiringOrganization: { '@type': 'Organization', name: SITE.name, sameAs: SITE.url },
            jobLocation: { '@type': 'Place', address: j.location },
          })),
        ]}
      />
      <PageHero crumb="Careers" title="Help us keep *the day.*" intro="Dispatchers, brokers, engineers and account managers who sweat the date. Six open roles, four continents." />
      <CareersBoard />
      <NextStop beat={3} title="Not seeing *your* role?" href="/contact" cta="Say hello anyway" sub="We hire for people who care about the date. Tell us what you’d do about it." secondary={{ href: '/blog', label: 'Read the journal' }} />
    </>
  );
}
