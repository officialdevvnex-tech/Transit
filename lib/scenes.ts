import type { Mode } from './geo';

export type SceneKey =
  | 'home' | 'services' | 'track' | 'quote' | 'network' | 'industries'
  | 'about' | 'careers' | 'blog' | 'contact' | 'lost';

/** Six 3D worlds living side by side in ONE scene graph. The camera flies between them. */
export type Env = 'earth' | 'port' | 'tunnel' | 'gallery' | 'horizon' | 'drift';

export const ENV_ORIGIN: Record<Env, [number, number, number]> = {
  earth: [0, 0, 0],
  port: [90, 0, 0],
  tunnel: [180, 0, 0],
  gallery: [270, 0, 0],
  horizon: [360, 0, 0],
  drift: [450, 0, 0],
};

type V3 = [number, number, number];

export type SceneCfg = {
  env: Env;
  /** earth: world coords. other envs: local to the env origin */
  cam: V3;
  look: V3;
  fov: number;
  globe: { x: number; y: number; scale: number };
  focus: { lat: number; lon: number };
  spin: number;
  lanes: number;
  dust: number;
  dim: number;
  glitch: number;
  interactive: boolean;
  /** earth scenes: applied across page scroll progress 0→1 */
  scroll: { cam: V3; lon: number; scale: number };
  altitude: [number, number];
  mobile: { x: number; y: number; scale: number };
  rim: string;
  /** decor shown around the planet */
  decor: 'none' | 'network' | 'track' | 'quote' | 'contact';
  /** page sections tagged data-beat="n" pick the active beat; each beat can override anything */
  beats?: Beat[];
};
export type Beat = Partial<Omit<SceneCfg, 'beats'>>;

const base: SceneCfg = {
  env: 'earth', cam: [0, 0.2, 6.2], look: [0, 0, 0], fov: 36,
  globe: { x: 1.55, y: -0.25, scale: 1.45 }, focus: { lat: 28, lon: 40 }, spin: 0.045,
  lanes: 1, dust: 1, dim: 0, glitch: 0, interactive: false,
  scroll: { cam: [0, 0, 0], lon: 0, scale: 0 }, altitude: [408, 36],
  mobile: { x: 0, y: 1.05, scale: 0.95 }, rim: '#FF7A1A', decor: 'none',
};
const S = (o: Partial<SceneCfg>): SceneCfg => ({ ...base, ...o });

const galleryX = (i: number) => (i - 2.5) * 6;

