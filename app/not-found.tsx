import { PageHero } from '@/components/sections/PageHero';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta('Lane not found', 'This route is not on our network. Head back to a lane that is.', '/404');

export default function NotFound() {
  return (
    <PageHero
      crumb="404 · Signal lost"
     
      title="This lane *doesn't* exist."
      intro="The page you asked for isn't on the network. Either the link is old, or the cargo took a route we haven't built yet."
    >
      <div className="mt-10 flex flex-wrap gap-4">
        <MagneticButton href="/">Back to orbit</MagneticButton>
        <MagneticButton href="/track" variant="ghost">
          Track a shipment
        </MagneticButton>
      </div>
    </PageHero>
  );
}
