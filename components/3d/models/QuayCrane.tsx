'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CT } from './containerKit';
import { Container } from './Container';
import { beam, box, cyl, lattice, merge } from './geom';
import { S } from '../state';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const GREY: [number, number, number] = [0.62, 0.65, 0.7];
const BLUE = '#1f5c8b';
const RED = '#a8221a';
const DARK: [number, number, number] = [0.07, 0.08, 0.1];

/**
 * Ship-to-shore gantry: four lattice legs on rails, portal beams, a latticed boom out over the ship,
 * machinery house, trolley, spreader on four cables with a container, hazard striping and aircraft-warning lights.
 * z+ is the water side.
 */
export function QuayCrane() {
  const trolley = useRef<THREE.Group>(null);
  const spreader = useRef<THREE.Group>(null);
  const lights = useRef<(THREE.Mesh | null)[]>([]);

  const { frame, cabin, rails } = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    const gx = 2.6; // half spacing between leg pairs along the quay
    const zs = [0.5, -5.4]; // waterside / landside
    const H = 5.2; // portal clearance
    const T = 12.6; // top of structure
    // legs: four lattice towers, slightly tapered
    for (const sx of [-gx, gx])
      for (const sz of zs) {
        const a = V(sx, 0.2, sz);
        const b = V(sx, T, sz + (sz > 0 ? -0.2 : 0.2));
        parts.push(...lattice(a, b, V(0.0, 0, 0.5), 14, 0.07, GREY), ...lattice(a.clone().add(V(0.5, 0, 0)), b.clone().add(V(0.5, 0, 0)), V(0, 0, 0.5), 14, 0.07, GREY));
        parts.push(beam(a, a.clone().add(V(0.5, 0, 0)), 0.1, 0.1, GREY));
      }
    // portal beams (sea & land side) and sill beams
    for (const sz of zs) parts.push(...lattice(V(-gx, H, sz), V(gx + 0.5, H, sz), V(0, 0.55, 0.45), 8, 0.07, GREY));
    for (const sx of [-gx, gx]) parts.push(...lattice(V(sx, H, zs[0]), V(sx, H, zs[1]), V(0.5, 0.55, 0), 8, 0.07, GREY));
    // top frame
    for (const sx of [-gx, gx + 0.5]) parts.push(beam(V(sx, T, zs[0]), V(sx, T, zs[1]), 0.12, 0.12, BLUE));
    parts.push(beam(V(-gx, T, zs[0]), V(gx + 0.5, T, zs[0]), 0.12, 0.12, BLUE), beam(V(-gx, T, zs[1]), V(gx + 0.5, T, zs[1]), 0.12, 0.12, BLUE));
    // boom (outreach over ship) + backreach, two parallel latticed girders
    for (const sx of [-0.55 + 0.25, 0.55 + 0.25]) {
      parts.push(...lattice(V(sx, T, 7.4), V(sx, T, zs[1] - 3.2), V(0, 0.8, 0), 22, 0.06, BLUE));
    }
    parts.push(beam(V(0.05, T + 0.8, 7.4), V(0.8, T + 0.8, 7.4), 0.08, 0.08, GREY));
    // stays from the apex to the boom tip
    const apex = V(0.25, T + 3.6, -1.6);
    parts.push(beam(apex, V(0.25, T + 0.8, 7.4), 0.05, 0.05, DARK), beam(apex, V(0.25, T + 0.8, -6.6), 0.05, 0.05, DARK));
    parts.push(...lattice(V(0.25, T, -1.6 - 0.4), apex.clone(), V(0.0, 0, 0.8), 5, 0.06, GREY));
    // hazard stripes on leg bases
    for (const sx of [-gx, gx])
      for (const sz of zs) for (let k = 0; k < 6; k++) parts.push(box(0.58, 0.14, 0.58, sx + 0.25, 0.3 + k * 0.28, sz, k % 2 ? [0.9, 0.7, 0.05] : [0.04, 0.04, 0.04]));
    // wheel bogies
    for (const sx of [-gx, gx + 0.5]) for (const sz of zs) parts.push(box(0.55, 0.2, 0.9, sx, 0.1, sz, DARK));
    const frame = merge(parts);

    const cab: THREE.BufferGeometry[] = [];
    cab.push(box(1.7, 0.95, 2.4, 0.3, T + 0.55, -2.6, BLUE)); // machinery house
    cab.push(box(0.9, 0.6, 0.9, 0.3, T + 0.2, -0.9, GREY));
    cab.push(box(1.6, 0.04, 2.3, 0.3, T + 1.05, -2.6, DARK));
    cab.push(cyl(0.12, 0.12, 0.5, -0.2, T + 1.3, -3.4, DARK, 12));
    cab.push(box(0.9, 0.5, 0.012, 0.3, T + 0.65, -1.38, [2.6, 2.1, 1.1])); // lit window band
    const cabin = merge(cab);

    const r: THREE.BufferGeometry[] = [];
    r.push(box(0.06, 0.05, 80, -gx, 0.02, -2.5, DARK), box(0.06, 0.05, 80, gx + 0.5, 0.02, -2.5, DARK));
    return { frame, cabin, rails: merge(r) };
  }, []);
  void rails;

  useFrame((s) => {
    if (!S.vis.port) return;
    const t = s.clock.elapsedTime;
    const z = 3.2 + Math.sin(t * 0.32) * 3.4;
    if (trolley.current) trolley.current.position.z = z;
    if (spreader.current) spreader.current.position.y = -3.6 - (0.5 + 0.5 * Math.sin(t * 0.32 * 2 + 1)) * 4.2;
    const blink = 0.5 + 0.5 * Math.sin(t * 3.5);
    lights.current.forEach((m) => m && (m.material as THREE.MeshBasicMaterial).color.setRGB(4 * blink, 0.15 * blink, 0.1 * blink));
  });

  const tH = 12.6;
  return (
    <group>
      <mesh geometry={frame} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.55} metalness={0.7} />
      </mesh>
      <mesh geometry={cabin} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.5} metalness={0.5} emissive={'#ffffff'} emissiveIntensity={0.0} />
      </mesh>
      <group ref={trolley} position={[0.3, tH - 0.15, 3.2]}>
        <mesh castShadow><boxGeometry args={[1.5, 0.35, 0.9]} /><meshStandardMaterial color="#26323f" metalness={0.8} roughness={0.45} /></mesh>
        <mesh position={[0, 0.3, 0]} castShadow><boxGeometry args={[0.7, 0.3, 0.6]} /><meshStandardMaterial color="#a8221a" metalness={0.5} roughness={0.5} /></mesh>
        <group ref={spreader} position={[0, -3.6, 0]}>
          {[[-0.55, -0.22], [0.55, -0.22], [-0.55, 0.22], [0.55, 0.22]].map(([x, z], i) => (
            <mesh key={i} position={[x, 1.9, z]}><cylinderGeometry args={[0.006, 0.006, 3.9, 6]} /><meshStandardMaterial color="#1a1d21" metalness={0.9} roughness={0.4} /></mesh>
          ))}
          <mesh position={[0, 0.12, 0]} castShadow><boxGeometry args={[2.3, 0.08, 0.45]} /><meshStandardMaterial color="#e8c01a" metalness={0.5} roughness={0.5} /></mesh>
          <Container tint="#e08a1e" position={[0, -CT.H / 2, 0]} />
        </group>
      </group>
      {[[0.3, tH + 4.4, -1.6], [-2.6, tH + 0.2, 0.5], [3.1, tH + 0.2, 0.5], [0.3, tH + 0.8, 7.4]].map((p, i) => (
        <mesh key={i} ref={(el) => { lights.current[i] = el; }} position={p as [number, number, number]}><sphereGeometry args={[0.1, 10, 10]} /><meshBasicMaterial color={[4, 0.15, 0.1]} toneMapped={false} /></mesh>
      ))}
    </group>
  );
}
