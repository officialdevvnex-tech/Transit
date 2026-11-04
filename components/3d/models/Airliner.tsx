'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { box, merge, paint } from './geom';
import { S } from '../state';

const L = 7.4; // ~37 m at 5 m / unit

/** Smooth lathe of the fuselage: nose radome → barrel → tapered tail cone. +X forward. */
function fuselage() {
  const prof: [number, number][] = [
    [0.5, 0.0], [0.495, 0.07], [0.47, 0.13], [0.42, 0.19], [0.34, 0.235], [0.22, 0.26], [0.0, 0.27], [-0.2, 0.27], [-0.32, 0.26], [-0.42, 0.205], [-0.5, 0.13], [-0.54, 0.075], [-0.56, 0.04],
  ];
  const curve = new THREE.CatmullRomCurve3(prof.map(([x, r]) => new THREE.Vector3(r * L * 0.2, x * L, 0)));
  const pts = curve.getPoints(72).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
  const g = new THREE.LatheGeometry(pts, 40);
  g.rotateZ(-Math.PI / 2); // lathe axis Y → X, nose toward +X
  g.scale(1, 1, 1);
  const pos = g.attributes.position;
  const col: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const x = pos.getX(i);
    // livery: white crown, grey belly, cyan cheat-line, orange tail cone
    let c: [number, number, number] = [0.9, 0.92, 0.94];
    if (y < -0.16) c = [0.55, 0.58, 0.62];
    if (y < -0.03 && y > -0.12) c = [0.2, 0.62, 0.9];
    if (x > L * 0.4) c = [0.12, 0.14, 0.18];
    if (x < -L * 0.4) c = [0.95, 0.42, 0.08];
    col.push(...c);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return g;
}

/** Tapered, swept, thin extruded wing (right side). */
function wing(span: number, rootChord: number, tipChord: number, sweep: number, thick: number) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(span, sweep);
  s.lineTo(span, sweep - tipChord);
  s.lineTo(0, -rootChord);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: thick, bevelEnabled: true, bevelThickness: thick * 0.4, bevelSize: thick * 0.4, bevelSegments: 2, curveSegments: 1 });
  g.rotateX(Math.PI / 2); // shape XY → XZ plane (x = span, z = chord)
  // shape x→ span along z ; remap: span → +Z, chord → -X (forward is +X)
  g.rotateY(Math.PI / 2);
  return g;
}

function nacelle() {
  const prof = [new THREE.Vector2(0.0, 0.0), new THREE.Vector2(0.17, 0.0), new THREE.Vector2(0.2, 0.05), new THREE.Vector2(0.19, 0.5), new THREE.Vector2(0.15, 0.75), new THREE.Vector2(0.07, 0.8), new THREE.Vector2(0.0, 0.78)];
  const g = new THREE.LatheGeometry(prof, 28);
  g.rotateZ(-Math.PI / 2);
  g.translate(0.2 - 0.2, 0, 0);
  return paint(g, [0.7, 0.72, 0.75]);
}

/**
 * Narrow-body airliner: lathe fuselage, swept tapered wings with winglets, under-wing engines with
 * fan faces, tail fin + stabilisers, cabin windows, nav/strobe lights. Clear-coated PBR paint.
 */
export function Airliner({ scale = 1 }: { scale?: number }) {
  const lights = useRef<(THREE.Mesh | null)[]>([]);
  const { body, windows } = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    const fus = fuselage();
    parts.push(fus);
    // wings (both sides)
    const w = paint(wing(3.3, 1.5, 0.45, -1.2, 0.07), [0.82, 0.84, 0.87]);
    w.translate(0.5, -0.2, 0);
    const wl = w.clone();
    wl.scale(1, 1, -1);
    parts.push(w, wl);
    // winglets
    for (const s of [1, -1]) {
      const wlg = paint(new THREE.BoxGeometry(0.28, 0.45, 0.025), [0.2, 0.62, 0.9]);
      wlg.rotateX(s * 0.18);
      wlg.translate(-0.45 - 0.5, 0.2, s * 3.4);
      parts.push(wlg);
    }
    // tail fin
    const fin = new THREE.Shape();
    fin.moveTo(0, 0);
    fin.lineTo(-1.0, 1.35);
    fin.lineTo(-1.55, 1.35);
    fin.lineTo(-1.5, 0);
    fin.closePath();
    const fg = paint(new THREE.ExtrudeGeometry(fin, { depth: 0.07, bevelEnabled: false }), [0.95, 0.42, 0.08]);
    fg.translate(-L * 0.36, 0.3, -0.035);
    parts.push(fg);
    // horizontal stabilisers
    const st = paint(wing(1.3, 0.8, 0.3, -0.5, 0.05), [0.82, 0.84, 0.87]);
    st.translate(-L * 0.4, 0.15, 0);
    const stl = st.clone();
    stl.scale(1, 1, -1);
    parts.push(st, stl);
    // engines + pylons
    for (const s of [1, -1]) {
      const n = nacelle();
      n.scale(0.95, 0.95, 0.95);
      n.translate(-0.15, -0.5, s * 1.15);
      parts.push(n);
      const py = paint(new THREE.BoxGeometry(0.9, 0.28, 0.07), [0.8, 0.82, 0.85]);
      py.translate(0.05, -0.34, s * 1.15);
      parts.push(py);
      const fan = paint(new THREE.CircleGeometry(0.17, 28), [0.03, 0.035, 0.045]);
      fan.rotateY(Math.PI / 2);
      fan.translate(0.62, -0.5, s * 1.15);
      parts.push(fan);
    }
    // windows: two tiny rows
    const win: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 44; i++) {
      const x = L * 0.34 - i * 0.115;
      for (const s of [1, -1]) win.push(box(0.04, 0.05, 0.006, x, 0.06, s * 0.395, [2.8, 2.2, 1.3]));
    }
    win.push(box(0.14, 0.07, 0.34, L * 0.405, 0.1, 0, [0.02, 0.03, 0.05]));
    return { body: merge(parts), windows: merge(win) };
  }, []);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const strobe = Math.pow(Math.max(0, Math.sin(t * 7)), 8);
    const m = lights.current[2];
    if (m) (m.material as THREE.MeshBasicMaterial).color.setRGB(6 * strobe, 6 * strobe, 6 * strobe);
  });
  void S;

  return (
    <group scale={scale}>
      <mesh geometry={body} castShadow receiveShadow>
        <meshPhysicalMaterial vertexColors roughness={0.28} metalness={0.55} clearcoat={1} clearcoatRoughness={0.18} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={windows}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      <mesh ref={(el) => { lights.current[0] = el; }} position={[-1.05, -0.07, 3.46]}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color={[0.1, 3, 0.4]} toneMapped={false} /></mesh>
      <mesh ref={(el) => { lights.current[1] = el; }} position={[-1.05, -0.07, -3.46]}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color={[4, 0.1, 0.1]} toneMapped={false} /></mesh>
      <mesh ref={(el) => { lights.current[2] = el; }} position={[-L * 0.5, 0.15, 0]}><sphereGeometry args={[0.06, 8, 8]} /><meshBasicMaterial color={[0, 0, 0]} toneMapped={false} /></mesh>
    </group>
  );
}
