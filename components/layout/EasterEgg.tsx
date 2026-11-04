'use client';

import { useEffect } from 'react';
import { afterburner } from '@/lib/afterburner';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function EasterEgg() {
  useEffect(() => {
    console.log(
      '%cTransitArc%c  every shipment, on time, everywhere.\n%cLooking under the hood? We are hiring: /careers. Also try ↑ ↑ ↓ ↓ ← → ← → B A, or hold the logo.',
      'background:#FF7A1A;color:#0a0a0a;padding:4px 8px;font-weight:700;font-size:13px',
      'color:#EAF0F7;font-size:13px;padding-left:8px',
      'color:#8593A6;font-size:12px',
    );
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        afterburner();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}
