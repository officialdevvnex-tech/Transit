'use client';

import { useState, useId, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { fm } from '@/lib/motion';
import { tick } from '@/lib/audio';
import { cn } from '@/lib/utils';

export type AccItem = { id: string; head: ReactNode; body: ReactNode };

export function Accordion({ items, className, initial }: { items: AccItem[]; className?: string; initial?: string | null }) {
  const [open, setOpen] = useState<string | null>(initial ?? null);
  const base = useId();
  return (
    <div className={cn('border-t border-[var(--line)]', className)}>
      {items.map((it) => {
        const isOpen = open === it.id;
        return (
          <div key={it.id} className="border-b border-[var(--line)]">
            <h3>
              <button
                type="button"
                id={`${base}-${it.id}-h`}
                aria-expanded={isOpen}
                aria-controls={`${base}-${it.id}-p`}
                onClick={() => {
                  tick(isOpen ? 0.9 : 1.2);
                  setOpen(isOpen ? null : it.id);
                }}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left"
              >
                <span className="min-w-0 flex-1">{it.head}</span>
                <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] transition-[transform,background,color] duration-500 ease-expo group-hover:bg-signal group-hover:text-[#0a0a0a]', isOpen && 'rotate-45 bg-signal text-[#0a0a0a]')}>
                  <Plus size={16} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${base}-${it.id}-p`}
                  role="region"
                  aria-labelledby={`${base}-${it.id}-h`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={fm.ui}
                  className="overflow-hidden"
                >
                  <div className="pb-8">{it.body}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
