'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Copy, Plane, Ship, Truck } from 'lucide-react';
import { TrackBar } from './TrackBar';
import { useStore } from '@/lib/store';
import { trackIdSchema } from '@/lib/schemas';
import type { TrackResult } from '@/lib/tracking';
import { fm } from '@/lib/motion';
import { MagneticButton } from '@/components/ui/MagneticButton';

const MODE_ICON = { air: Plane, sea: Ship, road: Truck };
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmtDay = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

type State = { s: 'idle' } | { s: 'loading' } | { s: 'error'; msg: string } | { s: 'ok'; r: TrackResult };

export function TrackView() {
  const params = useSearchParams();
  const [state, setState] = useState<State>({ s: 'idle' });
  const [copied, setCopied] = useState(false);
  const setTrackPoint = useStore((s) => s.setTrackPoint);
  const setLane = useStore((s) => s.setLane);
  const toast = useStore((s) => s.toast);

  const load = useCallback(
    async (raw: string) => {
      const parsed = trackIdSchema.safeParse(raw);
      if (!parsed.success) {
        setState({ s: 'error', msg: parsed.error.issues[0].message });
        return;
      }
      setState({ s: 'loading' });
      try {
        const res = await fetch(`/api/track/${encodeURIComponent(parsed.data)}`);
        const json = await res.json();
        if (!json.ok) throw new Error(json.error);
        const r: TrackResult = json.shipment;
        setState({ s: 'ok', r });
        setTrackPoint({ lat: r.position.lat, lon: r.position.lon, progress: r.progress });
        setLane({ from: r.origin.id, to: r.destination.id, progress: r.progress });
        window.history.replaceState(null, '', `/track?id=${r.id}`);
      } catch (e) {
        setState({ s: 'error', msg: e instanceof Error && e.message ? e.message : 'We lost the signal for a moment. Try again.' });
      }
    },
    [setLane, setTrackPoint],
  );

  const qid = params.get('id');
  useEffect(() => {
    if (qid) void load(qid);
    return () => {
      setTrackPoint(null);
      setLane(null);
    };
  }, [qid, load, setLane, setTrackPoint]);

  // the bar in-page (not navigating) re-queries
  useEffect(() => {
    const onSubmit = (e: Event) => {
      const t = e.target as HTMLFormElement;
      if (t.getAttribute('aria-label') !== 'Track a shipment' || !t.closest('[data-track-inline]')) return;
      e.preventDefault();
      e.stopPropagation();
      const v = (t.querySelector('input') as HTMLInputElement).value;
      void load(v);
    };
    document.addEventListener('submit', onSubmit, true);
    return () => document.removeEventListener('submit', onSubmit, true);
  }, [load]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ tone: 'success', title: 'Link copied.', body: 'Anyone with it can follow this shipment.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ tone: 'error', title: 'Couldn’t copy automatically.', body: 'Select the address bar and copy it.' });
    }
  };

  return (
    <div className="wrap">
      <div data-track-inline className="mb-12">
        <TrackBar id="track-page-input" />
        <div className="mt-4 flex flex-wrap gap-2">
          {['TA-48210-SIN', 'TA-90377-RTM', 'TA-12045-LAX'].map((d) => (
            <button key={d} type="button" onClick={() => void load(d)} className="label rounded-full border border-[var(--line)] px-4 py-2 transition-colors hover:border-signal hover:text-ink">
              Demo · {d}
            </button>
          ))}
        </div>
      </div>

      <div aria-live="polite">
        {state.s === 'idle' && (
          <p className="prose-body max-w-[48ch] border-t border-[var(--line)] pt-8">Nothing tracked yet. Paste a tracking ID above, or tap a demo. The planet will fly to the cargo.</p>
        )}

        {state.s === 'loading' && (
          <div className="border-t border-[var(--line)] pt-8" role="status" aria-label="Locating shipment">
            <p className="label mb-6">Locating shipment…</p>
            <div className="skeleton h-16 w-2/3" />
            <div className="skeleton mt-6 h-3 w-full" />
            <div className="mt-10 space-y-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
          </div>
        )}

        {state.s === 'error' && (
          <div className="border-t border-[var(--line)] pt-8" role="alert">
            <p className="display text-[clamp(2rem,4vw,3.4rem)]">We can’t find that one.</p>
            <p className="prose-body mt-3">{state.msg} Check the ID on your booking confirmation, or <a className="u-draw text-ink" href="mailto:hello@transitarc.example">ask the control tower</a>.</p>
          </div>
        )}

        {state.s === 'ok' && <Result r={state.r} onCopy={copy} copied={copied} />}
      </div>
    </div>
  );
}

