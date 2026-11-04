'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ENV_ORIGIN, type Env } from '@/lib/scenes';
import { S } from './state';

type P = { p: [number, number, number]; c: string; i: number; d?: number };
type Preset = { dir: P; pts: [P, P, P] };

const OFF: P = { p: [0, 0, 0], c: '#000000', i: 0, d: 10 };

/** Fixed light count for the whole site (so materials never recompile mid-flight); presets re-aim them per world. */
const PRESETS: Record<Env, Preset> = {
  earth: { dir: { p: [-4, 5, 6], c: '#dfeaff', i: 1.4 }, pts: [{ p: [5, 2, -4], c: 'rim', i: 40, d: 30 }, { p: [-5, -2, 3], c: '#38BDF8', i: 16, d: 24 }, OFF] },
  port: { dir: { p: [-6, 10, 12], c: '#cfe3ff', i: 2.16 }, pts: [{ p: [2.5, 8, -2], c: '#FF7A1A', i: 216.0, d: 40 }, { p: [-10, 6, 8], c: '#38BDF8', i: 144.0, d: 40 }, { p: [14, 4, 2], c: '#38BDF8', i: 72.0, d: 20 }] },
  tunnel: { dir: OFF, pts: [{ p: [0, 0, 8], c: '#FF7A1A', i: 100.0, d: 50 }, { p: [0, 0, -60], c: '#38BDF8', i: 160.0, d: 90 }, { p: [0, 0, -110], c: '#FF7A1A', i: 160.0, d: 90 }] },
  gallery: { dir: { p: [-6, 12, 10], c: '#dfeaff', i: 2.86 }, pts: [{ p: [0, 6, 4], c: '#FF7A1A', i: 182.0, d: 50 }, { p: [0, 4, -6], c: '#38BDF8', i: 156.0, d: 50 }, { p: [-14, 5, 6], c: '#38BDF8', i: 104.0, d: 40 }] },
  horizon: { dir: { p: [0, 6, -10], c: '#FF9A52', i: 0.91 }, pts: [{ p: [0, 8, -40], c: '#FF7A1A', i: 182.0, d: 160 }, { p: [0, 3, 12], c: '#38BDF8', i: 26.0, d: 60 }, OFF] },
  drift: { dir: { p: [0, 3, 6], c: '#cfe3ff', i: 1.0 }, pts: [{ p: [0, 4, 6], c: '#38BDF8', i: 100.0, d: 60 }, { p: [-8, -4, -6], c: '#FF7A1A', i: 100.0, d: 60 }, OFF] },
};

const col = new THREE.Color();
const tgt = new THREE.Vector3();

export function SharedLights() {
  const dir = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const pts = [useRef<THREE.PointLight>(null), useRef<THREE.PointLight>(null), useRef<THREE.PointLight>(null)];

  useFrame((_s, dt) => {
    const env = S.env as Env;
    const pre = PRESETS[env];
    const O = ENV_ORIGIN[env];
    const k = 1 - Math.exp(-dt * 3);
    const apply = (l: THREE.Light | null, p: P) => {
      if (!l) return;
      tgt.set(O[0] + p.p[0], O[1] + p.p[1], O[2] + p.p[2]);
      l.position.lerp(tgt, k);
      l.color.lerp(p.c === 'rim' ? S.rim : col.set(p.c), k);
      l.intensity += ((p.i * (env === 'earth' && p === pre.dir ? 1 - S.dim * 0.5 : 1)) - l.intensity) * k;
      const pl = l as THREE.PointLight;
      if (p.d !== undefined && 'distance' in pl) pl.distance += (p.d - pl.distance) * k;
    };
    apply(dir.current, pre.dir);
    target.position.lerp(tgt.set(O[0], O[1], O[2]), k);
    target.updateMatrixWorld();
    pts.forEach((r, i) => apply(r.current, pre.pts[i]));
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <primitive object={target} />
      <directionalLight ref={dir} target={target} position={[-4, 5, 6]} intensity={1.4} color="#dfeaff" castShadow shadow-mapSize={[1536, 1536]} shadow-bias={-0.0004} shadow-normalBias={0.04} shadow-camera-near={1} shadow-camera-far={140} shadow-camera-left={-45} shadow-camera-right={45} shadow-camera-top={45} shadow-camera-bottom={-45} />
      {pts.map((r, i) => (
        <pointLight key={i} ref={r} position={[0, 0, 0]} intensity={0} distance={30} decay={2} />
      ))}
    </>
  );
}
