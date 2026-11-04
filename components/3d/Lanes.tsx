'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { S } from './state';
import { LANES, hubById, type Mode } from '@/lib/geo';
import { arcPoints } from '@/lib/geo3d';
import { MODE_COLORS } from '@/lib/scenes';
import { useStore } from '@/lib/store';
import { rand } from '@/lib/utils';

const LIFT: Record<Mode, number> = { air: 0.36, sea: 0.045, road: 0.014 };
const SPEED: Record<Mode, number> = { air: 0.055, sea: 0.02, road: 0.034 };
const SIZE: Record<Mode, number> = { air: 0.05, sea: 0.045, road: 0.028 };
const N = 72;

const laneVert = /* glsl */ `
attribute float aT; attribute float aPhase;
varying float vT; varying float vPhase;
void main(){ vT = aT; vPhase = aPhase; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const laneFrag = /* glsl */ `
precision highp float;
uniform float uTime, uSpeed, uGain; uniform vec3 uColor;
varying float vT; varying float vPhase;
void main(){
  float h1 = fract(uTime * uSpeed + vPhase);
  float h2 = fract(h1 + 0.5);
  float t1 = exp(-mod(h1 - vT + 1.0, 1.0) * 9.0);
  float t2 = exp(-mod(h2 - vT + 1.0, 1.0) * 9.0);
  float trail = max(t1, t2);
  float ends = smoothstep(0.0, 0.05, vT) * smoothstep(1.0, 0.95, vT);
  float a = (0.13 + trail * 1.1) * uGain * ends;
  gl_FragColor = vec4(uColor * (0.9 + trail * 2.4), a);
  #include <colorspace_fragment>
}`;

function paint(g: THREE.BufferGeometry, r: number, gg: number, b: number) {
  const n = g.attributes.position.count;
  const c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    c[i * 3] = r;
    c[i * 3 + 1] = gg;
    c[i * 3 + 2] = b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  return g;
}
const box = (w: number, h: number, d: number, x: number, y: number, z: number, col: [number, number, number]) => {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return paint(g, ...col);
};

function buildVehicles() {
  const O: [number, number, number] = [2.4, 0.95, 0.18];
  const C: [number, number, number] = [0.3, 1.4, 2.2];
  const W: [number, number, number] = [1.1, 1.2, 1.3];
  const D: [number, number, number] = [0.28, 0.34, 0.42];
  const ship = mergeGeometries([
    box(0.2, 0.12, 0.9, 0, 0.06, 0, D),
    paint(new THREE.ConeGeometry(0.14, 0.3, 4).rotateX(Math.PI / 2).rotateZ(Math.PI / 4).scale(1, 0.85, 1).translate(0, 0.06, 0.58), ...D),
    box(0.16, 0.2, 0.14, 0, 0.22, -0.34, W),
    box(0.15, 0.09, 0.2, 0, 0.17, 0.22, O),
    box(0.15, 0.09, 0.2, 0, 0.17, -0.02, C),
    box(0.15, 0.09, 0.2, 0, 0.26, 0.1, O),
  ])!;
  const plane = mergeGeometries([
    paint(new THREE.CylinderGeometry(0.07, 0.05, 0.95, 8).rotateX(Math.PI / 2), ...W),
    paint(new THREE.ConeGeometry(0.07, 0.22, 8).rotateX(Math.PI / 2).translate(0, 0, 0.58), ...W),
    box(1.05, 0.02, 0.2, 0, 0, 0.02, C),
    box(0.02, 0.2, 0.17, 0, 0.1, -0.42, O),
    box(0.36, 0.02, 0.1, 0, 0.02, -0.42, C),
  ])!;
  const truck = mergeGeometries([
    box(0.3, 0.3, 0.26, 0, 0.15, 0.38, O),
    box(0.32, 0.36, 0.7, 0, 0.18, -0.1, W),
    box(0.34, 0.06, 0.74, 0, 0.0, -0.1, D),
  ])!;
  return { ship, plane, truck };
}

type Arc = { mode: Mode; pts: THREE.Vector3[]; phase: number };

export function Lanes() {
  const { arcs, lines, geos } = useMemo(() => {
    const arcs: Arc[] = [];
    LANES.forEach((l, i) => {
      const a = hubById(l.from)!;
      const b = hubById(l.to)!;
      arcs.push({ mode: l.mode, pts: arcPoints(a, b, LIFT[l.mode], N), phase: rand(i + 1) });
    });
    const lines = (['air', 'sea', 'road'] as Mode[]).map((mode) => {
      const pos: number[] = [];
      const t: number[] = [];
      const ph: number[] = [];
      arcs
        .filter((a) => a.mode === mode)
        .forEach((a) => {
          for (let i = 0; i < N; i++) {
            const p0 = a.pts[i];
            const p1 = a.pts[i + 1];
            pos.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
            t.push(i / N, (i + 1) / N);
            ph.push(a.phase, a.phase);
          }
        });
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('aT', new THREE.Float32BufferAttribute(t, 1));
      g.setAttribute('aPhase', new THREE.Float32BufferAttribute(ph, 1));
      const m = new THREE.ShaderMaterial({
        vertexShader: laneVert,
        fragmentShader: laneFrag,
        uniforms: { uTime: { value: 0 }, uSpeed: { value: SPEED[mode] }, uGain: { value: 1 }, uColor: { value: new THREE.Color(MODE_COLORS[mode]) } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      return { mode, geo: g, mat: m };
    });
    return { arcs, lines, geos: buildVehicles() };
  }, []);

  const vMat = useMemo(() => new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), []);
  const refs = {
    ship: useRef<THREE.InstancedMesh>(null),
    plane: useRef<THREE.InstancedMesh>(null),
    truck: useRef<THREE.InstancedMesh>(null),
  };
  const counts = useMemo(() => {
    const c = { ship: 0, plane: 0, truck: 0 };
    arcs.forEach((a) => {
      if (a.mode === 'sea') c.ship += 2;
      else if (a.mode === 'air') c.plane += 2;
      else c.truck += 1;
    });
    return c;
  }, [arcs]);

  useEffect(() => () => lines.forEach((l) => (l.geo.dispose(), l.mat.dispose())), [lines]);

  const tmp = useMemo(() => ({ sc: new THREE.Vector3(), p: new THREE.Vector3(), q: new THREE.Vector3(), f: new THREE.Vector3(), u: new THREE.Vector3(), r: new THREE.Vector3(), m: new THREE.Matrix4() }), []);

  useFrame(() => {
    const t = S.time;
    const wAll: Record<Mode, number> = { air: S.weights.air, sea: S.weights.sea, road: S.weights.road };
    lines.forEach((l) => {
      l.mat.uniforms.uTime.value = t;
      l.mat.uniforms.uGain.value = S.lanes * wAll[l.mode];
    });

    const idx = { ship: 0, plane: 0, truck: 0 };
    arcs.forEach((a) => {
      const kind = a.mode === 'sea' ? 'ship' : a.mode === 'air' ? 'plane' : 'truck';
      const mesh = refs[kind].current;
      if (!mesh) return;
      const heads = a.mode === 'road' ? 1 : 2;
      for (let h = 0; h < heads; h++) {
        let u = (t * SPEED[a.mode] + a.phase + h * 0.5) % 1;
        if (u < 0) u += 1;
        const f = u * N;
        const i0 = Math.min(N - 1, Math.floor(f));
        const fr = f - i0;
        const { p, q, f: fwd, u: up, r, m, sc } = tmp;
        p.copy(a.pts[i0]).lerp(a.pts[i0 + 1], fr);
        fwd.copy(a.pts[i0 + 1]).sub(a.pts[i0]).normalize();
        up.copy(p).normalize();
        r.crossVectors(up, fwd).normalize();
        q.crossVectors(r, up).normalize();
        m.makeBasis(r, up, q); // +X right, +Y up (away from globe), +Z forward
        const vis = S.lanes * wAll[a.mode];
        const fade = Math.min(1, u * 14) * Math.min(1, (1 - u) * 14);
        const s = SIZE[a.mode] * (vis > 0.04 ? Math.min(1, vis * 1.6) : 0) * fade;
        m.scale(sc.set(s, s, s));
        m.setPosition(p);
        mesh.setMatrixAt(idx[kind]++, m);
      }
    });
    (['ship', 'plane', 'truck'] as const).forEach((k) => {
      const mesh = refs[k].current;
      if (mesh) mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group>
      {lines.map((l) => (
        <lineSegments key={l.mode} geometry={l.geo} material={l.mat} frustumCulled={false} renderOrder={2} />
      ))}
      <instancedMesh ref={refs.ship} args={[geos.ship, vMat, counts.ship]} frustumCulled={false} />
      <instancedMesh ref={refs.plane} args={[geos.plane, vMat, counts.plane]} frustumCulled={false} />
      <instancedMesh ref={refs.truck} args={[geos.truck, vMat, counts.truck]} frustumCulled={false} />
      <LivePreview />
    </group>
  );
}

/** Live Lane: the lane being quoted / tracked, drawn on the globe as it is chosen. */
const prevVert = /* glsl */ `
attribute float aT; varying float vT;
void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const prevFrag = /* glsl */ `
precision highp float;
uniform float uTime, uProg, uDone, uAlpha; uniform vec3 uColor;
varying float vT;
void main(){
  if (vT > uProg) discard;
  float lead = exp(-(uProg - vT) * 22.0);
  float done = step(vT, uDone);
  float run = exp(-mod(fract(uTime * 0.35) - vT + 1.0, 1.0) * 12.0) * done;
  float a = mix(0.4, 1.0, done) * uAlpha;
  vec3 c = uColor * (1.2 + lead * 3.0 + run * 2.2);
  gl_FragColor = vec4(c, a);
  #include <colorspace_fragment>
}`;

