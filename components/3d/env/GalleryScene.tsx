'use client';

import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EnvGroup, Label3D, hdr, C } from '../kit';
import { S } from '../state';
import { INDUSTRIES } from '@/content/industries';
import { useStore } from '@/lib/store';
import { Board, Car, FruitCrate, PalletLoad, VialCase, WindTurbine } from '../models/Showpieces';

const X = (i: number) => (i - 2.5) * 6;
const MODELS = [Car, VialCase, PalletLoad, WindTurbine, Board, FruitCrate];
const LIFT = [0, 0, 0, -0.2, 0.2, 0];

function Floor() {
  const [nor, rough] = useTexture(['/textures/concrete_floor_02/nor.jpg', '/textures/concrete_floor_02/rough.jpg']);
  useMemo(() => {
    [nor, rough].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(26, 10);
      t.colorSpace = THREE.NoColorSpace;
    });
  }, [nor, rough]);
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[170, 80]} />
      <MeshReflectorMaterial blur={[260, 70]} resolution={768} mixBlur={1.1} mixStrength={18} roughness={0.7} roughnessMap={rough} normalMap={nor} normalScale={new THREE.Vector2(0.35, 0.35)} depthScale={0.6} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#0b1017" metalness={0.35} mirror={0} />
    </mesh>
  );
}

/** A showroom: six real-asset showpieces on lit plinths over a polished-concrete mirror floor. */
export function GalleryScene() {
  const spinners = useRef<(THREE.Group | null)[]>([]);
  const plinth = useMemo(() => new THREE.LatheGeometry([[0, 0], [1.9, 0], [1.9, 0.08], [1.82, 0.16], [1.78, 0.4], [0, 0.4]].map(([r, y]) => new THREE.Vector2(r, y)), 64), []);
  useFrame((s, dt) => {
    if (!S.vis.gallery) return;
    const active = useStore.getState().beat - 1;
    spinners.current.forEach((g, i) => {
      if (!g) return;
      g.rotation.y += dt * (i === active ? 0.55 : 0.12);
      g.position.y = 0.42 + LIFT[i];
    });
  });
  return (
    <EnvGroup env="gallery">
      <Suspense fallback={null}>
        <Floor />
      </Suspense>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 8.2, s * 3.2]}><boxGeometry args={[80, 0.08, 0.5]} /><meshBasicMaterial color={hdr(s > 0 ? '#ffd9a8' : '#cfe8ff', 2.4)} toneMapped={false} /></mesh>
      ))}
      <mesh position={[0, 5, -14]}><planeGeometry args={[130, 26]} /><meshStandardMaterial color="#0a0f15" roughness={0.9} metalness={0.2} /></mesh>
      {INDUSTRIES.map((ind, i) => {
        const M = MODELS[i];
        return (
          <group key={ind.slug} position={[X(i), 0, 0]}>
            <mesh geometry={plinth} castShadow receiveShadow><meshStandardMaterial color="#141b23" roughness={0.3} metalness={0.9} /></mesh>
            <mesh position={[0, 0.41, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[1.62, 1.7, 96]} /><meshBasicMaterial color={hdr(i % 2 ? C.cyan : C.signal, 2.6)} toneMapped={false} /></mesh>
            <group ref={(el) => { spinners.current[i] = el; }} position={[0, 0.42, 0]}>
              <M />
            </group>
            <Label3D position={[0, 5.0, 0]} size={0.7} anchorX="center">{ind.name}</Label3D>
            <Label3D position={[0, 4.35, 0]} size={0.34} italic color={C.signal} anchorX="center">{ind.proof.v + ' ' + ind.proof.l}</Label3D>
          </group>
        );
      })}
    </EnvGroup>
  );
}
