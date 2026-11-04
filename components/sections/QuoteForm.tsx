'use client';

import { useEffect, useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Plane, Ship, Truck } from 'lucide-react';
import { quoteSchema, quoteSteps, type QuoteInput } from '@/lib/schemas';
import { HUBS, distanceKm, hubById } from '@/lib/geo';
import { useStore } from '@/lib/store';
import { useSubmit } from '@/hooks/useSubmit';
import { FormField, Input, Select, Textarea } from '@/components/ui/FormField';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { fm } from '@/lib/motion';
import { tick } from '@/lib/audio';
import { cn } from '@/lib/utils';

const MODES = [
  { id: 'air', label: 'Air', note: '1–7 days', Icon: Plane },
  { id: 'ocean', label: 'Ocean', note: '12–40 days', Icon: Ship },
  { id: 'road', label: 'Road', note: '1–6 days', Icon: Truck },
] as const;

const STEP_NAMES = ['Cargo', 'Lane', 'You'];

function estimate(mode: string, origin?: string, dest?: string, weight = 0) {
  const a = hubById(origin ?? '');
  const b = hubById(dest ?? '');
  if (!a || !b) return null;
  const km = distanceKm(a, b);
  const days = mode === 'air' ? Math.round(1 + km / 6000 + 1) : mode === 'ocean' ? Math.round(9 + km / 750) : Math.max(1, Math.round(km / 800 + 1));
  const rate = mode === 'air' ? 3.1 : mode === 'ocean' ? 0.18 : 0.9; // € per kg per 1000 km (indicative)
  const base = Math.max(180, (weight || 100) * rate * (km / 1000));
  return { km: Math.round(km), days, lo: Math.round((base * 0.85) / 10) * 10, hi: Math.round((base * 1.2) / 10) * 10 };
}

/**
 * Signature interaction #2 (part 2): the lane you pick is drawn on the globe in real time.
 */