function LivePreview() {
  const lane = useStore((s) => s.lane);
  const prog = useRef(0);
  const { geo, mat } = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      vertexShader: prevVert,
      fragmentShader: prevFrag,
      uniforms: { uTime: { value: 0 }, uProg: { value: 0 }, uDone: { value: 1 }, uAlpha: { value: 0 }, uColor: { value: new THREE.Color('#FF7A1A') } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo: new THREE.BufferGeometry(), mat };
  }, []);

  const key = lane ? `${lane.from}-${lane.to}` : '';
  useEffect(() => {
    prog.current = 0;
    if (!lane) return;
    const a = hubById(lane.from);
    const b = hubById(lane.to);
    if (!a || !b) return;
    const pts = arcPoints(a, b, 0.24, 110);
    const pos: number[] = [];
    const tt: number[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      pos.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
      tt.push(i / 110, (i + 1) / 110);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aT', new THREE.Float32BufferAttribute(tt, 1));
    geo.computeBoundingSphere();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useFrame((_s, dt) => {
    const on = !!lane;
    prog.current = on ? Math.min(1.01, prog.current + dt * 0.75) : prog.current;
    const u = mat.uniforms;
    const ease = 1 - Math.pow(1 - Math.min(1, prog.current), 3);
    u.uProg.value = ease;
    u.uTime.value = S.time;
    u.uDone.value = lane?.progress ?? 1;
    u.uAlpha.value += ((on ? 1 : 0) - u.uAlpha.value) * (1 - Math.exp(-dt * 6));
  });

  return <lineSegments geometry={geo} material={mat} frustumCulled={false} renderOrder={3}  />;
}
