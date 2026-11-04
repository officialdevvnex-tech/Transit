'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { CT } from './containerKit';
import { Container } from './Container';
import { box, cyl, merge, paint } from './geom';

function wheel() {
  const tyre = new THREE.LatheGeometry(
    [[0.0, -0.045], [0.085, -0.045], [0.105, -0.036], [0.112, -0.02], [0.112, 0.02], [0.105, 0.036], [0.085, 0.045], [0.0, 0.045]].map(([r, y]) => new THREE.Vector2(r, y)).map((v) => new THREE.Vector2(v.x, v.y)),
    28,
  );
  // lathe around Y → wheel axis Z
  tyre.rotateX(Math.PI / 2);
  return tyre;
}

/**
 * Cab-over tractor + container chassis carrying a 40 ft box. Rounded bodywork, glazing, grille,
 * headlamps, fuel tanks, stacks, tandem axles with proper tyres and chrome hubs. +X forward.
 */
export function Truck({ container = true, tint = '#1f5c8b' }: { container?: boolean; tint?: string }) {
  const { cab, chrome, tyre, glass, chassis } = useMemo(() => {
    const orange: [number, number, number] = [0.9, 0.34, 0.05];
    const parts: THREE.BufferGeometry[] = [];
    // cab
    const shell = paint(new RoundedBoxGeometry(0.62, 0.62, 0.5, 5, 0.06), orange);
    shell.translate(0.0, 0.2 + 0.31, 0);
    parts.push(shell);
    const roof = paint(new RoundedBoxGeometry(0.5, 0.1, 0.46, 3, 0.04), orange); // sleeper step / deflector
    roof.translate(-0.18, 0.88, 0);
    parts.push(roof);
    parts.push(paint(new RoundedBoxGeometry(0.1, 0.2, 0.5, 3, 0.03), [0.12, 0.13, 0.15]).translate(0.36, 0.28, 0)); // bumper
    parts.push(box(0.5, 0.05, 0.5, 0.0, 0.2, 0, [0.08, 0.08, 0.09])); // sill
    parts.push(...[1, -1].map((s) => paint(new RoundedBoxGeometry(0.4, 0.17, 0.12, 3, 0.04), [0.1, 0.11, 0.13]).translate(-0.08, 0.2, s * 0.22))); // fuel tanks
    parts.push(...[1, -1].map((s) => cyl(0.012, 0.012, 0.9, -0.24, 0.62, s * 0.27, [0.8, 0.8, 0.82], 8))); // stacks
    parts.push(box(0.9, 0.04, 0.34, -0.45, 0.2, 0, [0.07, 0.07, 0.08])); // chassis rail
    // mirrors
    parts.push(...[1, -1].map((s) => box(0.025, 0.14, 0.05, 0.25, 0.58, s * 0.3, [0.05, 0.05, 0.06])));
    const cabG = merge(parts);

    const ch: THREE.BufferGeometry[] = [];
    // chrome grille bars + hubs
    for (let i = 0; i < 6; i++) ch.push(box(0.01, 0.018, 0.34, 0.315, 0.28 + i * 0.045, 0, [0.9, 0.92, 0.95]));
    for (const s of [1, -1]) {
      ch.push(box(0.01, 0.07, 0.11, 0.316, 0.5, s * 0.17, [4, 3.6, 2.6])); // headlamps (HDR)
      ch.push(box(0.012, 0.03, 0.06, 0.316, 0.34, s * 0.2, [3, 2.8, 2.0]));
    }
    const chromeG = merge(ch);

    const gl: THREE.BufferGeometry[] = [];
    gl.push(paint(new RoundedBoxGeometry(0.02, 0.26, 0.46, 3, 0.01), [0.02, 0.03, 0.04]).translate(0.31, 0.62, 0)); // windscreen
    for (const s of [1, -1]) gl.push(paint(new RoundedBoxGeometry(0.2, 0.2, 0.02, 3, 0.01), [0.02, 0.03, 0.04]).translate(0.12, 0.6, s * 0.252));
    const glassG = merge(gl);

    const t = wheel();
    const chs: THREE.BufferGeometry[] = [];
    chs.push(box(2.55, 0.05, 0.46, -1.5, 0.28, 0, [0.07, 0.08, 0.09]));
    chs.push(box(2.55, 0.03, 0.12, -1.5, 0.22, 0.2, [0.07, 0.08, 0.09]), box(2.55, 0.03, 0.12, -1.5, 0.22, -0.2, [0.07, 0.08, 0.09]));
    for (let i = 0; i < 4; i++) for (const s of [1, -1]) chs.push(box(0.1, 0.035, 0.05, -0.5 - i * 0.62 - 0.1, 0.325, s * 0.225, [0.6, 0.6, 0.62])); // twist-locks
    chs.push(cyl(0.05, 0.05, 0.06, -0.38, 0.33, 0, [0.5, 0.5, 0.52], 14)); // fifth wheel
    chs.push(box(0.05, 0.16, 0.05, -0.92, 0.2, 0.18, [0.07, 0.08, 0.09]), box(0.05, 0.16, 0.05, -0.92, 0.2, -0.18, [0.07, 0.08, 0.09])); // landing gear
    for (const x of [-2.15, -2.4, -2.65]) for (const s of [1, -1]) chs.push(box(0.03, 0.03, 0.1, x, 0.21, s * 0.25, [0.05, 0.05, 0.06])); // axle stubs
    chs.push(box(0.012, 0.08, 0.42, -2.78, 0.31, 0, [0.9, 0.9, 0.92])); // under-run bar
    for (const s of [1, -1]) chs.push(box(0.012, 0.045, 0.06, -2.79, 0.34, s * 0.2, [4, 0.12, 0.08])); // tail lamps
    return { cab: cabG, chrome: chromeG, tyre: t, glass: glassG, chassis: merge(chs) };
  }, []);

  const wheels: [number, number][] = [[0.22, 0.24], [-0.1, 0.24], [-0.32, 0.24], [-2.15, 0.25], [-2.4, 0.25], [-2.65, 0.25]];
  return (
    <group>
      <mesh geometry={cab} castShadow receiveShadow>
        <meshPhysicalMaterial vertexColors roughness={0.32} metalness={0.5} clearcoat={0.9} clearcoatRoughness={0.25} />
      </mesh>
      <mesh geometry={glass}>
        <meshPhysicalMaterial vertexColors roughness={0.05} metalness={0.9} envMapIntensity={2.2} clearcoat={1} />
      </mesh>
      <mesh geometry={chrome}>
        <meshStandardMaterial vertexColors roughness={0.15} metalness={1} toneMapped={false} />
      </mesh>
      <mesh geometry={chassis} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.6} metalness={0.6} />
      </mesh>
      {wheels.map(([x, z], i) =>
        [1, -1].map((s) => (
          <group key={`${i}${s}`} position={[x, 0.112, s * z]}>
            <mesh geometry={tyre} castShadow>
              <meshStandardMaterial color="#0b0c0e" roughness={0.9} metalness={0.05} />
            </mesh>
            <mesh rotation-x={Math.PI / 2} position={[0, 0, s * 0.047]}>
              <cylinderGeometry args={[0.06, 0.06, 0.012, 20]} />
              <meshStandardMaterial color="#c9cdd2" roughness={0.2} metalness={1} />
            </mesh>
          </group>
        )),
      )}
      {container && <Container tint={tint} position={[-1.5, 0.3 + CT.H / 2 + 0.01, 0]} />}
    </group>
  );
}
