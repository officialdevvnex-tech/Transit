import type Lenis from 'lenis';

let inst: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  inst = l;
};
export const getLenis = () => inst;

export function scrollToEl(target: string | HTMLElement | number, offset = 0) {
  if (inst) inst.scrollTo(target as never, { offset, duration: 1.4, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
  else {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    el?.scrollIntoView({ behavior: 'smooth' });
  }
}
