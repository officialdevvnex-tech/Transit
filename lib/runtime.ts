/**
 * Mutable per-frame state shared between DOM effects and the WebGL loop.
 * Deliberately NOT React state: it is written 60×/s.
 */
export const rt = {
  scroll: 0, // px
  velocity: 0, // smoothed px/frame
  progress: 0, // 0..1 page scroll progress
  mouse: { x: 0, y: 0, nx: 0, ny: 0 }, // px and -1..1
  burst: { t: -10, x: 0, y: 0 },
  drag: { dx: 0, dy: 0, active: false }, // network globe drag input
  ping: 0, // keystroke energy 0..1
  skewTargets: new Set<HTMLElement>(),
  afterburner: 0, // 0..1 easter egg
  reduced: false,
  /** dev/QA: snap the camera instantly and ignore DOM beats */
  snap: false,
  lockBeat: false,
};
