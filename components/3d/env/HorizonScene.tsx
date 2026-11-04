'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EnvGroup, hdr, C } from '../kit';
import { S } from '../state';
import { useStore } from '@/lib/store';
import { rand } from '@/lib/utils';
import { WindTurbine } from '../models/Showpieces';

const skyVert = /* glsl */ `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,1.0); }`;
const skyFrag = /* glsl */ `
precision highp float;
uniform float uSun;
varying vec3 vP;
void main(){
  float h = normalize(vP).y;
  vec3 top = pow(vec3(0.02, 0.04, 0.09), vec3(2.2));
  vec3 mid = pow(vec3(0.05, 0.12, 0.2), vec3(2.2));
  vec3 hor = pow(vec3(0.95, 0.36, 0.1), vec3(2.2)) * 0.7;
  float s = clamp(uSun, 0.0, 1.0);
  vec3 col = mix(mid, top, smoothstep(0.0, 0.7, h));
  col = mix(col, hor, exp(-h * mix(26.0, 11.0, s)) * mix(0.18, 0.62, s));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const groundVert = /* glsl */ `varying vec3 vN; varying vec3 vO; void main(){ vO = position; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const groundFrag = /* glsl */ `
precision highp float;
uniform float uTime;
varying vec3 vN; varying vec3 vO;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  vec3 p = normalize(vO);
  vec2 g = vec2(atan(p.x, p.z), asin(p.y)) * 900.0;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float cluster = smoothstep(0.55, 0.85, sin(g.x * 0.018) * sin(g.y * 0.021) * 0.5 + h(floor(g * 0.03)) * 0.6);
  float on = step(0.86, h(id)) * cluster;
  float lamp = on * smoothstep(0.35, 0.0, length(f));
  vec3 base = pow(vec3(0.025, 0.04, 0.06), vec3(2.2));
  vec3 city = mix(pow(vec3(1.0, 0.62, 0.25), vec3(2.2)), pow(vec3(0.5, 0.8, 1.0), vec3(2.2)), h(id + 3.0)) * lamp * 2.4;
  float line = 1.0 - smoothstep(0.0, 0.03, min(abs(fract(g.x / 90.0) - 0.5), 0.5) - 0.47);
  vec3 col = base + city;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const TOWERS = Array.from({ length: 11 }, (_, i) => ({ x: (rand(i + 4) - 0.5) * 90, z: -22 - rand(i + 9) * 70, h: 5 + rand(i + 13) * 10, c: i % 3 === 0 ? C.cyan : C.signal }));

/** Sunrise over a planet-wide network: hub towers, a city-lit horizon, and a sun that climbs as you scroll. */
export function HorizonScene() {
  const sun = useRef<THREE.Group>(null);
  const beams = useRef<(THREE.Mesh | null)[]>([]);
  const sky = useMemo(() => new THREE.ShaderMaterial({ vertexShader: skyVert, fragmentShader: skyFrag, uniforms: { uSun: { value: 0 } }, side: THREE.BackSide, depthWrite: false }), []);
  const ground = useMemo(() => new THREE.ShaderMaterial({ vertexShader: groundVert, fragmentShader: groundFrag, uniforms: { uTime: { value: 0 } } }), []);
  const sunLevel = useRef(0);

  useFrame((s, dt) => {
    if (!S.vis.horizon) return;
    const b = useStore.getState().beat;
    sunLevel.current = THREE.MathUtils.damp(sunLevel.current, Math.min(1, b / 3), 1.4, dt);
    sky.uniforms.uSun.value = sunLevel.current;
    ground.uniforms.uTime.value = s.clock.elapsedTime;
    if (sun.current) sun.current.position.set(0, -4 + sunLevel.current * 14, -150);
    beams.current.forEach((m, i) => m && ((m.material as THREE.MeshBasicMaterial).opacity = 0.35 + 0.3 * Math.sin(s.clock.elapsedTime * 2 + i)));
  });

  return (
    <EnvGroup env="horizon">
      <mesh material={sky}><sphereGeometry args={[400, 32, 24]} /></mesh>
      <mesh position={[0, -300, -150]} material={ground}><sphereGeometry args={[300, 128, 96]} /></mesh>
      <group ref={sun} position={[0, -4, -150]}>
        <mesh><sphereGeometry args={[9, 40, 40]} /><meshBasicMaterial color={hdr('#ff9a5a', 1.9)} toneMapped={false} /></mesh>
        <mesh scale={2.4}><sphereGeometry args={[9, 32, 32]} /><meshBasicMaterial color={hdr(C.signal, 1.2)} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
      </group>
      {Array.from({ length: 9 }, (_, i) => (
        <group key={`wt${i}`} position={[-46 + i * 11.5 + rand(i + 3) * 4, 0, -34 - rand(i + 20) * 40]} scale={3.2 + rand(i + 8) * 1.4}>
          <WindTurbine />
        </group>
      ))}
      {TOWERS.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          <mesh position={[0, t.h / 2, 0]}><cylinderGeometry args={[0.12, 0.35, t.h, 8]} /><meshStandardMaterial color="#0b1219" metalness={0.8} roughness={0.3} /></mesh>
          <mesh position={[0, t.h + 0.1, 0]}><sphereGeometry args={[0.28, 12, 12]} /><meshBasicMaterial color={hdr(t.c, 3)} toneMapped={false} /></mesh>
          <mesh ref={(el) => { beams.current[i] = el; }} position={[0, t.h + 12, 0]}><cylinderGeometry args={[0.03, 0.08, 24, 6]} /><meshBasicMaterial color={hdr(t.c, 2)} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
        </group>
      ))}
    </EnvGroup>
  );
}
