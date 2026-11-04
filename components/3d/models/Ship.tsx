'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getContainerKit, CT, CONTAINER_COLORS } from './containerKit';
import { box, cyl, merge, paint } from './geom';
import { rand } from '@/lib/utils';
import { S } from '../state';

export const SHIP = { L: 26, B: 3.9, DECK: 1.15, KEEL: -1.25 };
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Half-beam at the deck for t ∈ [0,1] (stern → bow). */
function halfBeam(t: number) {
  const hb = SHIP.B / 2;
  if (t < 0.1) return hb * (0.74 + 0.26 * smooth(0, 0.1, t));
  if (t < 0.7) return hb;
  const u = (t - 0.7) / 0.3;
  return hb * Math.pow(Math.max(0, 1 - Math.pow(u, 2.1)), 0.62);
}

function buildHull() {
  const S_ = 64;
  const J = 14;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const keelY = (t: number) => SHIP.KEEL + 0.4 * smooth(0.14, 0, t) + 1.55 * smooth(0.74, 1, t);
  for (let i = 0; i <= S_; i++) {
    const t = i / S_;
    const x = (t - 0.5) * SHIP.L;
    const hb = halfBeam(t);
    const ky = keelY(t);
    const flare = 0.16 * smooth(0.55, 1, t);
    // ring: deck-left → down → keel → up → deck-right
    for (let side = -1; side <= 1; side += 2) {
      for (let j = 0; j <= J; j++) {
        const p = side === -1 ? 1 - j / J : j / J; // 1 at deck, 0 at keel
        const k = 3.4;
        let w = hb * Math.pow(1 - Math.pow(1 - p, k), 1 / k);
        w *= 1 + flare * p;
        const y = ky + p * (SHIP.DECK - ky);
        pos.push(x, y, side === -1 ? w : -w);
        // antifouling red under the waterline, white boot stripe, black topsides
        let c: [number, number, number];
        if (y < -0.12) c = [0.34, 0.06, 0.045];
        else if (y < 0.1) c = [0.8, 0.8, 0.78];
        else c = [0.035, 0.05, 0.075];
        col.push(...c);
      }
    }
  }
  const row = (J + 1) * 2;
  for (let i = 0; i < S_; i++)
    for (let j = 0; j < row - 1; j++) {
      const a = i * row + j;
      const b = (i + 1) * row + j;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const hull = new THREE.BufferGeometry();
  hull.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  hull.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  hull.setIndex(idx);
  hull.computeVertexNormals();

  // deck plate
  const dp: number[] = [];
  const dc: number[] = [];
  const di: number[] = [];
  for (let i = 0; i <= S_; i++) {
    const t = i / S_;
    const x = (t - 0.5) * SHIP.L;
    const w = halfBeam(t) * (1 + 0.16 * smooth(0.55, 1, t));
    dp.push(x, SHIP.DECK, w, x, SHIP.DECK, -w);
    dc.push(0.13, 0.16, 0.15, 0.13, 0.16, 0.15);
    if (i < S_) di.push(i * 2, (i + 1) * 2, i * 2 + 1, i * 2 + 1, (i + 1) * 2, (i + 1) * 2 + 1);
  }
  const deck = new THREE.BufferGeometry();
  deck.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
  deck.setAttribute('color', new THREE.Float32BufferAttribute(dc, 3));
  deck.setIndex(di);
  deck.computeVertexNormals();
  return { hull, deck };
}

function buildSuperstructure() {
  const W = [0.88, 0.9, 0.92];
  const white: [number, number, number] = [0.78, 0.8, 0.82];
  const parts: THREE.BufferGeometry[] = [];
  const x0 = -9.2;
  const d = SHIP.DECK;
  // accommodation blocks
  parts.push(box(2.3, 0.9, 3.5, x0, d + 0.45, 0, white as never));
  parts.push(box(2.0, 0.85, 3.3, x0 + 0.05, d + 1.33, 0, white as never));
  parts.push(box(1.7, 0.85, 3.1, x0 + 0.1, d + 2.2, 0, white as never));
  parts.push(box(1.7, 0.85, 3.0, x0 + 0.15, d + 3.05, 0, white as never));
  // bridge deck with wing overhang
  parts.push(box(1.2, 0.55, 4.0, x0 + 0.2, d + 3.78, 0, white as never));
  parts.push(box(1.3, 0.1, 4.2, x0 + 0.2, d + 4.1, 0, [0.22, 0.24, 0.27]));
  // funnel
  parts.push(cyl(0.34, 0.42, 1.5, x0 - 1.1, d + 3.4, 0, [0.12, 0.2, 0.34], 24));
  parts.push(cyl(0.345, 0.345, 0.18, x0 - 1.1, d + 4.0, 0, [0.85, 0.22, 0.05], 24));
  parts.push(cyl(0.36, 0.36, 0.06, x0 - 1.1, d + 4.17, 0, [0.04, 0.04, 0.05], 24));
  // mast + radar
  parts.push(cyl(0.025, 0.04, 1.3, x0 + 0.3, d + 4.8, 0, [0.7, 0.72, 0.74], 8));
  parts.push(box(0.05, 0.05, 0.8, x0 + 0.3, d + 5.25, 0, [0.15, 0.16, 0.18]));
  // railings (thin bars along the deck edge)
  for (const s of [-1, 1]) parts.push(box(SHIP.L * 0.62, 0.012, 0.012, 1.5, d + 0.2, s * (SHIP.B / 2 - 0.04), [0.75, 0.75, 0.75]));
  const body = merge(parts);
  // glowing windows
  const win: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 4; k++) {
    for (const s of [-1, 1]) win.push(box(1.7 - k * 0.08, 0.1, 0.012, x0 + 0.05 + k * 0.03, d + 0.55 + k * 0.86, s * (1.75 - k * 0.05), [3.0, 2.3, 1.2]));
    win.push(box(0.012, 0.1, 2.8 - k * 0.1, x0 + 1.05 - k * 0.04 + 0.1 * k, d + 0.55 + k * 0.86, 0, [3.0, 2.3, 1.2]));
  }
  win.push(box(0.04, 0.28, 3.6, x0 + 0.8, d + 3.9, 0, [3.2, 2.5, 1.4]));
  void W;
  return { body, windows: merge(win) };
}

