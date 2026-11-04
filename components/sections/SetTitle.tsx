'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

/** For pages with a custom hero: pushes the headline to the 3D layer; keeps an accessible h1. */
export function SetTitle({ title, className }: { title: string; className?: string }) {
  const setTitle = useStore((s) => s.setTitle);
  const webgl = useStore((s) => s.webgl);
  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [title, setTitle]);
  return <h1 className={cn('display t-h1 max-w-[12ch]', webgl && 'sr-only', className)}>{title.replace(/\*/g, '')}</h1>;
}
