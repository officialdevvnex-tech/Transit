import { MagneticButton } from '@/components/ui/MagneticButton';
import { SplitText } from '@/components/ui/SplitText';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { ArrowUpRight } from 'lucide-react';

type Props = { beat?: number; label?: string; title: string; href: string; cta: string; sub?: string; secondary?: { href: string; label: string } };

/** Bottom-of-page CTA: one primary action to the next logical page. */
export function NextStop({ beat, label = 'Next stop', title, href, cta, sub, secondary }: Props) {
  return (
    <section data-chapter="Next stop" data-beat={beat} className="veil-soft relative z-10 pb-[clamp(72px,14vh,160px)] pt-[clamp(96px,22vh,260px)]">
      <div className="wrap">
        <p className="label mb-8 flex items-center gap-4">
          <span className="inline-block h-px w-10 bg-signal" /> {label}
        </p>
        <TransitionLink href={href} data-cursor="label" data-cursor-label="Go" className="group block" aria-label={`${title}: ${cta}`}>
          <SplitText as="h2" text={title} className="display shadow-text text-[clamp(3rem,9vw,10rem)] leading-[0.88] tracking-[-0.05em] transition-transform duration-[900ms] ease-expo group-hover:translate-x-3" />
        </TransitionLink>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <MagneticButton href={href} icon={<ArrowUpRight size={16} />}>
            {cta}
          </MagneticButton>
          {secondary && (
            <TransitionLink href={secondary.href} className="label label-ink u-draw py-3">
              {secondary.label}
            </TransitionLink>
          )}
          {sub && <p className="prose-body max-w-[40ch] text-[15px] text-muted">{sub}</p>}
        </div>
      </div>
    </section>
  );
}
