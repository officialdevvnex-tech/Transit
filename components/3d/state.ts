import * as THREE from 'three';

/** Per-frame, damped scene state. Written only by <Director/>, read by every 3D component. */
export const S = {
  globe: { x: 0, y: 0, scale: 1, rotX: 0, rotY: 0, spin: 0, spinMix: 0 },
  lanes: 0,
  yard: 0,
  dust: 0,
  dim: 0,
  glitch: 0,
  assemble: 0,
  weights: { air: 1, sea: 1, road: 1 },
  rim: new THREE.Color('#FF7A1A'),
  time: 0,
  mouseWorld: new THREE.Vector3(),
  burstOrigin: new THREE.Vector3(),
  burstT: -10,
  /** drag-to-rotate (Network) */
  drag: { lon: 0, lat: 0, vLon: 0, vLat: 0, active: false },
  /** shader marks: xyz = unit vector in globe space, w = intensity. 0 lane A, 1 lane B, 2 shipment, 3 focused hub */
  marks: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()],
  mobile: false,
  env: 'earth' as 'earth' | 'port' | 'tunnel' | 'gallery' | 'horizon' | 'drift',
  vis: { earth: true, port: false, tunnel: false, gallery: false, horizon: false, drift: false } as Record<string, boolean>,
  warp: 0,
  ready: 0, // 0..1 eased, drives 3D title reveal
  mouseDir: new THREE.Vector3(0, 0, -1),
  burstDir: new THREE.Vector3(0, 0, -1),
  scene: 'home' as string,
};

export function dragGlobe(dx: number, dy: number) {
  S.drag.vLon = dx * 0.35;
  S.drag.vLat = dy * 0.25;
  S.drag.active = true;
}
export function endDrag() {
  S.drag.active = false;
}

export const dampAngle = (cur: number, target: number, lambda: number, dt: number) => {
  let d = (target - cur) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return cur + d * (1 - Math.exp(-lambda * dt));
};
