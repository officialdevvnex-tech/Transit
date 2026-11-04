'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useNavigate } from '@/components/layout/TransitionProvider';
import { tick } from '@/lib/audio';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

/** Link that routes through the page-transition system (wipe + camera glide + optional shared element). */
export function TransitionLink({ href, onClick, onMouseEnter, children, ...rest }: Props) {
  const navigate = useNavigate();
  const external = /^(https?:|mailto:|tel:)/.test(href);

  if (external) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" {...(rest as object)}>
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      onMouseEnter={(e) => {
        tick(1.1);
        onMouseEnter?.(e);
      }}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        const src = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-shared-source]');
        navigate(href, src);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
