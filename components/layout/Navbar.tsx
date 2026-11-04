'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { TransitionLink } from '@/components/ui/TransitionLink';
import { LogoMark, Wordmark } from '@/components/ui/Logo';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { NAV, SITE } from '@/content/site';
import { bezier, fm } from '@/lib/motion';
import { getLenis } from '@/lib/scroll';
import { afterburner } from '@/lib/afterburner';
import { cn } from '@/lib/utils';

const isActive = (path: string, href: string) => path === href || (href !== '/' && path.startsWith(href + '/'));

export function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    const l = getLenis();
    if (open) l?.stop();
    else l?.start();
  }, [open]);

  return (
    <>
      <header
        data-nav
        className={cn('fixed inset-x-0 top-0 z-[60] transition-[background,border-color,backdrop-filter] duration-500 ease-expo', solid || open ? 'glass border-x-0 border-t-0 bg-bg/70' : 'border-b border-transparent')}
      >
        <nav aria-label="Primary" className="wrap flex h-[var(--nav-h)] items-center justify-between gap-6">
          <TransitionLink
            href="/"
            aria-label={`${SITE.name}, home. Press and hold for a surprise.`}
            className="relative z-[2] flex items-center gap-3"
            onPointerDown={() => {
              hold.current = setTimeout(afterburner, 1200);
            }}
            onPointerUp={() => hold.current && clearTimeout(hold.current)}
            onPointerLeave={() => hold.current && clearTimeout(hold.current)}
          >
            <LogoMark className="h-9 w-9 text-ink" />
            <Wordmark className="hidden sm:inline" />
          </TransitionLink>

          <ul className="hidden items-center gap-1 min-[1180px]:flex">
            {NAV.filter((n) => n.href !== '/track').map((n) => {
              const active = isActive(path, n.href);
              return (
                <li key={n.href} className="relative">
                  <TransitionLink href={n.href} aria-current={active ? 'page' : undefined} className={cn('label block px-4 py-3 transition-colors duration-300', active ? 'label-ink' : 'hover:text-ink')}>
                    {n.label}
                  </TransitionLink>
                  {active && <motion.span layoutId="nav-ind" className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-signal" transition={{ duration: 0.7, ease: bezier.expoOut }} />}
                </li>
              );
            })}
          </ul>

          <div className="relative z-[2] flex items-center gap-3">
            <TransitionLink href="/track" className="label hidden px-3 py-3 hover:text-ink sm:block">
              Track
            </TransitionLink>
            <div className="hidden sm:block">
              <MagneticButton href="/quote" size="sm">
                Get a quote
              </MagneticButton>
            </div>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
              className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] min-[1180px]:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[55] flex flex-col justify-between overflow-y-auto bg-bg px-[var(--gutter)] pb-8 pt-[calc(var(--nav-h)+24px)] min-[1180px]:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={fm.page}
            data-lenis-prevent
          >
            <ul className="flex flex-col">
              {[...NAV, { href: '/quote', label: 'Get a quote' }].map((n, i) => (
                <li key={n.href} className="overflow-hidden border-b border-[var(--line-soft)]">
                  <motion.div initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '110%' }} transition={{ ...fm.section, delay: 0.25 + i * 0.05 }}>
                    <TransitionLink href={n.href} className={cn('display flex items-baseline gap-4 py-2 text-[clamp(2.6rem,12vw,5rem)] leading-[1.05] tracking-[-0.04em]', isActive(path, n.href) && 'text-signal')}>
                      <span className="label w-6 !text-[11px]">{String(i + 1).padStart(2, '0')}</span>
                      {n.label}
                    </TransitionLink>
                  </motion.div>
                </li>
              ))}
            </ul>
            <p className="label mt-8">
              {SITE.phone} · {SITE.email}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
