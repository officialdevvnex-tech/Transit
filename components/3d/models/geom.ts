import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type RGB = [number, number, number];

/** Give a geometry a flat vertex colour (linear-ish 0..1; >1 allowed for emissive-looking parts). */
export function paint<T extends THREE.BufferGeometry>(g: T, c: RGB | string): T {
  const col = typeof c === 'string' ? new THREE.Color(c) : new THREE.Color(c[0], c[1], c[2]);
  const n = g.attributes.position.count;
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    a[i * 3] = col.r;
    a[i * 3 + 1] = col.g;
    a[i * 3 + 2] = col.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  return g;
}

const UP = new THREE.Vector3(0, 1, 0);
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();

/** A thin box running from a to b (truss members, cables, rails). */
export function beam(a: THREE.Vector3, b: THREE.Vector3, w: number, d = w, color: RGB | string = '#ffffff') {
  const len = a.distanceTo(b);
  const g = new THREE.BoxGeometry(w, len, d);
  const dir = b.clone().sub(a).normalize();
  _q.setFromUnitVectors(UP, dir);
  _m.compose(a.clone().add(b).multiplyScalar(0.5), _q, new THREE.Vector3(1, 1, 1));
  g.applyMatrix4(_m);
  return paint(g, color);
}

export function box(w: number, h: number, d: number, x: number, y: number, z: number, color: RGB | string) {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return paint(g, color);
}

export function cyl(rt: number, rb: number, h: number, x: number, y: number, z: number, color: RGB | string, seg = 20) {
  const g = new THREE.CylinderGeometry(rt, rb, h, seg);
  g.translate(x, y, z);
  return paint(g, color);
}

/** Truss between two points: two chords + zig-zag diagonals + rungs. Returns parts to merge. */
export function lattice(a: THREE.Vector3, b: THREE.Vector3, depth: THREE.Vector3, bays: number, t = 0.045, color: RGB | string = '#cfd5db') {
  const parts: THREE.BufferGeometry[] = [];
  const top = (p: THREE.Vector3) => p.clone().add(depth);
  parts.push(beam(a, b, t, t, color), beam(top(a), top(b), t, t, color));
  for (let i = 0; i <= bays; i++) {
    const p = a.clone().lerp(b, i / bays);
    parts.push(beam(p, top(p), t * 0.8, t * 0.8, color));
    if (i < bays) {
      const q = a.clone().lerp(b, (i + 1) / bays);
      parts.push(i % 2 ? beam(p, top(q), t * 0.8, t * 0.8, color) : beam(top(p), q, t * 0.8, t * 0.8, color));
    }
  }
  return parts;
}

export const merge = (parts: THREE.BufferGeometry[]) => {
  const g = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)))!;
  g.computeVertexNormals();
  return g;
};