export function QuoteForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const setLane = useStore((s) => s.setLane);
  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    mode: 'onTouched',
    defaultValues: { mode: 'air', pieces: 1 } as Partial<QuoteInput> as QuoteInput,
  });
  const { submit, status, data, serverErrors } = useSubmit<{ ref: string }>('/api/quote', { success: 'Quote request received.', successBody: 'A person will reply with a mode, a price and a date.' });

  const [mode, origin, destination, weight] = watch(['mode', 'origin', 'destination', 'weight']);
  const est = estimate(mode, origin, destination, Number(weight));

  useEffect(() => {
    if (origin && destination && origin !== destination) setLane({ from: origin, to: destination });
    else setLane(null);
    return () => setLane(null);
  }, [origin, destination, setLane]);

  const go = async (n: number) => {
    if (n > step) {
      const ok = await trigger([...quoteSteps[step]] as FieldPath<QuoteInput>[]);
      if (!ok) {
        tick(0.6);
        return;
      }
    }
    setDir(n > step ? 1 : -1);
    setStep(n);
    tick(1.2);
  };

  if (status === 'success' && data) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.94, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={fm.section} className="panel-bg border border-[var(--line)] p-8 md:p-12" role="status">
        <span className="mb-8 grid h-14 w-14 place-items-center rounded-full bg-signal text-[#0a0a0a]"><Check /></span>
        <p className="display text-[clamp(2.6rem,5vw,4.6rem)] leading-[0.95]">Booked into the queue. Reference <em>{data.ref}</em>.</p>
        <p className="prose-body mt-6">A person on the control tower will reply to the email you gave us with a mode, a price and a date. Median reply time: 31 minutes.</p>
        <div className="mt-8 flex flex-wrap gap-4"><MagneticButton href="/track">Track a shipment</MagneticButton><MagneticButton href="/network" variant="ghost">Explore the network</MagneticButton></div>
      </motion.div>
    );
  }

  const err = (k: keyof QuoteInput) => errors[k]?.message as string | undefined ?? serverErrors?.[k]?.[0];

  return (
    <form noValidate onSubmit={handleSubmit(async (v) => void (await submit(v)))} className="panel-bg border border-[var(--line)] p-6 md:p-10" aria-label="Quote request">
      <ol className="mb-10 flex items-center gap-3" aria-label="Progress">
        {STEP_NAMES.map((n, i) => (
          <li key={n} className="flex flex-1 items-center gap-3" aria-current={i === step ? 'step' : undefined}>
            <span className={cn('label tnum transition-colors', i <= step ? 'label-ink' : '')}>0{i + 1}</span>
            <span className="relative h-px flex-1 bg-[var(--line)]"><motion.span className="absolute inset-y-0 left-0 bg-signal" animate={{ width: i < step ? '100%' : i === step ? '45%' : '0%' }} transition={fm.ui} /></span>
            <span className={cn('label hidden sm:inline', i === step && 'label-ink')}>{n}</span>
          </li>
        ))}
      </ol>

      <div className="relative min-h-[360px] overflow-hidden">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} custom={dir} initial={{ opacity: 0, x: dir * 60, filter: 'blur(8px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: dir * -40, filter: 'blur(6px)' }} transition={fm.ui} className="space-y-7">
            {step === 0 && (
              <>
                <fieldset>
                  <legend className="label mb-3">How is it moving?</legend>
                  <div className="grid grid-cols-3 gap-3">
                    {MODES.map(({ id, label, note, Icon }) => (
                      <label key={id} className={cn('group relative cursor-pointer border p-4 transition-[border-color,background] duration-500 ease-expo', mode === id ? 'border-signal bg-signal/10' : 'border-[var(--line)] hover:border-ink/30')}>
                        <input type="radio" value={id} className="sr-only" {...register('mode')} onChange={(e) => { setValue('mode', e.target.value as QuoteInput['mode']); tick(1.3); }} />
                        <Icon size={20} className={mode === id ? 'text-signal' : 'text-muted'} />
                        <span className="display mt-4 block text-[clamp(1.4rem,2vw,1.9rem)] leading-none">{label}</span>
                        <span className="label mt-1 block">{note}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <FormField label="What’s moving?" error={err('cargo')}>{({ id, describedBy, invalid }) => <Input id={id} placeholder="e.g. 18 pallets of temperature-controlled biologics" invalid={invalid} aria-describedby={describedBy} {...register('cargo')} />}</FormField>
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Total weight (kg)" error={err('weight')}>{({ id, describedBy, invalid }) => <Input id={id} inputMode="decimal" placeholder="4200" invalid={invalid} aria-describedby={describedBy} {...register('weight')} />}</FormField>
                  <FormField label="Pieces" error={err('pieces')}>{({ id, describedBy, invalid }) => <Input id={id} inputMode="numeric" placeholder="18" invalid={invalid} aria-describedby={describedBy} {...register('pieces')} />}</FormField>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="From" error={err('origin')}>{({ id, describedBy, invalid }) => (
                    <Select id={id} defaultValue="" invalid={invalid} aria-describedby={describedBy} {...register('origin')}><option value="" disabled>Choose origin hub</option>{HUBS.map((h) => <option key={h.id} value={h.id}>{h.name}, {h.country}</option>)}</Select>)}</FormField>
                  <FormField label="To" error={err('destination')}>{({ id, describedBy, invalid }) => (
                    <Select id={id} defaultValue="" invalid={invalid} aria-describedby={describedBy} {...register('destination')}><option value="" disabled>Choose destination hub</option>{HUBS.map((h) => <option key={h.id} value={h.id}>{h.name}, {h.country}</option>)}</Select>)}</FormField>
                </div>
                <FormField label="Ready to collect" error={err('ready')}>{({ id, describedBy, invalid }) => <Input id={id} type="date" invalid={invalid} aria-describedby={describedBy} {...register('ready')} />}</FormField>
                <div className="border-t border-[var(--line)] pt-6" aria-live="polite">
                  {est ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div><p className="label">Distance</p><p className="display mt-1 text-[clamp(1.5rem,2.4vw,2.2rem)] tnum">{est.km.toLocaleString('en-US')} km</p></div>
                      <div><p className="label">Transit</p><p className="display mt-1 text-[clamp(1.5rem,2.4vw,2.2rem)] tnum">~{est.days} days</p></div>
                      <div><p className="label">Indicative</p><p className="display mt-1 text-[clamp(1.5rem,2.4vw,2.2rem)] tnum text-signal">€{est.lo.toLocaleString('en-US')}–{est.hi.toLocaleString('en-US')}</p></div>
                    </div>
                  ) : (
                    <p className="prose-body text-[15px]">Pick both hubs and the lane draws itself on the planet, with a rough transit time and price range.</p>
                  )}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Your name" error={err('name')}>{({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" invalid={invalid} aria-describedby={describedBy} {...register('name')} />}</FormField>
                  <FormField label="Company" error={err('company')}>{({ id, describedBy, invalid }) => <Input id={id} autoComplete="organization" invalid={invalid} aria-describedby={describedBy} {...register('company')} />}</FormField>
                </div>
                <FormField label="Work email" error={err('email')}>{({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" invalid={invalid} aria-describedby={describedBy} {...register('email')} />}</FormField>
                <FormField label="Anything we should know? (optional)" error={err('notes')}>{({ id, describedBy, invalid }) => <Textarea id={id} invalid={invalid} aria-describedby={describedBy} placeholder="Dangerous goods, temperature range, dock constraints…" {...register('notes')} />}</FormField>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
        <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="label flex items-center gap-2 py-3 transition-opacity hover:text-ink disabled:pointer-events-none disabled:opacity-0"><ArrowLeft size={14} /> Back</button>
        {step < 2 ? (
          <MagneticButton onClick={() => void go(step + 1)} icon={<ArrowRight size={16} />}>Continue</MagneticButton>
        ) : (
          <MagneticButton type="submit" loading={status === 'loading'} icon={<Check size={16} />}>Request my quote</MagneticButton>
        )}
      </div>
      {status === 'error' && <p role="alert" className="mt-4 text-[14px] text-[#ff9a52]">That one missed the connection. Nothing was lost. Try again.</p>}
    </form>
  );
}
