'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { contactSchema, type ContactInput } from '@/lib/schemas';
import { OFFICES, SITE } from '@/content/site';
import { hubById } from '@/lib/geo';
import { useStore } from '@/lib/store';
import { useSubmit } from '@/hooks/useSubmit';
import { FormField, Input, Select, Textarea } from '@/components/ui/FormField';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { Reveal } from '@/components/ui/Reveal';

function Clock({ tz }: { tz: string }) {
  const [t, setT] = useState('--:--');
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }));
    f();
    const id = setInterval(f, 10000);
    return () => clearInterval(id);
  }, [tz]);
  return <span className="tnum">{t}</span>;
}

export function ContactSection() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactInput>({ resolver: zodResolver(contactSchema), defaultValues: { topic: undefined } });
  const { submit, status, data } = useSubmit<{ ref: string }>('/api/contact', { success: 'Message received.', successBody: 'The control tower will reply within one working hour.' });
  const setFocusHub = useStore((s) => s.setFocusHub);

  useEffect(() => () => setFocusHub(null), [setFocusHub]);

  return (
    <section data-chapter="Write to us" className="veil-soft pb-[var(--section)] pt-24">
      <div className="wrap grid grid-cols-12 gap-x-4 gap-y-16">
        <div className="col-span-12 lg:col-span-6">
          {status === 'success' && data ? (
            <div role="status" className="panel-bg border border-[var(--line)] p-8 md:p-12">
              <span className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-signal text-[#0a0a0a]"><Check /></span>
              <p className="display text-[clamp(2.4rem,4.4vw,4rem)] leading-[0.95]">Message in. Reference <em>{data.ref}</em>.</p>
              <p className="prose-body mt-5">The control tower replies within one working hour. If it can’t wait, call {SITE.phone}.</p>
              <div className="mt-8"><MagneticButton variant="ghost" onClick={() => reset()}>Send another</MagneticButton></div>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit(async (v) => void (await submit(v)))} className="panel-bg space-y-7 border border-[var(--line)] p-6 md:p-10" aria-label="Contact form">
              <FormField label="Your name" error={errors.name?.message}>{({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" invalid={invalid} aria-describedby={describedBy} {...register('name')} />}</FormField>
              <FormField label="Email" error={errors.email?.message}>{({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" invalid={invalid} aria-describedby={describedBy} {...register('email')} />}</FormField>
              <FormField label="What is this about?" error={errors.topic?.message}>
                {({ id, describedBy, invalid }) => (
                  <Select id={id} defaultValue="" invalid={invalid} aria-describedby={describedBy} {...register('topic')}>
                    <option value="" disabled>Choose a topic</option>
                    <option value="quote">A quote or a lane</option>
                    <option value="support">An existing shipment</option>
                    <option value="partnership">Partnership</option>
                    <option value="press">Press</option>
                    <option value="other">Something else</option>
                  </Select>
                )}
              </FormField>
              <FormField label="Message" error={errors.message?.message}>{({ id, describedBy, invalid }) => <Textarea id={id} rows={5} invalid={invalid} aria-describedby={describedBy} placeholder="The more specific, the faster we route it." {...register('message')} />}</FormField>
              <MagneticButton type="submit" loading={status === 'loading'} icon={<Check size={16} />}>Send message</MagneticButton>
              {status === 'error' && <p role="alert" className="text-[14px] text-[#ff9a52]">That one missed the connection. Nothing was lost. Try again.</p>}
            </form>
          )}
        </div>

        <div className="col-span-12 lg:col-span-5 lg:col-start-8">
          <p className="label mb-6">Offices · live local time</p>
          <ul className="border-t border-[var(--line)]">
            {OFFICES.map((o, i) => (
              <Reveal as="li" key={o.id} delay={i * 0.08} className="border-b border-[var(--line)]">
                <button type="button" onPointerEnter={() => setFocusHub(o.id)} onFocus={() => setFocusHub(o.id)} onClick={() => setFocusHub(o.id)} className="group grid w-full grid-cols-12 items-baseline gap-x-4 py-6 text-left" aria-label={`${o.city}, ${o.role}. Show on the globe.`}>
                  <span className="display col-span-7 text-[clamp(1.8rem,2.8vw,2.8rem)] leading-none transition-transform duration-500 ease-expo group-hover:translate-x-2">{o.city}</span>
                  <span className="display col-span-5 text-right text-[clamp(1.4rem,2vw,2rem)] text-signal"><Clock tz={hubById(o.id)!.tz} /></span>
                  <span className="label col-span-12 mt-2">{o.role}</span>
                  <span className="prose-body col-span-12 mt-1 text-[14px]">{o.address}</span>
                  <a href={`tel:${o.phone.replace(/\s/g, '')}`} onClick={(e) => e.stopPropagation()} className="u-draw col-span-12 mt-1 w-fit text-[15px]">{o.phone}</a>
                </button>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
