/**
 * The single motion system. Every duration, easing and stagger in the site comes from here.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

export const bezier = {
  expoOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOutQuart: [0.76, 0, 0.24, 1] as [number, number, number, number],
};

export const css = {
  expoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  inOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
};

/** Seconds. */
export const dur = {
  micro: 0.28,
  ui: 0.6,
  section: 1.05,
  page: 1.1,
};

export const stagger = {
  word: 0.06,
  line: 0.08,
  char: 0.025,
  card: 0.1,
};

/** Framer Motion presets */
export const fm = {
  ui: { duration: dur.ui, ease: bezier.expoOut },
  micro: { duration: dur.micro, ease: bezier.expoOut },
  section: { duration: dur.section, ease: bezier.expoOut },
  page: { duration: dur.page, ease: bezier.inOutQuart },
};

export const variants = {
  /** translate + blur-to-sharp */
  rise: {
    hidden: { opacity: 0, y: 36, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: fm.section },
  },
  /** scale from .9 with clip-path */
  plate: {
    hidden: { opacity: 0, scale: 0.9, clipPath: 'inset(12% 12% 12% 12%)' },
    show: { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)', transition: fm.section },
  },
};

let registered = false;
export function registerMotion() {
  if (registered || typeof window === 'undefined') return;
  registered = true;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create('expoOut', '0.16,1,0.3,1');
  CustomEase.create('inOutQuart', '0.76,0,0.24,1');
  gsap.defaults({ ease: 'expoOut', duration: dur.ui });
}

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