export const SCENES: Record<SceneKey, SceneCfg> = {
  home: S({
    look: [0.9, -0.1, 0],
    altitude: [408, 0.3],
    beats: [
      {}, // 0 hero: planet right
      { cam: [0, 0.3, 8.6], look: [0, 0, 0], globe: { x: 2.7, y: -0.5, scale: 1.25 }, focus: { lat: 20, lon: 100 }, dim: 0.2, mobile: { x: 0, y: 1.6, scale: 0.8 } },
      { cam: [0, 0.1, 5.1], look: [0.6, 0, 0], globe: { x: 1.65, y: 0, scale: 1.75 }, focus: { lat: 38, lon: 40 }, spin: 0.02, mobile: { x: 0, y: 1.0, scale: 1.1 } },
      { env: 'port', cam: [10, 5, 30], look: [0, 3, 0], fov: 42, rim: '#38BDF8' },
      { env: 'tunnel', cam: [0, 0, 18], look: [0, 0, -30], fov: 58, rim: '#FF7A1A' },
      { env: 'gallery', cam: [0, 2.4, 15], look: [0, 1.5, 0], fov: 40, rim: '#38BDF8' },
      { cam: [0, 0.2, 6.4], look: [0.5, 0, 0], globe: { x: 1.7, y: -0.1, scale: 1.4 }, focus: { lat: 28, lon: 62 }, lanes: 0.5, mobile: { x: 0, y: 1.1, scale: 0.9 } },
      { cam: [0, 0.4, 9.5], look: [0, 0, 0], globe: { x: 0, y: -0.5, scale: 1.3 }, dim: 0.15, mobile: { x: 0, y: -0.2, scale: 1.0 } },
    ],
  }),
  services: S({
    env: 'port', cam: [4, 7, 36], look: [0, 5, 0], fov: 40, rim: '#38BDF8', altitude: [36, 0.02],
    beats: [
      {},
      { cam: [-6, 2.5, 20], look: [0, 12, -13] },
      { cam: [14, 3.5, 16], look: [-3, 1.5, 3] },
      { cam: [-18, 2.2, -1], look: [8, 1.5, -9] },
      { cam: [-14, 3, -4], look: [-30, 3, -18] },
      { cam: [14, 3.2, -1], look: [26, 2, -9] },
      { cam: [0, 9, 38], look: [0, 3, 0] },
      { cam: [0, 6, 30], look: [0, 3, 0] },
    ],
  }),
  track: S({
    cam: [0, 0.1, 4.6], look: [0.8, 0, 0], fov: 34, globe: { x: 1.15, y: -0.1, scale: 1.55 }, focus: { lat: 30, lon: 10 }, spin: 0,
    lanes: 0.35, dust: 0.6, altitude: [1200, 400], mobile: { x: 0, y: 1.0, scale: 0.85 }, rim: '#38BDF8', decor: 'track',
    scroll: { cam: [0, 0, -0.6], lon: 0, scale: 0 },
  }),
  quote: S({
    cam: [0, 0.4, 7.4], look: [0, 0, 0], fov: 34, globe: { x: 1.9, y: 0.1, scale: 1.3 }, focus: { lat: 30, lon: 40 }, spin: 0.02,
    lanes: 0.25, dust: 0.7, altitude: [2400, 1800], mobile: { x: 0, y: 1.2, scale: 0.7 }, decor: 'quote',
  }),
  network: S({
    cam: [0, 0, 5.4], look: [0, 0, 0], fov: 36, globe: { x: 0.9, y: 0, scale: 1.7 }, focus: { lat: 25, lon: 20 }, spin: 0.05,
    interactive: true, altitude: [1500, 900], mobile: { x: 0, y: 0.7, scale: 1.1 }, rim: '#38BDF8', decor: 'network',
    scroll: { cam: [0, 0, 0.6], lon: 0, scale: 0 },
  }),
  industries: S({
    env: 'gallery', cam: [0, 2.6, 15], look: [0, 1.6, 0], fov: 40, rim: '#38BDF8', altitude: [220, 40],
    beats: [
      {},
      ...[0, 1, 2, 3, 4, 5].map((i): Beat => ({ cam: [galleryX(i) + 1.6, 2.0, 6.6], look: [galleryX(i), 1.5, 0] })),
      { cam: [0, 3.4, 17], look: [0, 1, 0] },
    ],
  }),
  about: S({
    env: 'tunnel', cam: [0, 0, 18], look: [0, 0, -30], fov: 58, altitude: [3600, 408],
    beats: [{}, ...[-4, -32, -60, -88, -112].map((z): Beat => ({ cam: [0, 0, z], look: [0, 0, z - 40] }))],
  }),
  careers: S({
    env: 'horizon', cam: [0, 1.6, 14], look: [0, 3.2, -30], fov: 46, altitude: [12, 0.4],
    beats: [{}, { cam: [0, 3.4, 11], look: [0, 2.6, -30] }, { cam: [0, 7, 8], look: [0, 3, -40] }, { cam: [0, 13, 12], look: [0, 0, -30] }],
  }),
  blog: S({
    env: 'drift', cam: [0, 0, 12], look: [0, 0, 0], fov: 40, rim: '#38BDF8', altitude: [5200, 5000],
    beats: [{}, { cam: [0, 0.3, 6], look: [0, 0.4, -10] }, { cam: [0, 0, 2], look: [0, 0, -20] }],
  }),
  contact: S({
    cam: [0, 0.1, 4.8], look: [0.7, 0, 0], fov: 34, globe: { x: 1.4, y: -0.1, scale: 1.45 }, focus: { lat: 51.9, lon: 4.1 }, spin: 0,
    lanes: 0.4, dust: 0.6, altitude: [90, 0.5], mobile: { x: 0, y: 1.0, scale: 0.85 }, decor: 'contact',
  }),
  lost: S({
    env: 'drift', cam: [0, 0, 11], look: [0, 0, 0], fov: 42, glitch: 1, dim: 0.45, altitude: [0, 0],
  }),
};

export function sceneForPath(path: string): SceneKey {
  const seg = path.split('/').filter(Boolean)[0] ?? '';
  switch (seg) {
    case '': return 'home';
    case 'services': return 'services';
    case 'track': return 'track';
    case 'quote': return 'quote';
    case 'network': return 'network';
    case 'industries': return 'industries';
    case 'about': return 'about';
    case 'careers': return 'careers';
    case 'blog': return 'blog';
    case 'contact': return 'contact';
    default: return 'lost';
  }
}

const cache = new Map<string, SceneCfg>();
/** Scene config merged with the active beat (memoised). */
export function resolveScene(key: SceneKey, beat: number): SceneCfg {
  const cfg = SCENES[key];
  if (!cfg.beats) return cfg;
  const i = Math.max(0, Math.min(beat, cfg.beats.length - 1));
  const k = `${key}:${i}`;
  let r = cache.get(k);
  if (!r) {
    const { beats: _b, ...rest } = cfg;
    void _b;
    r = { ...rest, ...cfg.beats[i] };
    cache.set(k, r);
  }
  return r;
}

export const MODE_COLORS: Record<Mode, string> = { air: '#38BDF8', sea: '#94A3B8', road: '#FF7A1A' };
