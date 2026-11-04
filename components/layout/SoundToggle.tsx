'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useStore } from '@/lib/store';
import { setSound } from '@/lib/audio';

/** Off by default. Animated equalizer shows state. Sound is synthesised, no files. */
export function SoundToggle() {
  const on = useStore((s) => s.soundOn);
  const set = useStore((s) => s.setSoundOn);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      onClick={() => {
        set(!on);
        setSound(!on);
      }}
      className="glass fixed bottom-4 left-4 z-[70] hidden h-11 items-center gap-3 rounded-full px-4 transition-colors hover:border-white/25 sm:flex md:bottom-6 md:left-6"
    >
      {on ? <Volume2 size={16} className="text-signal" /> : <VolumeX size={16} className="text-muted" />}
      <span aria-hidden className="flex h-4 items-end gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-[2px] origin-bottom rounded-full bg-signal"
            style={{ height: '100%', transform: on ? undefined : 'scaleY(0.2)', animation: on ? `eq ${0.7 + i * 0.17}s ease-in-out ${i * 0.1}s infinite` : 'none', opacity: on ? 1 : 0.4 }}
          />
        ))}
      </span>
      <span className="label label-ink">Sound {on ? 'on' : 'off'}</span>
    </button>
  );
}
