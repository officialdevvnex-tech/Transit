import gsap from 'gsap';
import { rt } from './runtime';
import { useStore } from './store';

/** Easter egg: every lane at 4× for a few seconds. Konami code or press-and-hold the logo. */
export function afterburner() {
  rt.afterburner = 1;
  rt.burst.t += 1;
  useStore.getState().toast({ tone: 'info', title: 'Afterburner engaged', body: 'Overnight Priority unlocked. All lanes at 4× for a few seconds.' });
  gsap.killTweensOf(rt, 'afterburner');
  gsap.to(rt, { afterburner: 0, duration: 4, delay: 4, ease: 'power2.inOut' });
}
