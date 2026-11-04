'use client';

import { Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Glb, ModelSlot } from './glb';
import { box, merge, paint } from './geom';
import { S } from '../state';

/* ---------------------------------------------------------------- Life sciences: glass vials in a cold box */

function labelTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f4f6f8';
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#FF7A1A';
  g.fillRect(0, 0, 512, 46);
  g.fillStyle = '#10161e';
  g.font = '600 42px sans-serif';
  g.fillText('TransitArc', 24, 100);
  g.font = '500 26px sans-serif';
  g.fillText('COLD CHAIN  ·  2–8 °C', 24, 144);
  g.fillStyle = '#5b6672';
  g.font = '22px sans-serif';
  g.fillText('LOT 24-1187  EXP 06/2027', 24, 186);
  for (let i = 0; i < 28; i++) {
    g.fillStyle = '#10161e';
    g.fillRect(24 + i * 9, 205, 2 + (i % 3), 34);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function Vial({ position, scale = 1, liquid = 0.62 }: { position: [number, number, number]; scale?: number; liquid?: number }) {
  const { glass, fluid, label } = useMemo(() => {
    const prof = [[0, 0], [0.34, 0], [0.4, 0.04], [0.42, 0.12], [0.42, 1.1], [0.4, 1.2], [0.28, 1.34], [0.21, 1.42], [0.2, 1.55], [0.25, 1.58], [0.25, 1.64], [0, 1.64]].map(([r, y]) => new THREE.Vector2(r, y));
    const glass = new THREE.LatheGeometry(prof, 48);
    const fluidProf = [[0, 0.06], [0.33, 0.06], [0.37, 0.12], [0.37, 0.12 + liquid * 1.0], [0, 0.12 + liquid * 1.0]].map(([r, y]) => new THREE.Vector2(r, y));
    const fluid = new THREE.LatheGeometry(fluidProf, 40);
    const label = new THREE.CylinderGeometry(0.425, 0.425, 0.62, 48, 1, true, -Math.PI * 0.4, Math.PI * 1.2);
    return { glass, fluid, label };
  }, [liquid]);
  const tex = useMemo(() => labelTexture(), []);
  return (
    <group position={position} scale={scale}>
      <mesh geometry={glass} castShadow>
        <meshPhysicalMaterial color="#e8f6ff" transmission={1} thickness={0.35} ior={1.5} roughness={0.04} metalness={0} attenuationColor="#bfe6ff" attenuationDistance={2} envMapIntensity={1.6} transparent />
      </mesh>
      <mesh geometry={fluid}>
        <meshPhysicalMaterial color="#cfeaff" transmission={0.6} thickness={0.5} roughness={0.12} ior={1.33} emissive="#38bdf8" emissiveIntensity={0.18} transparent opacity={0.9} />
      </mesh>
      <mesh geometry={label} position={[0, 0.62, 0]}><meshStandardMaterial map={tex} roughness={0.7} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 1.46, 0]} castShadow><cylinderGeometry args={[0.19, 0.19, 0.22, 24]} /><meshStandardMaterial color="#1c1f22" roughness={0.8} /></mesh>
      <mesh position={[0, 1.58, 0]} castShadow><cylinderGeometry args={[0.27, 0.27, 0.12, 36]} /><meshStandardMaterial color="#c9cdd2" metalness={1} roughness={0.25} /></mesh>
      <mesh position={[0, 1.65, 0]}><cylinderGeometry args={[0.2, 0.2, 0.03, 36]} /><meshStandardMaterial color="#ff7a1a" metalness={0.6} roughness={0.3} /></mesh>
    </group>
  );
}

