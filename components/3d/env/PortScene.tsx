'use client';

import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { EnvGroup, Label3D, C, hdr } from '../kit';
import { Yard } from '../Yard';
import { Ship } from '../models/Ship';
import { QuayCrane } from '../models/QuayCrane';
import { Airliner } from '../models/Airliner';
import { Truck } from '../models/Truck';
import { Glb, ModelSlot } from '../models/glb';
import { getContainerKit, CT, CONTAINER_COLORS } from '../models/containerKit';
import { box, cyl, merge } from '../models/geom';
import { S } from '../state';
import { useStore } from '@/lib/store';
import { rand } from '@/lib/utils';

const QUAY_Y = 0.6;

const waterVert = /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const waterFrag = /* glsl */ `
precision highp float;
uniform float uTime; uniform vec3 uC;
varying vec3 vW;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
void main(){
  vec2 p = vW.xz - uC.xz;
  float d = length(p) / 150.0;
  // layered ripples → fake normal
  float e = 0.08;
  float t = uTime;
  float a = n(p * 0.9 + vec2(t * 0.35, t * 0.2)) + 0.5 * n(p * 2.1 - vec2(t * 0.5, t * 0.3)) + 0.25 * n(p * 5.0 + t * 0.7);
  float ax = n((p + vec2(e,0.)) * 0.9 + vec2(t*0.35, t*0.2)) + 0.5 * n((p + vec2(e,0.)) * 2.1 - vec2(t*0.5, t*0.3)) + 0.25 * n((p + vec2(e,0.)) * 5.0 + t*0.7);
  float ay = n((p + vec2(0.,e)) * 0.9 + vec2(t*0.35, t*0.2)) + 0.5 * n((p + vec2(0.,e)) * 2.1 - vec2(t*0.5, t*0.3)) + 0.25 * n((p + vec2(0.,e)) * 5.0 + t*0.7);
  vec3 N = normalize(vec3((a - ax) * 5.0, 1.0, (a - ay) * 5.0));
  vec3 V = normalize(cameraPosition - vW);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
  vec3 deep = pow(vec3(0.012, 0.03, 0.045), vec3(2.2));
  vec3 sky = pow(vec3(0.06, 0.1, 0.17), vec3(2.2));
  vec3 col = mix(deep, sky, 0.2 + 0.8 * fres);
  // floodlight + crane-lamp glints
  vec3 R = reflect(-V, N);
  float g1 = pow(max(dot(R, normalize(vec3(0.15, 0.55, -0.8))), 0.0), 520.0);
  float g2 = pow(max(dot(R, normalize(vec3(-0.5, 0.45, -0.7))), 0.0), 380.0);
  col += pow(vec3(1.0, 0.55, 0.2), vec3(2.2)) * g1 * 1.6 + pow(vec3(0.5, 0.8, 1.0), vec3(2.2)) * g2 * 1.1;
  // quay-edge + hull contact foam
  float edge = smoothstep(0.7, 0.0, vW.z - uC.z) * step(vW.z, uC.z + 0.7) * (0.4 + 0.6 * n(p * 4.0 + t));
  col += vec3(0.5) * edge * 0.25;
  col = mix(col, pow(vec3(0.027, 0.043, 0.063), vec3(2.2)), smoothstep(0.3, 0.98, d));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

function usePbr(dir: string, repeat: [number, number]) {
  const [diff, nor, rough] = useTexture([`/textures/${dir}/diff.jpg`, `/textures/${dir}/nor.jpg`, `/textures/${dir}/rough.jpg`]);
  useMemo(() => {
    [diff, nor, rough].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(...repeat);
      t.anisotropy = 8;
    });
    diff.colorSpace = THREE.SRGBColorSpace;
    nor.colorSpace = THREE.NoColorSpace;
    rough.colorSpace = THREE.NoColorSpace;
  }, [diff, nor, rough, repeat]);
  return { map: diff, normalMap: nor, roughnessMap: rough };
}

function Ground() {
  const conc = usePbr('concrete_floor_02', [24, 6]);
  const asph = usePbr('asphalt_02', [30, 1]);
  return (
    <>
      {/* quay slab */}
      <mesh position={[0, QUAY_Y - 1.2, -14]} receiveShadow>
        <boxGeometry args={[150, 2.4, 29]} />
        <meshStandardMaterial {...conc} color="#9aa3ad" roughness={1} />
      </mesh>
      {/* road lane */}
      <mesh position={[0, QUAY_Y + 0.012, -9]} receiveShadow rotation-x={-Math.PI / 2}>
        <planeGeometry args={[150, 2.2]} />
        <meshStandardMaterial {...asph} color="#7b8088" roughness={1} />
      </mesh>
      {Array.from({ length: 40 }, (_, i) => (
        <mesh key={i} position={[-74 + i * 3.8, QUAY_Y + 0.02, -9]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[1.5, 0.06]} />
          <meshBasicMaterial color={hdr('#fff3d1', 0.7)} toneMapped={false} />
        </mesh>
      ))}
      {/* quay edge: fender line + bollards */}
      <mesh position={[0, QUAY_Y - 0.15, 0.08]}><boxGeometry args={[150, 0.3, 0.16]} /><meshStandardMaterial color="#1b2026" roughness={0.8} metalness={0.4} /></mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[-64 + i * 9.5, QUAY_Y + 0.09, -0.35]} castShadow><cylinderGeometry args={[0.07, 0.09, 0.18, 14]} /><meshStandardMaterial color="#14181c" roughness={0.5} metalness={0.8} /></mesh>
      ))}
    </>
  );
}

function Floodlights() {
  const g = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (const x of [-30, 8, 38]) {
      parts.push(cyl(0.07, 0.11, 7.5, x, QUAY_Y + 3.75, -4.5, '#59626b', 10));
      parts.push(box(1.1, 0.5, 0.12, x, QUAY_Y + 7.6, -4.5, '#1b2026'));
      for (let i = 0; i < 6; i++) parts.push(box(0.14, 0.1, 0.02, x - 0.42 + (i % 3) * 0.42, QUAY_Y + 7.5 + Math.floor(i / 3) * 0.2, -4.42, [5, 4.4, 3.4]));
    }
    return merge(parts);
  }, []);
  return <mesh geometry={g} castShadow><meshStandardMaterial vertexColors roughness={0.5} metalness={0.7} toneMapped={false} /></mesh>;
}

function ContainerField() {
  const m = useRef<THREE.InstancedMesh>(null);
  const kit = useMemo(() => getContainerKit(), []);
  const data = useMemo(() => {
    const out: { p: [number, number, number]; c: THREE.Color; r: number }[] = [];
    const blocks: [number, number, number, number][] = [[-30, -14, 4, 4], [24, -15, 5, 4], [-52, -17, 5, 3], [46, -18, 4, 4]];
    blocks.forEach(([cx, cz, cols, rows], bi) => {
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++) {
          const h = 1 + Math.floor(rand(bi * 50 + c * 7 + r * 13) * 4);
          const tint = CONTAINER_COLORS[Math.floor(rand(bi * 19 + c * 3 + r * 11) * CONTAINER_COLORS.length)];
          for (let l = 0; l < h; l++) out.push({ p: [cx + (c - cols / 2) * (CT.L + 0.12), QUAY_Y + CT.H / 2 + l * (CT.H + 0.004), cz + (r - rows / 2) * (CT.W + 0.1)], c: tint, r: rand(bi + c + r + l) > 0.5 ? 0 : Math.PI });
        }
    });
    return out;
  }, []);
  useMemo(() => void 0, []);
  const ready = useRef(false);
  useFrame(() => {
    const mesh = m.current;
    if (!mesh || ready.current) return;
    const o = new THREE.Object3D();
    data.forEach((d, i) => {
      o.position.set(...d.p);
      o.rotation.set(0, d.r, 0);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, d.c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    ready.current = true;
  });
  return <instancedMesh ref={m} args={[kit.geo, kit.mat, data.length]} castShadow receiveShadow frustumCulled={false} />;
}

function Warehouse() {
  const wall = usePbr('rusty_metal_02', [10, 1.2]);
  return (
    <group position={[-34, QUAY_Y, -22]}>
      <mesh position={[0, 1.4, 0]} castShadow receiveShadow><boxGeometry args={[26, 2.8, 9]} /><meshStandardMaterial {...wall} color="#6c7f93" roughness={0.9} metalness={0.5} /></mesh>
      <mesh position={[0, 2.95, 0]} castShadow><boxGeometry args={[26.4, 0.2, 9.4]} /><meshStandardMaterial color="#232b33" roughness={0.7} metalness={0.6} /></mesh>
      {Array.from({ length: 7 }, (_, i) => (
        <group key={i} position={[-10.5 + i * 3.5, 0, 4.52]}>
          <mesh position={[0, 1.05, 0]}><boxGeometry args={[2.4, 2.1, 0.06]} /><meshBasicMaterial color={hdr(i % 2 ? '#ffd9a0' : '#cfe8ff', 1.6)} toneMapped={false} /></mesh>
          <mesh position={[0, 1.05, 0.04]}><boxGeometry args={[2.5, 2.2, 0.03]} /><meshStandardMaterial color="#1a2027" roughness={0.6} metalness={0.7} /></mesh>
          <mesh position={[0, 2.3, 0.2]} rotation-x={0.3}><boxGeometry args={[2.6, 0.08, 0.7]} /><meshStandardMaterial color="#232b33" metalness={0.7} roughness={0.5} /></mesh>
        </group>
      ))}
      <mesh position={[0, 2.2, 4.54]}><boxGeometry args={[25, 0.05, 0.02]} /><meshBasicMaterial color={hdr(C.cyan, 2)} toneMapped={false} /></mesh>
      <Suspense fallback={null}>
        {[0, 1, 2, 3].map((i) => <Glb key={`cb${i}`} src="/models/cardboard_box_01/cardboard_box_01.gltf" scale={1.3} position={[-9 + i * 0.5, 0, 6.2 - (i % 2) * 0.2]} rotation={[0, i * 0.4, 0]} />)}
        {[0, 1, 2].map((i) => <Glb key={`pc${i}`} src="/models/plastic_crate_02/plastic_crate_02.gltf" scale={1.4} position={[-3 + i * 0.3, i * 0.06, 6.4]} rotation={[0, 0.2 * i, 0]} />)}
        <Glb src="/models/hand_truck/hand_truck.gltf" scale={1.2} position={[2.4, 0, 6.3]} rotation={[0, 0.5, 0]} />
        <Glb src="/models/steel_frame_shelves_01/steel_frame_shelves_01.gltf" scale={1.1} position={[8.4, 0, 6.3]} />
        <Glb src="/models/medical_box/medical_box.gltf" scale={1.1} position={[6, 0, 6.5]} rotation={[0, 0.7, 0]} />
      </Suspense>
    </group>
  );
}

function CustomsGate() {
  const arm = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!S.vis.port || !arm.current) return;
    const open = Math.sin(s.clock.elapsedTime * 0.5) > 0.15;
    arm.current.rotation.z = THREE.MathUtils.damp(arm.current.rotation.z, open ? 1.3 : 0, 3, 0.016);
  });
  const stripes = Array.from({ length: 9 }, (_, i) => i);
  return (
    <group position={[26, QUAY_Y, -9]}>
      {/* canopy */}
      <mesh position={[0, 2.35, 0]} castShadow><boxGeometry args={[3.6, 0.14, 6]} /><meshStandardMaterial color="#d9dee3" roughness={0.4} metalness={0.5} /></mesh>
      <mesh position={[0, 2.45, 0]}><boxGeometry args={[3.7, 0.04, 6.1]} /><meshBasicMaterial color={hdr(C.cyan, 1.6)} toneMapped={false} /></mesh>
      {[-1.7, 1.7].map((x) => [-2.7, 2.7].map((z) => <mesh key={`${x}${z}`} position={[x, 1.2, z]} castShadow><boxGeometry args={[0.14, 2.4, 0.14]} /><meshStandardMaterial color="#8a939c" roughness={0.4} metalness={0.8} /></mesh>))}
      {/* booth */}
      <mesh position={[0, 0.85, 3.1]} castShadow receiveShadow><boxGeometry args={[1.4, 1.7, 1.2]} /><meshStandardMaterial color="#e6eaee" roughness={0.45} metalness={0.3} /></mesh>
      <mesh position={[-0.71, 1.15, 3.1]}><boxGeometry args={[0.02, 0.7, 1.0]} /><meshBasicMaterial color={hdr('#ffe2b0', 1.8)} toneMapped={false} /></mesh>
      <mesh position={[0, 1.9, 3.1]}><boxGeometry args={[1.5, 0.12, 1.3]} /><meshStandardMaterial color="#1f5c8b" roughness={0.5} metalness={0.5} /></mesh>
      {/* barrier */}
      <mesh position={[0, 0.45, -3.4]} castShadow><boxGeometry args={[0.3, 0.9, 0.3]} /><meshStandardMaterial color="#2a3a4d" roughness={0.5} metalness={0.7} /></mesh>
      <group ref={arm} position={[0, 0.9, -3.4]} rotation-z={0}>
        {stripes.map((i) => (
          <mesh key={i} position={[0.14, 0, 0.18 + i * 0.4]} rotation-x={Math.PI / 2}><cylinderGeometry args={[0.05, 0.05, 0.4, 10]} />{i % 2 ? <meshStandardMaterial color="#f2f2f2" roughness={0.5} /> : <meshStandardMaterial color="#c8261b" roughness={0.5} />}</mesh>
        ))}
      </group>
      <mesh position={[0, 2.7, 0]}><sphereGeometry args={[0.1, 12, 12]} /><meshBasicMaterial color={hdr('#ff7a1a', 3.2)} toneMapped={false} /></mesh>
      <Label3D position={[-1.4, 3.3, 0]} size={0.55} italic color={C.signal}>Customs</Label3D>
      <Suspense fallback={null}>
        {[0, 1, 2, 3, 4].map((i) => <Glb key={i} src="/models/concrete_road_barrier/concrete_road_barrier.gltf" scale={1} position={[-2.6 + 0, 0, -5.6 + i * 2.8 - 2.8]} rotation={[0, Math.PI / 2, 0]} />)}
      </Suspense>
    </group>
  );
}

function RoadTraffic() {
  const t1 = useRef<THREE.Group>(null);
  const t2 = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!S.vis.port) return;
    const t = s.clock.elapsedTime;
    if (t1.current) t1.current.position.x = ((t * 2.6 + 80) % 160) - 80;
    if (t2.current) t2.current.position.x = 80 - ((t * 1.9 + 40) % 160);
  });
  return (
    <>
      <group ref={t1} position={[0, QUAY_Y + 0.0, -9.35]}><ModelSlot src="/models/truck.glb" fit={3.4} fallback={<Truck tint="#1f5c8b" />} /></group>
      <group ref={t2} position={[0, QUAY_Y + 0.0, -8.65]} rotation-y={Math.PI}><Truck tint="#e08a1e" /></group>
    </>
  );
}

function Sky() {
  const g = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!g.current || !S.vis.port) return;
    const t = s.clock.elapsedTime;
    const u = ((t * 4.5 + 30) % 120) - 60; // a long flypast, nose +X
    g.current.position.set(u, 13 + Math.sin(t * 0.3) * 0.4 + u * 0.02, -13);
    g.current.rotation.set(0, 0, Math.sin(t * 0.4) * 0.05 + 0.04);
  });
  return (
    <group ref={g}>
      <ModelSlot src="/models/airliner.glb" fit={7.4} ground={false} fallback={<Airliner />} />
    </group>
  );
}

export function PortScene() {
  const water = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: waterVert, fragmentShader: waterFrag, uniforms: { uTime: { value: 0 }, uC: { value: new THREE.Vector3() } } }),
    [],
  );
  useFrame((s) => {
    water.uniforms.uTime.value = s.clock.elapsedTime;
  });

  return (
    <EnvGroup env="port">
      <mesh position={[0, 0, 0]} rotation-x={-Math.PI / 2} material={water}><planeGeometry args={[420, 420]} /></mesh>
      <Suspense fallback={null}>
        <Ground />
        <Warehouse />
        <CustomsGate />
      </Suspense>
      <Floodlights />
      <group position={[-2, 0, 3.15]}><Ship /></group>
      <group position={[-1, QUAY_Y, 0]}><QuayCrane /></group>
      <ContainerField />
      <Yard position={[-1, QUAY_Y, -15.5]} build={() => 0.3 + 0.8 * Math.min(1, useStore.getState().beat / 5)} />
      <Suspense fallback={null}>
        {[-40, -18, 6, 30, 52].map((x, i) => <Glb key={i} src="/models/street_lamp_01/street_lamp_01.gltf" scale={1.4} position={[x, QUAY_Y, -6.2]} rotation={[0, Math.PI, 0]} />)}
      </Suspense>
      <RoadTraffic />
      <Sky />
      <Label3D position={[5, 18, -12]} size={1.1} italic>Air</Label3D>
      <Label3D position={[-12, 5.2, 3.2]} size={1.1} italic>Ocean</Label3D>
      <Label3D position={[-21, 3.6, -9]} size={1.0} italic>Road</Label3D>
      <Label3D position={[-45, 5.4, -17.5]} size={1.0} italic>Warehousing</Label3D>
    </EnvGroup>
  );
}
