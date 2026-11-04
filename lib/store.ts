import { create } from 'zustand';
import type { Mode } from './geo';
import type { SceneKey } from './scenes';

export type ToastItem = { id: number; tone: 'success' | 'error' | 'info'; title: string; body?: string };

type State = {
  scene: SceneKey;
  setScene: (s: SceneKey) => void;

  /** active camera beat on the current page (set by [data-beat] sections) */
  beat: number;
  setBeat: (n: number) => void;
  /** page headline rendered as real 3D text; *word* = emphasis */
  title: string | null;
  setTitle: (t: string | null) => void;
  /** px of DOM at the bottom of the hero that the 3D headline must clear */
  heroReserve: number;
  setHeroReserve: (n: number) => void;

  /** highlight a lane mode on the globe ('all' = everything) */
  mode: Mode | 'all';
  setMode: (m: Mode | 'all') => void;

  /** network page: hub the globe should face */
  focusHub: string | null;
  setFocusHub: (id: string | null) => void;

  /** Live Lane: previewed lane (quote form) */
  lane: { from: string; to: string; progress?: number } | null;
  setLane: (l: { from: string; to: string; progress?: number } | null) => void;

  /** Track: shipment position */
  trackPoint: { lat: number; lon: number; from?: string; to?: string; progress?: number } | null;
  setTrackPoint: (p: State['trackPoint']) => void;

  /** 0 = off, 1 = bloom only, 2 = full */
  quality: 0 | 1 | 2;
  setQuality: (q: 0 | 1 | 2) => void;
  webgl: boolean | null;
  setWebgl: (v: boolean) => void;

  /** preloader done → hero may reveal, globe assembled */
  ready: boolean;
  setReady: (v: boolean) => void;

  transitioning: boolean;
  setTransitioning: (v: boolean) => void;

  soundOn: boolean;
  setSoundOn: (v: boolean) => void;

  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: number) => void;
};

let toastId = 0;

export const useStore = create<State>((set) => ({
  scene: 'home',
  setScene: (scene) => set((s) => (s.scene === scene ? s : { scene, beat: 0 })),
  beat: 0,
  setBeat: (beat) => set({ beat }),
  title: null,
  setTitle: (title) => set({ title }),
  heroReserve: 0,
  setHeroReserve: (heroReserve) => set({ heroReserve }),
  mode: 'all',
  setMode: (mode) => set({ mode }),
  focusHub: null,
  setFocusHub: (focusHub) => set({ focusHub }),
  lane: null,
  setLane: (lane) => set({ lane }),
  trackPoint: null,
  setTrackPoint: (trackPoint) => set({ trackPoint }),
  quality: 2,
  setQuality: (quality) => set({ quality }),
  webgl: null,
  setWebgl: (webgl) => set({ webgl }),
  ready: false,
  setReady: (ready) => set({ ready }),
  transitioning: false,
  setTransitioning: (transitioning) => set({ transitioning }),
  soundOn: false,
  setSoundOn: (soundOn) => set({ soundOn }),
  toasts: [],
  toast: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: ++toastId }].slice(-3) })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
