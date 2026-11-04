'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { EnvGroup, hdr, C } from '../kit';
import { Globe } from '../Globe';
import { Lanes } from '../Lanes';
import { S } from '../state';
import { HUBS } from '@/lib/geo';
import { latLonToVec3 } from '@/lib/geo3d';
import { OFFICES } from '@/content/site';
import { resolveScene } from '@/lib/scenes';
import { useStore } from '@/lib/store';

const DECORS = ['network', 'track', 'quote', 'contact'] as const;
type Decor = (typeof DECORS)[number];

const discFrag = /* glsl */ `
precision highp float; uniform float uA, uT; varying vec2 vUv;
void main(){
  vec2 p = vUv - 0.5; float r = length(p) * 2.0;
  float rings = 1.0 - smoothstep(0.0, 0.012, abs(fract(r * 6.0) - 0.5) - 0.48);
  float ang = atan(p.y, p.x);
  float ticks = (1.0 - smoothstep(0.0, 0.02, abs(fract(ang * 14.0 / 6.2831 + 0.5) - 0.5) - 0.47)) * smoothstep(0.55, 0.95, r) * step(r, 1.0);
  float fade = smoothstep(1.0, 0.2, r);
  vec3 c = pow(vec3(0.22, 0.74, 0.97), vec3(2.2)) * (rings * 0.55 + ticks * 1.2) * fade * 2.0;
  float sweep = smoothstep(0.0, 1.0, fract((ang / 6.2831) - uT * 0.12)) * smoothstep(1.0, 0.1, r) * 0.0;
  gl_FragColor = vec4(c + sweep, (rings * 0.4 + ticks) * fade * uA);
  #include <colorspace_fragment>
}`;

function EarthDecor() {
  const w = useRef<Record<Decor, number>>({ network: 0, track: 0, quote: 0, contact: 0 });
  const ringGrp = useRef<THREE.Group>(null);
  const sats = useRef<THREE.InstancedMesh>(null);
  const disc = useRef<THREE.Mesh>(null);
  const sweep = useRef<THREE.Mesh>(null);
  const discMat = useMemo(
    () => new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }', fragmentShader: discFrag, uniforms: { uA: { value: 0 }, uT: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    [],
  );
  const o = useMemo(() => new THREE.Object3D(), []);

  useFrame((s, dt) => {
    const st = useStore.getState();
    const d = resolveScene(st.scene, st.beat).decor;
    DECORS.forEach((k) => (w.current[k] = THREE.MathUtils.damp(w.current[k], k === d && S.env === 'earth' ? 1 : 0, 3, dt)));
    const gx = S.globe.x;
    const gy = S.globe.y;
    const sc = S.globe.scale;
    const t = s.clock.elapsedTime;
    const ringOn = Math.max(w.current.network, w.current.quote * 0.7, w.current.track * 0.6);
    if (ringGrp.current) {
      ringGrp.current.visible = ringOn > 0.01;
      ringGrp.current.position.set(gx, gy, 0);
      ringGrp.current.scale.setScalar(sc * 1.32);
      ringGrp.current.rotation.set(0.4, t * 0.1, 0.2);
      ringGrp.current.children.forEach((c, i) => {
        c.rotation.set(i * 1.05, i * 0.6 + t * 0.05 * (i + 1), 0);
        ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.5 * ringOn;
      });
    }
    if (sats.current) {
      sats.current.visible = w.current.network > 0.01;
      for (let i = 0; i < 10; i++) {
        const a = t * 0.18 + (i / 10) * Math.PI * 2;
        o.position.set(gx + Math.cos(a) * sc * 1.55, gy + Math.sin(a * 1.0) * sc * 0.35, Math.sin(a) * sc * 1.55);
        o.rotation.set(a, a * 2, 0);
        o.scale.setScalar(0.022 * sc);
        o.updateMatrix();
        sats.current.setMatrixAt(i, o.matrix);
      }
      sats.current.instanceMatrix.needsUpdate = true;
    }
    const discOn = Math.max(w.current.quote, w.current.track);
    if (disc.current) {
      disc.current.visible = discOn > 0.01;
      disc.current.position.set(gx, gy - sc * 1.6, 0);
      disc.current.scale.setScalar(sc * 4.2);
      discMat.uniforms.uA.value = discOn;
      discMat.uniforms.uT.value = t;
    }
    if (sweep.current) {
      sweep.current.visible = w.current.track > 0.01;
      sweep.current.position.set(gx, gy - sc * 1.6, 0);
      sweep.current.scale.setScalar(sc * 2.1);
      sweep.current.rotation.z = -t * 0.9;
      (sweep.current.material as THREE.MeshBasicMaterial).opacity = 0.35 * w.current.track;
    }
  });

  return (
    <>
      <group ref={ringGrp}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}><torusGeometry args={[1, 0.0035, 6, 160]} /><meshBasicMaterial color={hdr(i % 2 ? C.cyan : C.signal, 1.6)} transparent opacity={0} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} /></mesh>
        ))}
      </group>
      <instancedMesh ref={sats} args={[undefined, undefined, 10]} frustumCulled={false}>
        <boxGeometry args={[1.6, 0.6, 0.9]} />
        <meshBasicMaterial color={hdr(C.cyan, 2)} toneMapped={false} />
      </instancedMesh>
      <mesh ref={disc} rotation-x={-Math.PI / 2} material={discMat}><planeGeometry args={[1, 1]} /></mesh>
      <mesh ref={sweep} rotation-x={-Math.PI / 2}><circleGeometry args={[1, 40, 0, 0.9]} /><meshBasicMaterial color={hdr(C.cyan, 1.8)} transparent opacity={0} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>
    </>
  );
}