/**
 * A feeder container ship: lofted hull (flared bow, transom stern, antifouling red + boot stripe),
 * aft accommodation with lit windows, funnel, mast, ~150 corrugated containers, nav lights and a bow wave.
 */
export function Ship() {
  const g = useRef<THREE.Group>(null);
  const boxes = useRef<THREE.InstancedMesh>(null);
  const { hull, deck, sup, wake } = useMemo(() => {
    const { hull, deck } = buildHull();
    const sup = buildSuperstructure();
    const wake = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `
        precision highp float; uniform float uTime; varying vec2 vP;
        float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
        void main(){
          float L = ${SHIP.L.toFixed(1)}; float hb = ${(SHIP.B / 2).toFixed(2)};
          float t = vP.x / L + 0.5;
          float hw = hb * (t > 0.7 ? pow(max(0.0, 1.0 - pow((t-0.7)/0.3, 2.1)), 0.62) : 1.0);
          float d = abs(abs(vP.y) - hw);
          float foam = smoothstep(0.55, 0.0, d) * step(0.0, t) * step(t, 1.04);
          float bow = smoothstep(1.0, 0.82, t) * smoothstep(0.6, 1.02, t);
          float noise = n(vP * 3.0 + vec2(uTime * 0.6, 0.0)) * 0.7 + n(vP * 8.0 - uTime) * 0.3;
          float stern = smoothstep(0.0, -7.0, vP.x + L * 0.5) * smoothstep(1.6, 0.0, abs(vP.y)) * step(vP.x, -L * 0.5);
          float a = (foam * (0.45 + bow * 0.5) + stern * 0.5) * smoothstep(0.25, 0.8, noise);
          gl_FragColor = vec4(vec3(0.9, 0.95, 1.0), a * 0.55);
          #include <colorspace_fragment>
        }`,
    });
    return { hull, deck, sup, wake };
  }, []);

  // containers
  useEffect(() => {
    const m = boxes.current;
    if (!m) return;
    const kit = getContainerKit();
    m.geometry = kit.geo;
    m.material = kit.mat;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    let n = 0;
    const baysX = Array.from({ length: 7 }, (_, i) => -6.4 + i * (CT.L + 0.06));
    baysX.forEach((bx, bi) => {
      for (let s = -3; s <= 3; s++) {
        const edge = Math.abs(s) === 3;
        const hmax = bi > 4 ? 3 : 5;
        const h = Math.max(1, Math.round(2 + rand(bi * 17 + s * 5 + 1) * (hmax - 2)) - (edge ? 1 : 0));
        const tint = CONTAINER_COLORS[Math.floor(rand(bi * 31 + s * 7 + 3) * CONTAINER_COLORS.length)];
        for (let l = 0; l < h; l++) {
          o.position.set(bx + (rand(n + 4) - 0.5) * 0.04, SHIP.DECK + CT.H / 2 + l * (CT.H + 0.004), s * (CT.W + 0.035));
          o.rotation.set(0, 0, 0);
          o.updateMatrix();
          m.setMatrixAt(n, o.matrix);
          m.setColorAt(n, c.copy(rand(n + 11) > 0.7 ? CONTAINER_COLORS[Math.floor(rand(n + 2) * CONTAINER_COLORS.length)] : tint));
          n++;
        }
      }
    });
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);

  const beacons = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((s) => {
    if (!S.vis.port || !g.current) return;
    const t = s.clock.elapsedTime;
    g.current.position.y = Math.sin(t * 0.6) * 0.035;
    g.current.rotation.z = Math.sin(t * 0.45) * 0.006;
    g.current.rotation.x = Math.sin(t * 0.55 + 1) * 0.004;
    wake.uniforms.uTime.value = t;
    const blink = 0.5 + 0.5 * Math.sin(t * 5);
    const m = beacons.current[2];
    if (m) (m.material as THREE.MeshBasicMaterial).color.setRGB(4 * blink, 4 * blink, 4 * blink);
  });

  return (
    <group ref={g}>
      <mesh geometry={hull} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.5} metalness={0.45} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={deck} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.85} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={sup.body} castShadow receiveShadow>
        <meshPhysicalMaterial vertexColors roughness={0.38} metalness={0.25} clearcoat={0.6} clearcoatRoughness={0.4} />
      </mesh>
      <mesh geometry={sup.windows}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
      <instancedMesh ref={boxes} args={[undefined, undefined, 260]} castShadow receiveShadow frustumCulled={false} />
      {/* nav lights */}
      <mesh ref={(el) => { beacons.current[0] = el; }} position={[-8.6, SHIP.DECK + 3.95, 2.1]}><sphereGeometry args={[0.07, 10, 10]} /><meshBasicMaterial color={[4, 0.1, 0.1]} toneMapped={false} /></mesh>
      <mesh ref={(el) => { beacons.current[1] = el; }} position={[-8.6, SHIP.DECK + 3.95, -2.1]}><sphereGeometry args={[0.07, 10, 10]} /><meshBasicMaterial color={[0.1, 3, 0.4]} toneMapped={false} /></mesh>
      <mesh ref={(el) => { beacons.current[2] = el; }} position={[-8.9, SHIP.DECK + 5.5, 0]}><sphereGeometry args={[0.06, 10, 10]} /><meshBasicMaterial color={[4, 4, 4]} toneMapped={false} /></mesh>
      {/* foam */}
      <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2} material={wake} renderOrder={3}>
        <planeGeometry args={[SHIP.L + 12, SHIP.B + 5, 1, 1]} />
      </mesh>
    </group>
  );
}
