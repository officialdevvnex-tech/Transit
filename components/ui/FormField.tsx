'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fm } from '@/lib/motion';

const control =
  'w-full bg-transparent border-0 border-b border-[var(--line)] px-0 py-3 text-[17px] text-ink placeholder:text-[#5d6b7e] outline-none transition-[border-color] duration-300 focus:border-signal focus-visible:outline-none';

type FieldProps = { label: string; error?: string; hint?: string; children: (a: { id: string; describedBy?: string; invalid: boolean }) => ReactNode; className?: string };

export function FormField({ label, error, hint, children, className }: FieldProps) {
  const id = useId();
  const describedBy = error ? `${id}-e` : hint ? `${id}-h` : undefined;
  return (
    <div className={cn('group relative', className)}>
      <label htmlFor={id} className="label block pb-1 transition-colors group-focus-within:text-signal">
        {label}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-signal transition-transform duration-700 ease-expo group-focus-within:scale-x-100" />
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p key="e" id={`${id}-e`} role="alert" initial={{ opacity: 0, y: -6, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={fm.micro} className="pt-2 text-[13px] text-[#ff9a52]">
            {error}
          </motion.p>
        ) : hint ? (
          <p id={`${id}-h`} className="pt-2 text-[13px] text-muted">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(function Input({ className, invalid, ...p }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={cn(control, className)} {...p} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(function Textarea({ className, invalid, ...p }, ref) {
  return <textarea ref={ref} aria-invalid={invalid || undefined} rows={4} className={cn(control, 'resize-none', className)} {...p} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(function Select({ className, invalid, children, ...p }, ref) {
  return (
    <select ref={ref} aria-invalid={invalid || undefined} className={cn(control, 'appearance-none pr-6', className)} {...p}>
      {children}
    </select>
  );
});
