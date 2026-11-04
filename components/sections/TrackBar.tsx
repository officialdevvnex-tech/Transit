'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Radar } from 'lucide-react';
import { useNavigate } from '@/components/layout/TransitionProvider';
import { hubById } from '@/lib/geo';
import { rt } from '@/lib/runtime';
import { useStore } from '@/lib/store';
import { tick } from '@/lib/audio';
import { trackIdSchema } from '@/lib/schemas';

/**
 * Tracking bar. Signature interaction #2 (part 1): every keystroke pings the globe, and once the
 * ID ends in a hub code (…-SIN) the planet turns to face that hub while you type.
 */
export function TrackBar({ id = 'tracking' }: { id?: string }) {
  const [v, setV] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();
  const setFocusHub = useStore((s) => s.setFocusHub);

  useEffect(() => () => setFocusHub(null), [setFocusHub]);

  const onChange = (raw: string) => {
    const val = raw.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12);
    setV(val);
    setErr('');
    rt.ping = 1;
    tick(1 + Math.min(val.length, 12) * 0.05);
    const m = val.match(/-([A-Z]{3})$/);
    setFocusHub(m && hubById(m[1]) ? m[1] : null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = trackIdSchema.safeParse(v);
    if (!r.success) {
      setErr(r.error.issues[0].message);
      return;
    }
    navigate(`/track?id=${encodeURIComponent(r.data)}`);
  };

  return (
    <form onSubmit={submit} noValidate className="w-full max-w-[640px]" aria-label="Track a shipment">
      <label htmlFor={id} className="label mb-3 flex items-center gap-2">
        <Radar size={13} className="text-signal" /> Track a shipment
      </label>
      <div className="glass group flex items-center gap-2 rounded-full bg-surface/60 p-2 pl-6 transition-[border-color,box-shadow] duration-500 ease-expo focus-within:border-signal/60 focus-within:shadow-[0_0_60px_-10px_rgba(255,122,26,0.5)]">
        <input
          id={id}
          value={v}
          onChange={(e) => onChange(e.target.value)}
          inputMode="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="TA-48210-SIN"
          aria-invalid={!!err}
          aria-describedby={`${id}-hint`}
          className="min-w-0 flex-1 bg-transparent py-3 text-[18px] tracking-[0.04em] text-ink outline-none placeholder:text-[#5d6b7e] tnum"
        />
        <button type="submit" aria-label="Track" className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-signal px-6 text-[13px] font-medium uppercase tracking-label text-[#0a0a0a] transition-transform duration-300 ease-expo hover:scale-[1.04] active:scale-95">
          Track <ArrowRight size={16} />
        </button>
      </div>
      <p id={`${id}-hint`} className={`mt-3 min-h-[1.5em] text-[13px] ${err ? 'text-[#ff9a52]' : 'text-muted'}`} role={err ? 'alert' : undefined}>
        {err || 'Try TA-48210-SIN. Add a hub code (SIN, RTM, LAX…) and watch the planet turn.'}
      </p>
    </form>
  );
}