const OFFICE_IDS = new Set(OFFICES.map((o) => o.id));

/** Pins + 3D city labels riding on the globe. Labels fade as their hub turns away from the camera. */
function HubPins() {
  const texts = useRef<(THREE.Object3D | null)[]>([]);
  const wp = useMemo(() => new THREE.Vector3(), []);
  const gc = useMemo(() => new THREE.Vector3(), []);
  const cd = useMemo(() => new THREE.Vector3(), []);
  const pins = useMemo(() => HUBS.map((h) => ({ h, p: latLonToVec3(h.lat, h.lon, 1.0), l: latLonToVec3(h.lat, h.lon, 1.09) })), []);
  const wt = useRef({ network: 0, contact: 0 });

  useFrame((s, dt) => {
    const st = useStore.getState();
    const d = resolveScene(st.scene, st.beat).decor;
    wt.current.network = THREE.MathUtils.damp(wt.current.network, d === 'network' ? 1 : 0, 3, dt);
    wt.current.contact = THREE.MathUtils.damp(wt.current.contact, d === 'contact' ? 1 : 0, 3, dt);
    const cam = s.camera;
    texts.current.forEach((o, i) => {
      if (!o) return;
      const hub = pins[i].h;
      const weight = wt.current.network + (OFFICE_IDS.has(hub.id) ? wt.current.contact : 0);
      o.getWorldPosition(wp);
      gc.set(S.globe.x, S.globe.y, 0);
      cd.copy(cam.position).sub(gc).normalize();
      const facing = wp.clone().sub(gc).normalize().dot(cd);
      const f = THREE.MathUtils.smoothstep(facing, 0.12, 0.5);
      const focus = st.focusHub === hub.id ? 1.6 : 1;
      (o as unknown as { fillOpacity: number }).fillOpacity = Math.min(1, weight * f * focus);
      o.quaternion.copy(cam.quaternion);
      o.visible = weight * f > 0.02;
      const sc = S.globe.scale;
      o.scale.setScalar(0.055 * (1 + (st.focusHub === hub.id ? 0.5 : 0)) / Math.max(0.6, sc * 0.6));
    });
  });

  return (
    <>
      {pins.map(({ h, p, l }, i) => (
        <group key={h.id}>
          <mesh position={p}><sphereGeometry args={[0.012, 8, 8]} /><meshBasicMaterial color={hdr(C.signal, 3)} toneMapped={false} /></mesh>
          <Text
            ref={(el: THREE.Object3D | null) => {
              texts.current[i] = el;
            }}
            position={l}
            font="/fonts/InstrumentSerif-Regular.ttf"
            fontSize={1}
            anchorX="left"
            anchorY="middle"
            color={hdr(C.text, 0.9)}
            fillOpacity={0}
            letterSpacing={-0.02}
            material-toneMapped={false}
            outlineWidth={0.04}
            outlineColor="#070B10"
            outlineOpacity={0.9}
          >
            {h.name}
          </Text>
        </group>
      ))}
    </>
  );
}

export function EarthScene() {
  return (
    <EnvGroup env="earth">
      <Globe>
        <Lanes />
        <HubPins />
      </Globe>
      <EarthDecor />
    </EnvGroup>
  );
}
