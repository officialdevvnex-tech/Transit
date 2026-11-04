'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvGroup, Label3D, hdr, C } from '../kit';
import { S } from '../state';
import { rand } from '@/lib/utils';

const RINGS = 11;
const GAP = 14;
const R = 7;
const YEARS: [string, string][] = [['2011', 'Two desks, one truck'], ['2014', 'The first guaranteed date'], ['2018', 'Own the border'], ['2021', 'One event schema'], ['2024', '1,900 electric tractors'], ['2026', '140 countries']];

/** A tunnel of time: rings you fly through, a year hung on each, light streaks rushing past. */
export function TunnelScene() {
  const panels = useRef<THREE.InstancedMesh>(null);
  const streaks = useRef<THREE.InstancedMesh>(null);
  const PANELS = 26;
  const NS = 90;

  const { panelM, streakData } = useMemo(() => {
    const panelM: THREE.Matrix4[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (let r = 0; r < RINGS; r++)
      for (let i = 0; i < PANELS; i++) {
        const a = (i / PANELS) * Math.PI * 2 + (r % 2) * 0.12;
        m.compose(new THREE.Vector3(Math.cos(a) * (R + 0.2), Math.sin(a) * (R + 0.2), -r * GAP), q.setFromEuler(new THREE.Euler(0, 0, a + Math.PI / 2)), new THREE.Vector3(1.4, 0.07, 0.9));
        panelM.push(m.clone());
      }
    const streakData = Array.from({ length: NS }, (_, i) => ({ a: rand(i) * Math.PI * 2, r: 2.4 + rand(i + 50) * (R - 2.8), z: -rand(i + 99) * RINGS * GAP, s: 14 + rand(i + 7) * 30, c: rand(i + 3) > 0.7 ? 1 : 0 }));
    return { panelM, streakData };
  }, []);

  useMemo(() => void 0, []);

  const ringMat = useMemo(() => [hdr(C.signal, 2.2), hdr(C.cyan, 2.0)], []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);

  useFrame((s, dt) => {
    if (!S.vis.tunnel) return;
    const pm = panels.current;
    if (pm && !pm.userData.init) {
      panelM.forEach((m, i) => pm.setMatrixAt(i, m));
      pm.instanceMatrix.needsUpdate = true;
      pm.userData.init = true;
    }
    const sm = streaks.current;
    if (sm) {
      streakData.forEach((d, i) => {
        d.z += d.s * Math.min(dt, 0.05) * (1 + S.warp * 3);
        if (d.z > 20) d.z -= RINGS * GAP + 40;
        dummy.position.set(Math.cos(d.a) * d.r, Math.sin(d.a) * d.r, d.z);
        dummy.scale.set(1, 1, 1 + d.s * 0.12);
        dummy.updateMatrix();
        sm.setMatrixAt(i, dummy.matrix);
        sm.setColorAt(i, col.copy(d.c ? ringMat[1] : ringMat[0]));
      });
      sm.instanceMatrix.needsUpdate = true;
      if (sm.instanceColor) sm.instanceColor.needsUpdate = true;
    }
    void s;
  });

  return (
    <EnvGroup env="tunnel">
      {Array.from({ length: RINGS }, (_, r) => (
        <group key={r} position={[0, 0, -r * GAP]}>
          <mesh><torusGeometry args={[R, 0.06, 8, 96]} /><meshBasicMaterial color={ringMat[r % 2]} toneMapped={false} /></mesh>
          <mesh scale={1.04}><torusGeometry args={[R, 0.01, 4, 96]} /><meshBasicMaterial color={hdr(C.text, 0.8)} toneMapped={false} /></mesh>
        </group>
      ))}
      <instancedMesh ref={panels} args={[undefined, undefined, RINGS * PANELS]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0f1620" metalness={0.7} roughness={0.35} emissive="#16324a" emissiveIntensity={0.7} />
      </instancedMesh>
      <instancedMesh ref={streaks} args={[undefined, undefined, NS]} frustumCulled={false}>
        <boxGeometry args={[0.035, 0.035, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {YEARS.map(([y, t], i) => {
        const z = -(i + 1) * GAP;
        const x = i % 2 ? 2.6 : -2.6;
        return (
          <group key={y}>
            <Label3D position={[x, 0.6, z]} size={3.4} anchorX={i % 2 ? 'left' : 'right'}>{y}</Label3D>
            <Label3D position={[x, -1.7, z]} size={0.62} italic color={C.signal} anchorX={i % 2 ? 'left' : 'right'}>{t}</Label3D>
          </group>
        );
      })}
      <mesh position={[0, 0, -RINGS * GAP - 6]}><sphereGeometry args={[3.2, 32, 32]} /><meshBasicMaterial color={hdr(C.signal, 2.6)} toneMapped={false} /></mesh>
    </EnvGroup>
  );
}
