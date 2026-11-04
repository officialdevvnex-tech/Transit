'use client';

import { useId, useRef } from 'react';
import gsap from 'gsap';
import { rand } from '@/lib/utils';

const HUES = [
  ['#FF7A1A', '#38BDF8'],
  ['#38BDF8', '#94A3B8'],
  ['#94A3B8', '#FF7A1A'],
];

type Props = { hue?: number; seed?: number; label?: string; sub?: string; interactive?: boolean; className?: string };

/**
 * A procedural "photograph": gradient field, great-circle arcs, dot matrix and a data label.
 * On hover an SVG displacement filter ripples the plate and the RGB channels split.
 * (Stands in for photography; swap for real images, the hover treatment is a CSS filter.)
 */
export function Plate({ hue = 0, seed = 1, label, sub, interactive, className }: Props) {
  const uid = useId().replace(/:/g, '');
  const turb = useRef<SVGFETurbulenceElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const r = (n: number) => rand(seed * 17 + n);
  const [a, b] = HUES[hue % 3];

  const arcs = Array.from({ length: 5 }, (_, i) => {
    const x1 = 20 + r(i) * 60;
    const x2 = 260 + r(i + 9) * 120;
    const y = 200 + r(i + 4) * 240;
    const lift = 80 + r(i + 20) * 220;
    return `M${x1} ${y} C ${x1 + 80} ${y - lift}, ${x2 - 80} ${y - lift}, ${x2} ${y + r(i + 7) * 60 - 30}`;
  });

  const enter = () => {
    if (!interactive) return;
    gsap.to(disp.current, { attr: { scale: 34 }, duration: 0.7, ease: 'expoOut' });
    gsap.to(turb.current, { attr: { baseFrequency: '0.012 0.03' }, duration: 1.2, ease: 'expoOut' });
  };
  const leave = () => {
    if (!interactive) return;
    gsap.to(disp.current, { attr: { scale: 0 }, duration: 0.9, ease: 'expoOut' });
    gsap.to(turb.current, { attr: { baseFrequency: '0.006 0.012' }, duration: 1.2, ease: 'expoOut' });
  };

  return (
    <div className={`group relative h-full w-full overflow-hidden ${className ?? ''}`} onPointerEnter={enter} onPointerLeave={leave}>
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-label={label ? `${label} ${sub ?? ''}` : 'Abstract freight plate'}>
        <defs>
          <radialGradient id={`g1-${uid}`} cx={`${20 + r(1) * 60}%`} cy={`${10 + r(2) * 40}%`} r="90%">
            <stop offset="0" stopColor={a} stopOpacity=".9" />
            <stop offset=".45" stopColor={a} stopOpacity=".12" />
            <stop offset="1" stopColor="#0F1620" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`g2-${uid}`} cx={`${50 + r(3) * 50}%`} cy={`${60 + r(4) * 40}%`} r="80%">
            <stop offset="0" stopColor={b} stopOpacity=".7" />
            <stop offset=".5" stopColor={b} stopOpacity=".08" />
            <stop offset="1" stopColor="#0F1620" stopOpacity="0" />
          </radialGradient>
          <pattern id={`dots-${uid}`} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="1.1" fill="#EAF0F7" fillOpacity=".22" />
          </pattern>
          <filter id={`d-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence ref={turb} type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="2" seed={seed} result="n" />
            <feDisplacementMap ref={disp} in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter={`url(#d-${uid})`}>
          <rect width="400" height="500" fill="#0F1620" />
          <rect width="400" height="500" fill={`url(#g1-${uid})`} />
          <rect width="400" height="500" fill={`url(#g2-${uid})`} />
          <rect width="400" height="500" fill={`url(#dots-${uid})`} />
          {arcs.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={i % 2 ? b : a} strokeWidth={i === 0 ? 2 : 1} strokeOpacity={i === 0 ? 0.95 : 0.45} strokeLinecap="round" />
          ))}
          <circle cx={30 + r(30) * 40} cy={300 + r(31) * 100} r="4" fill={a} />
          <circle cx={300 + r(32) * 80} cy={260 + r(33) * 120} r="4" fill={b} />
        </g>
        {/* RGB split ghost, revealed on hover */}
        {interactive && (
          <g className="opacity-0 mix-blend-screen transition-opacity duration-500 group-hover:opacity-70" style={{ transform: 'translate(5px,0)' }}>
            {arcs.slice(0, 2).map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#38BDF8" strokeWidth="1.5" />
            ))}
          </g>
        )}
      </svg>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />
      {label && (
        <div className="absolute inset-x-4 bottom-4">
          <p className="display text-[clamp(1.8rem,2.4vw,2.6rem)] leading-none">{label}</p>
          {sub && <p className="label mt-2">{sub}</p>}
        </div>
      )}
    </div>
  );
}