export function VialCase() {
  const brick = useMemo(() => paint(new RoundedBoxGeometry(2.4, 0.22, 1.5, 4, 0.05), '#e8eef3'), []);
  return (
    <group>
      <mesh geometry={brick} position={[0, 0.11, 0]} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={0.55} /></mesh>
      <mesh position={[0, 0.236, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[2.2, 1.3]} /><meshPhysicalMaterial color="#9fd8f5" roughness={0.2} clearcoat={1} transparent opacity={0.55} /></mesh>
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => <Vial key={i} position={[x, 0.22, (i % 2) * 0.28 - 0.14]} scale={0.6 + (i % 3) * 0.04} liquid={0.45 + (i % 4) * 0.12} />)}
    </group>
  );
}

/* ---------------------------------------------------------------- Retail: a shrink-wrapped pallet of cartons */

export function PalletLoad() {
  const pallet = useMemo(() => {
    const p: THREE.BufferGeometry[] = [];
    const wood: [number, number, number] = [0.46, 0.33, 0.2];
    for (let i = 0; i < 3; i++) p.push(box(1.6, 0.075, 0.1, 0, 0.04, -0.5 + i * 0.5, [wood[0] * 0.8, wood[1] * 0.8, wood[2] * 0.8]));
    for (let i = 0; i < 3; i++) p.push(box(0.13, 0.12, 1.2, -0.7 + i * 0.7, 0.14, 0, wood));
    for (let i = 0; i < 7; i++) p.push(box(0.2, 0.025, 1.2, -0.7 + i * 0.233, 0.215, 0, [wood[0] * 1.1, wood[1] * 1.1, wood[2] * 1.1]));
    return merge(p);
  }, []);
  return (
    <group>
      <mesh geometry={pallet} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={0.9} /></mesh>
      <Suspense fallback={null}>
        {[0, 1, 2].flatMap((l) =>
          [[-0.38, -0.28], [0.38, -0.28], [-0.38, 0.28], [0.38, 0.28]].map(([x, z], i) => (
            <Glb key={`${l}${i}`} src="/models/cardboard_box_01/cardboard_box_01.gltf" fit={0.68} position={[x + (i % 2) * 0.02, 0.23 + l * 0.52, z]} rotation={[0, ((l + i) % 2) * Math.PI * 0.5 + (l % 2 ? 0.05 : 0), 0]} ground />
          )),
        )}
      </Suspense>
      <mesh position={[0, 0.23 + 0.78, 0]} castShadow={false}>
        <boxGeometry args={[1.72, 1.6, 1.28]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} roughness={0.08} clearcoat={1} clearcoatRoughness={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {[0.5, 1.0, 1.5].map((y) => <mesh key={y} position={[0, 0.23 + y, 0]}><boxGeometry args={[1.725, 0.025, 1.285]} /><meshStandardMaterial color="#1c2630" roughness={0.6} /></mesh>)}
    </group>
  );
}

/* ---------------------------------------------------------------- Energy: a wind turbine with twisted blades */

function bladeGeometry() {
  const secs = 18;
  const pts: number[] = [];
  const idx: number[] = [];
  const ring = 12;
  for (let i = 0; i <= secs; i++) {
    const t = i / secs;
    const r = 0.12 + t * 1.75;
    const chord = (t < 0.12 ? 0.1 + t * 2.2 : 0.37 * (1 - (t - 0.12) * 0.82)) * 0.85;
    const twist = (1 - t) * 0.5;
    const thick = chord * (t < 0.1 ? 0.5 : 0.17);
    for (let j = 0; j < ring; j++) {
      const a = (j / ring) * Math.PI * 2;
      let x = Math.cos(a) * chord * 0.5;
      let z = Math.sin(a) * thick * (a > Math.PI ? 0.7 : 1);
      // rotate by twist
      const xr = x * Math.cos(twist) - z * Math.sin(twist);
      const zr = x * Math.sin(twist) + z * Math.cos(twist);
      x = xr;
      z = zr;
      pts.push(x - chord * 0.1, r, z);
    }
  }
  for (let i = 0; i < secs; i++)
    for (let j = 0; j < ring; j++) {
      const a = i * ring + j;
      const b = i * ring + ((j + 1) % ring);
      const c = (i + 1) * ring + j;
      const d = (i + 1) * ring + ((j + 1) % ring);
      idx.push(a, c, b, b, c, d);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function WindTurbine() {
  const rotor = useRef<THREE.Group>(null);
  const blade = useMemo(() => bladeGeometry(), []);
  const tower = useMemo(() => new THREE.LatheGeometry([[0.165, 0], [0.15, 1.2], [0.125, 2.4], [0.1, 3.4]].map(([r, y]) => new THREE.Vector2(r, y)), 36), []);
  useFrame((_s, dt) => {
    if (rotor.current && S.vis.gallery) rotor.current.rotation.z -= dt * 0.9;
  });
  const white = <meshPhysicalMaterial color="#eef1f4" roughness={0.35} metalness={0.1} clearcoat={0.5} />;
  return (
    <group scale={0.64}>
      <mesh geometry={tower} castShadow receiveShadow>{white}</mesh>
      <group position={[0, 3.45, 0]}>
        <mesh position={[-0.12, 0, 0]} castShadow><boxGeometry args={[0.7, 0.3, 0.26]} />{white}</mesh>
        <mesh position={[-0.12, 0.17, 0]}><boxGeometry args={[0.5, 0.03, 0.2]} /><meshStandardMaterial color="#c9cdd2" metalness={0.8} roughness={0.4} /></mesh>
        <group ref={rotor} position={[0.3, 0, 0]} rotation-y={Math.PI / 2}>
          <mesh rotation-x={Math.PI / 2} castShadow><coneGeometry args={[0.13, 0.32, 28]} />{white}</mesh>
          {[0, 1, 2].map((i) => (
            <group key={i} rotation-z={(i * Math.PI * 2) / 3}>
              <mesh geometry={blade} position={[0, 0.1, 0.04]} castShadow>{white}</mesh>
            </group>
          ))}
        </group>
      </group>
      <mesh position={[0, 3.62, 0]}><sphereGeometry args={[0.02, 8, 8]} /><meshBasicMaterial color={[4, 0.1, 0.1]} toneMapped={false} /></mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- Technology: a real PCB */

export function Board() {
  return (
    <Suspense fallback={null}>
      <group rotation={[-0.3, 0.3, 0]} position={[0, 1.1, 0]}>
        <Glb src="/models/circuit_board/circuit_board.gltf" fit={2.3} ground={false} />
      </group>
    </Suspense>
  );
}

/* ---------------------------------------------------------------- Food: a crate of fruit */

export function FruitCrate() {
  const [top, setTop] = useState(0.9);
  const onLoad = useCallback((root: THREE.Object3D) => {
    const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
    if (size.y > 0.1) setTop(size.y);
  }, []);
  const spots: [number, number, number, number][] = [[-0.45, 0.02, 0.15, 0.3], [0.0, 0.03, -0.2, 0.3], [0.42, 0.02, 0.2, 0.29], [-0.15, 0.2, 0.18, 0.3], [0.25, 0.2, -0.1, 0.3]];
  return (
    <Suspense fallback={null}>
      <group>
        <Glb src="/models/wooden_crate_01/wooden_crate_01.gltf" fit={1.7} onLoad={onLoad} />
        {spots.map(([x, y, z, f], i) => (
          <Glb key={i} src="/models/food_apple_01/food_apple_01.gltf" fit={f} position={[x, top + y, z]} rotation={[0, i * 1.3, 0]} />
        ))}
        <Glb src="/models/bananas/bananas.gltf" fit={0.8} position={[0.1, top + 0.32, 0.0]} rotation={[0, 0.6, 0]} />
      </group>
    </Suspense>
  );
}

/* ---------------------------------------------------------------- Automotive: real glTF car */

export function Car() {
  return (
    <Suspense fallback={null}>
      <ModelSlot src="/models/car.glb" fit={3.3} fallback={<Glb src="/models/ferrari.glb" fit={3.3} rotation={[0, Math.PI / 2, 0]} />} />
    </Suspense>
  );
}
