'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap, prefersReducedMotion } from '@/lib/motion';
import { getLenis } from '@/lib/scroll';
import { sceneForPath } from '@/lib/scenes';
import { useStore } from '@/lib/store';
import { whoosh } from '@/lib/audio';

type Nav = (href: string, sharedEl?: HTMLElement | null) => void;
const Ctx = createContext<Nav>(() => {});
export const useNavigate = () => useContext(Ctx);

/** read by PageHero so it can adopt the shared-element name during a transition */
export const sharedState = { active: false };

type VTDoc = Document & { startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> } };

/**
 * One continuous move: the 3D scene target changes immediately (camera starts gliding),
 * while the DOM swaps behind a clip-path wipe. View Transitions API where available
 * (with an optional shared element), GSAP panel wipe elsewhere.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const setScene = useStore((s) => s.setScene);
  const setBeat = useStore((s) => s.setBeat);
  const setTransitioning = useStore((s) => s.setTransitioning);
  const panel = useRef<HTMLDivElement>(null);
  const resolver = useRef<(() => void) | null>(null);
  const current = useRef(pathname);
  const busy = useRef(false);

  // route changed → scene, scroll reset, release any pending transition
  useEffect(() => {
    current.current = pathname;
    setScene(sceneForPath(pathname));
    setBeat(0);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    if (resolver.current) {
      const r = resolver.current;
      resolver.current = null;
      requestAnimationFrame(() => requestAnimationFrame(r));
    }
  }, [pathname, setScene, setBeat]);

  const waitForRoute = useCallback(
    () =>
      new Promise<void>((res) => {
        resolver.current = res;
        setTimeout(res, 2500); // never hang
      }),
    [],
  );

  const navigate = useCallback<Nav>(
    (href, sharedEl) => {
      if (busy.current) return;
      const target = href.split('#')[0].split('?')[0] || '/';
      if (target === current.current && !href.includes('?')) return;
      busy.current = true;
      setTransitioning(true);
      setScene(sceneForPath(target)); // camera starts gliding NOW
      whoosh();

      const done = () => {
        busy.current = false;
        setTransitioning(false);
        sharedState.active = false;
        document.querySelectorAll<HTMLElement>('[data-vt]').forEach((el) => (el.style.viewTransitionName = ''));
      };

      const doc = document as VTDoc;
      if (prefersReducedMotion()) {
        router.push(href);
        setTimeout(done, 200);
        return;
      }

      if (doc.startViewTransition) {
        if (sharedEl) {
          sharedEl.style.viewTransitionName = 'shared';
          sharedEl.setAttribute('data-vt', '');
          sharedState.active = true;
        }
        const t = doc.startViewTransition(async () => {
          const wait = waitForRoute();
          router.push(href);
          await wait;
        });
        t.finished.finally(done);
        return;
      }

      // GSAP fallback: panel wipes up, route swaps, panel wipes away
      const p = panel.current;
      if (!p) {
        router.push(href);
        done();
        return;
      }
      void (async () => {
        p.style.display = 'block';
        await gsap.fromTo(p, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.7, ease: 'inOutQuart' });
        const wait = waitForRoute();
        router.push(href);
        await wait;
        await gsap.to(p, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'inOutQuart', delay: 0.1 });
        p.style.display = 'none';
        done();
      })();
    },
    [router, setScene, setTransitioning, waitForRoute],
  );

  const value = useMemo(() => navigate, [navigate]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div ref={panel} aria-hidden className="pointer-events-none fixed inset-0 z-[90] hidden bg-surface" style={{ clipPath: 'inset(100% 0 0 0)' }}>
        <div className="absolute inset-x-0 top-0 h-px bg-signal" />
      </div>
    </Ctx.Provider>
  );
}
