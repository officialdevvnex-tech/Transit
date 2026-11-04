'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HUBS, LANES, hubById, type Mode } from '@/lib/geo';
import { rt } from '@/lib/runtime';
import { useStore } from '@/lib/store';
import { Tabs } from '@/components/ui/Tabs';
import { fm } from '@/lib/motion';
import { tick } from '@/lib/audio';
import { cn } from '@/lib/utils';

const MODE_TABS = [
  { id: 'all', label: 'All lanes' },
  { id: 'air', label: 'Air' },
  { id: 'sea', label: 'Ocean' },
  { id: 'road', label: 'Road' },
] as const;

const REGIONS = Array.from(new Set(HUBS.map((h) => h.region)));

function LocalTime({ tz }: { tz: string }) {
  const [t, setT] = useState('--:--');
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }));
    f();
    const id = setInterval(f, 15000);
    return () => clearInterval(id);
  }, [tz]);
  return <span className="tnum">{t}</span>;
}

/** Drag the planet (with inertia), filter lanes by mode, fly to any hub. */
export function NetworkExplorer() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const focus = useStore((s) => s.focusHub);
  const setFocus = useStore((s) => s.setFocusHub);
  const hub = focus ? hubById(focus) : null;

  useEffect(() => () => (setMode('all'), setFocus(null)), [setMode, setFocus]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: LANES.length, air: 0, sea: 0, road: 0 };
    LANES.forEach((l) => c[l.mode]++);
    return c;
  }, []);
  const hubLanes = (id: string) => LANES.filter((l) => l.from === id || l.to === id);

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    rt.drag.active = true;
    if (focus) setFocus(null);
  };
  const move = (e: React.PointerEvent) => {
    if (rt.drag.active) {
      rt.drag.dx += e.movementX;
      rt.drag.dy += e.movementY;
    }
  };
  const up = () => (rt.drag.active = false);

  return (
    <div className="relative">
      {/* drag surface sits over the planet */}
      <div
        data-cursor="drag"
        aria-hidden
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="absolute inset-y-0 right-0 z-0 hidden w-[58%] touch-pan-y lg:block"
      />
      <div className="wrap pointer-events-none relative z-10 grid grid-cols-12 gap-x-4">
        <div className="pointer-events-auto col-span-12 lg:col-span-5 xl:col-span-4">
          <Tabs
            label="Lane mode"
            value={mode}
            onChange={(v) => setMode(v as Mode | 'all')}
            tabs={MODE_TABS.map((t) => ({ ...t, count: counts[t.id] }))}
          />
          <div className="mt-8 max-h-[52vh] overflow-y-auto pr-2 no-scrollbar" data-lenis-prevent>
            {REGIONS.map((r) => (
              <div key={r} className="mb-6">
                <p className="label mb-2">{r}</p>
                <ul>
                  {HUBS.filter((h) => h.region === r).map((h) => (
                    <li key={h.id} className="border-t border-[var(--line-soft)]">
                      <button
                        type="button"
                        onClick={() => {
                          tick(1.3);
                          setFocus(focus === h.id ? null : h.id);
                        }}
                        aria-pressed={focus === h.id}
                        className={cn('group flex w-full items-baseline justify-between gap-4 py-3 text-left transition-colors', focus === h.id ? 'text-signal' : 'hover:text-ink')}
                      >
                        <span className="display text-[clamp(1.5rem,2.2vw,2.1rem)] leading-none transition-transform duration-500 ease-expo group-hover:translate-x-2">{h.name}</span>
                        <span className="label tnum">{h.id}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-auto col-span-12 mt-8 lg:col-span-3 lg:col-start-10 lg:mt-0 lg:self-end">
          <AnimatePresence mode="wait">
            {hub ? (
              <motion.div key={hub.id} initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -12 }} transition={fm.ui} className="glass bg-surface/70 p-6">
                <p className="label">{hub.region} · {hub.country}</p>
                <p className="display mt-2 text-[clamp(2.4rem,4vw,4rem)] leading-none">{hub.name}</p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--line)] pt-4">
                  <div><dt className="label">Local time</dt><dd className="display mt-1 text-[1.7rem]"><LocalTime tz={hub.tz} /></dd></div>
                  <div><dt className="label">Lanes</dt><dd className="display mt-1 text-[1.7rem] tnum">{hubLanes(hub.id).length}</dd></div>
                </dl>
                <ul className="mt-4 space-y-1">
                  {hubLanes(hub.id).slice(0, 4).map((l, i) => (
                    <li key={i} className="label flex justify-between"><span>{l.from} → {l.to}</span><span className="label-ink">{l.mode === 'sea' ? 'Ocean' : l.mode === 'air' ? 'Air' : 'Road'}</span></li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="label text-right">Drag the planet · or pick a hub</motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
