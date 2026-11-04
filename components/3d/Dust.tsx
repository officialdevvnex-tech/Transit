'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { S } from './state';
import { rand } from '@/lib/utils';

const BOX = 46;

const vert = /* glsl */ `
attribute float aSize; attribute float aSeed; attribute vec3 aColor;
uniform float uTime, uPx, uAmount, uBurstAge, uBox, uWarp;
uniform vec3 uCam, uMouse, uBurst;
varying vec3 vColor; varying float vAlpha;
void main(){
  // an endless field: wrap every particle into a box centred on the camera
  vec3 p = mod(position - uCam + uBox * 0.5, uBox) - uBox * 0.5;
  p.x += sin(uTime * 0.07 + aSeed * 40.0) * 0.35;
  p.y += cos(uTime * 0.06 + aSeed * 30.0) * 0.3;
  p.z += sin(uTime * 0.05 + aSeed * 20.0) * 0.3;
  // cursor repel (camera-relative, so it works in every world)
  vec3 dm = p - uMouse;
  float lm = length(dm);
  float rep = smoothstep(2.6, 0.0, lm);
  p += normalize(dm + 0.0001) * rep * rep * 1.6;
  // click burst shell
  vec3 db = p - uBurst;
  float lb = length(db);
  float shell = exp(-pow((lb - uBurstAge * 9.0) * 0.6, 2.0)) * exp(-uBurstAge * 1.3);
  p += normalize(db + 0.0001) * shell * 2.0;
  vec4 mv = vec4(mat3(viewMatrix) * p, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.65 + 0.35 * sin(uTime * 1.6 + aSeed * 90.0);
  float dist = -mv.z;
  gl_PointSize = aSize * uPx * (1.0 + shell * 3.0 + uWarp * 1.5) * (7.0 / max(dist, 1.0)) * tw;
  vColor = aColor * (1.0 + shell * 3.0 + uWarp);
  vAlpha = uAmount * (0.3 + 0.7 * tw) * smoothstep(uBox * 0.5, 4.0, dist) * step(0.0, dist);
}`;
const frag = /* glsl */ `
precision highp float;
varying vec3 vColor; varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float a = smoothstep(0.5, 0.0, length(c));
  gl_FragColor = vec4(vColor, a * a * vAlpha);
  #include <colorspace_fragment>
}`;

/** Endless, camera-wrapped dust: parallax during every flight; the pointer parts it; a click shocks it. */
export function Dust({ count }: { count: number }) {
  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color('#94A3B8'), new THREE.Color('#38BDF8'), new THREE.Color('#EAF0F7'), new THREE.Color('#FF7A1A')];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = rand(i * 3 + 1) * 4000;
      pos[i * 3 + 1] = rand(i * 3 + 2) * 4000;
      pos[i * 3 + 2] = rand(i * 3 + 3) * 4000;
      size[i] = 0.7 + rand(i + 9) * 2.2;
      seed[i] = rand(i + 77);
      const k = rand(i + 5);
      const c = palette[k < 0.5 ? 0 : k < 0.8 ? 1 : k < 0.94 ? 2 : 3];
      col[i * 3] = c.r * 0.85;
      col[i * 3 + 1] = c.g * 0.85;
      col[i * 3 + 2] = c.b * 0.85;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 }, uPx: { value: 1 }, uAmount: { value: 0 }, uBurstAge: { value: 99 }, uBox: { value: BOX }, uWarp: { value: 0 },
        uCam: { value: new THREE.Vector3() }, uMouse: { value: new THREE.Vector3() }, uBurst: { value: new THREE.Vector3() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geo, mat };
  }, [count]);

  useFrame((state) => {
    const u = mat.uniforms;
    u.uTime.value = S.time;
    u.uPx.value = state.gl.getPixelRatio() * 3.2;
    u.uAmount.value = 0.35 + S.dust * 0.55;
    u.uCam.value.copy(state.camera.position);
    u.uMouse.value.copy(S.mouseDir).multiplyScalar(8);
    u.uBurst.value.copy(S.burstDir).multiplyScalar(8);
    u.uBurstAge.value = state.clock.elapsedTime - S.burstT;
    u.uWarp.value = S.warp;
  });

  return <points geometry={geo} material={mat} frustumCulled={false} renderOrder={-1} />;
}
