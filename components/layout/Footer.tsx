'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check } from 'lucide-react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { LogoMark } from '@/components/ui/Logo';
import { FormField, Input } from '@/components/ui/FormField';
import { NAV, OFFICES, SITE } from '@/content/site';
import { newsletterSchema } from '@/lib/schemas';
import { useSubmit } from '@/hooks/useSubmit';

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com' },
  { label: 'Instagram', href: 'https://www.instagram.com' },
  { label: 'YouTube', href: 'https://www.youtube.com' },
  { label: 'X', href: 'https://x.com' },
];

export function Footer() {
  const { register, handleSubmit, formState, reset } = useForm<{ email: string }>({ resolver: zodResolver(newsletterSchema) });
  const { submit, status } = useSubmit('/api/newsletter', { success: 'You are on the manifest.', successBody: 'One letter a month. Real numbers, no filler.' });

  return (
    <footer className="relative z-10 overflow-hidden border-t border-[var(--line)] bg-bg">
      <div className="wrap grid grid-cols-12 gap-x-4 gap-y-14 pb-10 pt-20 md:pt-28">
        <div className="col-span-12 lg:col-span-5">
          <p className="label mb-6">The monthly manifest</p>
          <h2 className="display text-[clamp(2.2rem,4.4vw,4.2rem)]">
            One letter a month. <em>Real numbers</em>, no filler.
          </h2>
          <form
            noValidate
            className="mt-10 max-w-md"
            onSubmit={handleSubmit(async (v) => {
              const r = await submit(v);
              if (r) reset();
            })}
          >
            <FormField label="Email" error={formState.errors.email?.message}>
              {({ id, describedBy, invalid }) => (
                <div className="flex items-end gap-3">
                  <Input id={id} type="email" autoComplete="email" placeholder="you@company.com" invalid={invalid} aria-describedby={describedBy} {...register('email')} />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    aria-label="Subscribe"
                    className="mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-signal text-[#0a0a0a] transition-transform duration-300 ease-expo hover:scale-110 active:scale-90 disabled:opacity-50"
                  >
                    {status === 'success' ? <Check size={18} /> : <ArrowRight size={18} />}
                  </button>
                </div>
              )}
            </FormField>
            <p className="mt-3 text-[13px] text-muted" aria-live="polite">
              {status === 'loading' ? 'Adding you to the manifest…' : status === 'success' ? 'Done. Check your inbox for a confirmation.' : 'Unsubscribe in one click.'}
            </p>
          </form>
        </div>

        <nav aria-label="Sitemap" className="col-span-6 lg:col-span-2 lg:col-start-7">
          <p className="label mb-6">Sitemap</p>
          <ul className="space-y-2">
            {[{ href: '/', label: 'Home' }, ...NAV, { href: '/quote', label: 'Get a quote' }].map((n) => (
              <li key={n.href}>
                <TransitionLink href={n.href} className="u-draw text-[17px]">
                  {n.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-6 lg:col-span-2">
          <p className="label mb-6">Offices</p>
          <ul className="space-y-2 text-[17px]">
            {OFFICES.map((o) => (
              <li key={o.id}>
                <TransitionLink href="/contact" className="u-draw">
                  {o.city}
                </TransitionLink>
              </li>
            ))}
          </ul>
          <p className="label mb-4 mt-10">Follow</p>
          <ul className="space-y-2 text-[17px]">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="u-draw">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 lg:col-span-2">
          <p className="label mb-6">Talk to a human</p>
          <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="u-draw block text-[17px]">
            {SITE.phone}
          </a>
          <a href={`mailto:${SITE.email}`} className="u-draw mt-2 block text-[17px]">
            {SITE.email}
          </a>
          <p className="mt-4 text-[14px] text-muted">24/7 control tower. Someone picks up in under four rings.</p>
        </div>
      </div>

      <div aria-hidden className="display pointer-events-none select-none whitespace-nowrap px-[var(--gutter)] text-[clamp(5rem,22vw,26rem)] leading-[0.74] tracking-[-0.06em] text-ink/[0.07]">
        Transit<em className="!text-signal/30">Arc</em>
      </div>

      <div className="wrap flex flex-col gap-3 border-t border-[var(--line)] py-6 sm:flex-row sm:items-center sm:justify-between">
        <span className="label flex items-center gap-3">
          <LogoMark className="h-5 w-5 text-muted" /> © {new Date().getFullYear()} {SITE.name}. A fictional company; all figures illustrative.
        </span>
        <span className="label">Built at 408 km, delivered at 0 m.</span>
      </div>
    </footer>
  );
}
