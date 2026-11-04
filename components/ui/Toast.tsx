'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Radio, X } from 'lucide-react';
import { useStore, type ToastItem } from '@/lib/store';
import { fm } from '@/lib/motion';

const ICON = { success: CheckCircle2, error: AlertTriangle, info: Radio };
const TONE = { success: 'text-cyan', error: 'text-[#ff9a52]', info: 'text-signal' };

function Item({ t }: { t: ToastItem }) {
  const dismiss = useStore((s) => s.dismissToast);
  useEffect(() => {
    const id = setTimeout(() => dismiss(t.id), 5200);
    return () => clearTimeout(id);
  }, [t.id, dismiss]);
  const Icon = ICON[t.tone];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 40, transition: fm.micro }}
      transition={fm.ui}
      role={t.tone === 'error' ? 'alert' : 'status'}
      className="glass pointer-events-auto flex w-[min(92vw,380px)] items-start gap-3 bg-surface/90 p-4"
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${TONE[t.tone]}`} />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-snug">{t.title}</p>
        {t.body && <p className="mt-1 text-[14px] text-muted">{t.body}</p>}
      </div>
      <button aria-label="Dismiss" onClick={() => dismiss(t.id)} className="text-muted hover:text-ink">
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[130] flex flex-col items-end gap-2 md:bottom-6 md:right-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <Item key={t.id} t={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