function Result({ r, onCopy, copied }: { r: TrackResult; onCopy: () => void; copied: boolean }) {
  const Icon = MODE_ICON[r.mode];
  return (
    <motion.div initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={fm.section} className="border-t border-[var(--line)] pt-8">
      <div className="grid grid-cols-12 gap-x-4 gap-y-10">
        <div className="col-span-12 lg:col-span-7">
          <p className="label flex items-center gap-3">
            <Icon size={14} className="text-signal" /> {r.id} · {r.mode === 'sea' ? 'Ocean' : r.mode === 'air' ? 'Air' : 'Road'} · ref {r.carrierRef}
          </p>
          <p className="display mt-4 text-[clamp(3rem,7vw,7rem)] leading-[0.92]">
            {r.status}
          </p>
          <p className="mt-4 text-[clamp(1.1rem,1.6vw,1.5rem)]">
            {r.origin.name} → {r.destination.name}. Arriving <span className="text-signal">{fmtDay(r.eta)}</span>.
          </p>
          <p className={`label mt-3 ${r.onTime ? '!text-cyan' : '!text-[#ff9a52]'}`}>{r.onTime ? `On time. Promised ${fmtDay(r.promised)}` : `Running behind. Credit applied automatically`}</p>

          <div className="mt-10" aria-label={`Progress ${Math.round(r.progress * 100)} percent`}>
            <div className="relative h-px w-full bg-[var(--line)]">
              <motion.div className="absolute inset-y-0 left-0 bg-signal" initial={{ width: 0 }} animate={{ width: `${r.progress * 100}%` }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
              <motion.span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal shadow-[0_0_20px_4px_rgba(255,122,26,0.7)]" initial={{ left: 0 }} animate={{ left: `${r.progress * 100}%` }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
            </div>
            <div className="label mt-3 flex justify-between"><span>{r.origin.id}</span><span className="label-ink tnum">{Math.round(r.progress * 100)}%</span><span>{r.destination.id}</span></div>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-6">
            {[['Weight', `${r.weightKg.toLocaleString('en-US')} kg`], ['Pieces', String(r.pieces)], ['Mode', r.mode === 'sea' ? 'Ocean' : r.mode === 'air' ? 'Air' : 'Road']].map(([k, v]) => (
              <div key={k}><dt className="label">{k}</dt><dd className="display mt-1 text-[clamp(1.3rem,2vw,2rem)] tnum">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-8 flex gap-3">
            <button onClick={onCopy} className="label flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 transition-colors hover:border-signal hover:text-ink">
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy tracking link'}
            </button>
          </div>
        </div>

        <ol className="col-span-12 lg:col-span-5">
          {r.events.map((e, i) => (
            <motion.li
              key={e.code}
              initial={{ opacity: 0, x: 30, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              transition={{ ...fm.ui, delay: 0.15 + i * 0.08 }}
              className="relative grid grid-cols-[28px_1fr] gap-4 pb-6 last:pb-0"
            >
              <span className="relative flex justify-center">
                <span className={`z-[1] mt-1.5 h-[9px] w-[9px] rounded-full border ${e.done ? 'border-signal bg-signal' : 'border-steel bg-bg'}`} />
                {i < r.events.length - 1 && <span className={`absolute left-1/2 top-4 h-[calc(100%+8px)] w-px -translate-x-1/2 ${e.done ? 'bg-signal/50' : 'bg-[var(--line)]'}`} />}
              </span>
              <div className={e.done ? '' : 'opacity-55'}>
                <p className="text-[17px] leading-snug">{e.label}</p>
                <p className="label mt-1">{e.place} · {e.done ? fmt(e.at) : `expected ${fmt(e.at)}`}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
      <div className="mt-14"><MagneticButton href="/contact" variant="ghost">Talk to the control tower</MagneticButton></div>
    </motion.div>
  );
}
