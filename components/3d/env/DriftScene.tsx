'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvGroup, Label3D, C, hdr } from '../kit';
import { S } from '../state';
import { rand } from '@/lib/utils';
import { getContainerKit } from '../models/containerKit';

const pageVert = /* glsl */ `
attribute float aSeed; varying vec2 vUv; varying float vSeed;
void main(){ vUv = uv; vSeed = aSeed; gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0); }`;
const pageFrag = /* glsl */ `
precision highp float;
varying vec2 vUv; varying float vSeed;
float h(float x){ return fract(sin(x * 91.17) * 43758.5453); }
void main(){
  vec2 u = vUv;
  vec3 paper = pow(vec3(0.075, 0.105, 0.145), vec3(2.2));
  vec3 col = paper;
  float acc = step(0.5, h(vSeed));
  vec3 ac = acc > 0.5 ? pow(vec3(1.0, 0.48, 0.1), vec3(2.2)) : pow(vec3(0.22, 0.74, 0.97), vec3(2.2));
  col = mix(col, ac, step(0.9, u.y) * step(u.x, 0.45) * 0.9);
  for (int i = 0; i < 9; i++) {
    float fi = float(i);
    float y = 0.78 - fi * 0.075;
    float w = 0.35 + 0.5 * h(vSeed * 7.0 + fi);
    float line = step(abs(u.y - y), 0.012) * step(0.1, u.x) * step(u.x, 0.1 + w);
    col = mix(col, pow(vec3(0.58, 0.64, 0.72), vec3(2.2)) * 0.8, line * 0.7);
  }
  float edge = min(min(u.x, 1.0 - u.x), min(u.y, 1.0 - u.y));
  col += ac * smoothstep(0.02, 0.0, edge) * 0.5;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const N = 90;

/** Quiet space full of drifting pages (journal) and, on 404, lost cargo. */
export function DriftScene() {
  const pages = useRef<THREE.InstancedMesh>(null);
  const crates = useRef<THREE.InstancedMesh>(null);
  const lostGrp = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const NC = 46;

  const data = useMemo(
    () => ({
      pages: Array.from({ length: N }, (_, i) => ({
        p: new THREE.Vector3((rand(i) - 0.5) * 46, (rand(i + 40) - 0.5) * 20, 8 - rand(i + 80) * 60),
        r: new THREE.Vector3(rand(i + 3) * 6, rand(i + 5) * 6, rand(i + 7) * 6),
        v: new THREE.Vector3((rand(i + 11) - 0.5) * 0.2, (rand(i + 13) - 0.5) * 0.2, (rand(i + 17) - 0.5) * 0.2),
        s: 0.8 + rand(i + 21) * 1.3,
      })),
      crates: Array.from({ length: NC }, (_, i) => ({
        p: new THREE.Vector3((rand(i + 101) - 0.5) * 30, (rand(i + 141) - 0.5) * 14, 4 - rand(i + 181) * 28),
        r: new THREE.Vector3(rand(i + 3) * 6, rand(i + 5) * 6, rand(i + 7) * 6),
        v: new THREE.Vector3(rand(i + 11) - 0.5, rand(i + 13) - 0.5, rand(i + 17) - 0.5).multiplyScalar(0.5),
        c: new THREE.Color(['#FF7A1A', '#38BDF8', '#94A3B8', '#2a3a4d', '#e4572e'][i % 5]),
      })),
      seeds: new Float32Array(Array.from({ length: N }, (_, i) => rand(i + 300) * 50)),
    }),
    [],
  );
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: pageVert, fragmentShader: pageFrag, side: THREE.DoubleSide }), []);
  const pageGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(data.seeds, 1));
    return g;
  }, [data.seeds]);
  const o = useMemo(() => new THREE.Object3D(), []);
  const kit = useMemo(() => getContainerKit(), []);

  useFrame((s, dt) => {
    if (!S.vis.drift) return;
    const t = s.clock.elapsedTime;
    const pm = pages.current;
    if (pm) {
      data.pages.forEach((d, i) => {
        o.position.set(d.p.x + Math.sin(t * 0.12 + i) * 0.6, d.p.y + Math.cos(t * 0.1 + i * 2) * 0.5, d.p.z);
        o.rotation.set(d.r.x + t * d.v.x * 0.5, d.r.y + t * d.v.y * 0.5, d.r.z * 0.2 + t * d.v.z * 0.1);
        o.scale.set(d.s * 0.74, d.s, 1);
        o.updateMatrix();
        pm.setMatrixAt(i, o.matrix);
      });
      pm.instanceMatrix.needsUpdate = true;
    }
    const lost = S.scene === 'lost';
    if (lostGrp.current) lostGrp.current.visible = lost;
    if (lost && crates.current) {
      data.crates.forEach((d, i) => {
        o.position.set(d.p.x + Math.sin(t * 0.3 + i) * 0.8, d.p.y + Math.cos(t * 0.25 + i) * 0.8, d.p.z);
        o.rotation.set(d.r.x + t * d.v.x, d.r.y + t * d.v.y, d.r.z + t * d.v.z);
        o.scale.setScalar(1.15);
        o.updateMatrix();
        crates.current!.setMatrixAt(i, o.matrix);
        crates.current!.setColorAt(i, d.c);
      });
      crates.current.instanceMatrix.needsUpdate = true;
      if (crates.current.instanceColor) crates.current.instanceColor.needsUpdate = true;
    }
    if (ring.current) {
      ring.current.rotation.z += dt * 0.6;
      ring.current.scale.setScalar(1 + Math.sin(t * 6) * 0.02 * S.glitch);
    }
  });

  return (
    <EnvGroup env="drift">
      <instancedMesh ref={pages} args={[pageGeo, mat, N]} frustumCulled={false} />
      <group ref={lostGrp} visible={false}>
        <instancedMesh ref={crates} args={[kit.geo, kit.mat, NC]} frustumCulled={false} castShadow />
        <mesh ref={ring} position={[3.4, 0.6, 0]}><torusGeometry args={[2.1, 0.03, 8, 80, Math.PI * 1.5]} /><meshBasicMaterial color={hdr(C.signal, 2.6)} toneMapped={false} /></mesh>
        <Label3D position={[3.4, 0.6, 0]} size={0.5} italic color={C.signal} anchorX="center">NO SIGNAL</Label3D>
      </group>
    </EnvGroup>
  );
}
