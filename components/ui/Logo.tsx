import { cn } from '@/lib/utils';

/** The arc mark: a lane rising from the horizon, ending in a signal-orange shipment. */
export function LogoMark({ className, draw }: { className?: string; draw?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn('h-8 w-8', className)} aria-hidden>
      <path className={draw ? 'logo-arc' : undefined} d="M5 35C9 15 29 6 41 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path className={draw ? 'logo-base' : undefined} d="M5 40H27" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
      <circle className={draw ? 'logo-dot' : undefined} cx="41" cy="12" r="3.6" fill="var(--signal)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('display text-[26px] leading-none tracking-[-0.03em]', className)}>
      Transit<em className="!text-ink">Arc</em>
    </span>
  );
}
