'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { DEPTS, JOBS, PERKS, type Job } from '@/content/jobs';
import { applySchema, type ApplyInput } from '@/lib/schemas';
import { useSubmit } from '@/hooks/useSubmit';
import { Tabs } from '@/components/ui/Tabs';
import { Accordion } from '@/components/ui/Accordion';
import { Modal } from '@/components/ui/Modal';
import { FormField, Input, Textarea } from '@/components/ui/FormField';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { fm } from '@/lib/motion';

function ApplyForm({ job, onDone }: { job: Job; onDone: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<ApplyInput>({ resolver: zodResolver(applySchema), defaultValues: { jobId: job.id } });
  const { submit, status, data } = useSubmit<{ ref: string }>('/api/apply', { success: 'Application received.', successBody: `We read every one. Expect a reply within five working days.` });

  if (status === 'success' && data)
    return (
      <div role="status">
        <span className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-signal text-[#0a0a0a]"><Check /></span>
        <p className="display text-[2.2rem] leading-none">Thanks. You’re in the queue. Ref <em>{data.ref}</em>.</p>
        <p className="prose-body mt-4 text-[15px]">A real person reads this, usually within five working days.</p>
        <div className="mt-6"><MagneticButton onClick={onDone} variant="ghost">Close</MagneticButton></div>
      </div>
    );

  return (
    <form noValidate onSubmit={handleSubmit(async (v) => void (await submit(v)))} className="space-y-6">
      <input type="hidden" {...register('jobId')} />
      <FormField label="Your name" error={errors.name?.message}>{({ id, describedBy, invalid }) => <Input id={id} autoComplete="name" invalid={invalid} aria-describedby={describedBy} {...register('name')} />}</FormField>
      <FormField label="Email" error={errors.email?.message}>{({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" invalid={invalid} aria-describedby={describedBy} {...register('email')} />}</FormField>
      <FormField label="Link to CV or portfolio" error={errors.link?.message}>{({ id, describedBy, invalid }) => <Input id={id} type="url" placeholder="https://" invalid={invalid} aria-describedby={describedBy} {...register('link')} />}</FormField>
      <FormField label="One thing we should know (optional)" error={errors.note?.message}>{({ id, describedBy, invalid }) => <Textarea id={id} invalid={invalid} aria-describedby={describedBy} {...register('note')} />}</FormField>
      <MagneticButton type="submit" loading={status === 'loading'} icon={<Check size={16} />}>Send application</MagneticButton>
      {status === 'error' && <p role="alert" className="text-[14px] text-[#ff9a52]">That one missed the connection. Nothing was lost. Try again.</p>}
    </form>
  );
}

export function CareersBoard() {
  const [dept, setDept] = useState<(typeof DEPTS)[number]>('All');
  const [applying, setApplying] = useState<Job | null>(null);
  const list = JOBS.filter((j) => dept === 'All' || j.dept === dept);

  return (
    <>
      <section data-chapter="Open roles" data-beat="1" className="beat">
        <div className="wrap flex w-full justify-start"><div className="panel w-full p-6 md:max-w-[860px] md:p-9">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="label flex items-center gap-4"><span className="label-ink tnum">{list.length} open</span><span className="rule max-w-[56px]" /> Roles</p>
            <Tabs label="Department" tabs={DEPTS.map((d) => ({ id: d, label: d, count: d === 'All' ? JOBS.length : JOBS.filter((j) => j.dept === d).length }))} value={dept} onChange={setDept} />
          </div>
          <div role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div key={dept} initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0 }} transition={fm.ui}>
                <Accordion
                  items={list.map((j) => ({
                    id: j.id,
                    head: (
                      <span className="grid grid-cols-12 items-baseline gap-x-4">
                        <span className="display col-span-12 text-[clamp(1.6rem,2.8vw,2.8rem)] leading-[1.02] md:col-span-6">{j.title}</span>
                        <span className="label col-span-6 mt-2 md:col-span-3 md:mt-0">{j.dept}</span>
                        <span className="label col-span-6 mt-2 md:col-span-3 md:mt-0">{j.location}</span>
                      </span>
                    ),
                    body: (
                      <div className="grid grid-cols-12 gap-x-4 gap-y-6">
                        <p className="prose-body col-span-12 md:col-span-6">{j.summary}</p>
                        <ul className="col-span-12 space-y-2 md:col-span-5 md:col-start-8">
                          {j.duties.map((d) => <li key={d} className="flex gap-3 text-[16px]"><span className="mt-[0.7em] h-px w-4 shrink-0 bg-signal" />{d}</li>)}
                        </ul>
                        <div className="col-span-12"><MagneticButton onClick={() => setApplying(j)}>Apply for this role</MagneticButton></div>
                      </div>
                    ),
                  }))}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div></div>
      </section>

      <section data-chapter="Why here" data-beat="2" className="beat veil-soft">
        <div className="wrap w-full">
          <SectionHeading index="02" total="02" label="Why here" title="Work that *ships.*" />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {PERKS.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.08} className="panel p-8 md:p-10">
                <p className="label tnum">0{i + 1}</p>
                <p className="display mt-3 text-[clamp(1.8rem,3vw,3rem)] leading-[1]">{p.t}</p>
                <p className="prose-body mt-4 text-[16px]">{p.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Modal open={!!applying} onClose={() => setApplying(null)} title={applying ? `Apply: ${applying.title}` : 'Apply'}>
        {applying && <ApplyForm job={applying} onDone={() => setApplying(null)} />}
      </Modal>
    </>
  );
}
