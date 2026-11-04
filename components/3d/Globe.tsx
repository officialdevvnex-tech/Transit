'use client';

import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { S } from './state';
import { HUBS } from '@/lib/geo';
import { latLonToVec3 } from '@/lib/geo3d';

const vert = /* glsl */ `
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
void main(){
  vObj = position;
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

/**
 * Photographic Earth: NASA Blue Marble day map, city lights on the night side, ocean sun-glint from the
 * specular map, drifting clouds, Rayleigh-ish limb + terminator glow. Hub pulses and lane marks sit on top.
 */
const frag = /* glsl */ `
precision highp float;
uniform sampler2D uDay, uNight, uSpec, uCloud;
uniform float uTime, uAssemble, uDim, uGlitch;
uniform vec3 uRim;
uniform vec4 uMarks[4];
uniform vec3 uHubs[${HUBS.length}];
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
const float PI = 3.14159265359;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 srgb(vec3 c){ return pow(c, vec3(2.2)); }

void main(){
  vec3 p = normalize(vObj);
  float lat = asin(clamp(p.y, -1.0, 1.0));
  float lon = atan(p.x, p.z);
  if (uGlitch > 0.001) {
    float r = floor((lat + PI * 0.5) * 38.0);
    float h = hash(vec2(r, floor(uTime * 7.0)));
    if (h > 0.8) lon += (hash(vec2(r, 3.0)) - 0.5) * 0.7 * uGlitch;
  }
  vec2 uv = vec2(lon / (2.0 * PI) + 0.5, lat / PI + 0.5);

  vec3 N = normalize(vN);
  vec3 V = normalize(vView);
  vec3 L = normalize(vec3(-0.55, 0.38, 0.75));
  float ndl = dot(N, L);
  float lit = smoothstep(-0.08, 0.28, ndl);
  float ndv = clamp(dot(N, V), 0.0, 1.0);

  vec3 day = texture2D(uDay, uv).rgb;
  vec3 night = texture2D(uNight, uv).rgb;
  float spec = texture2D(uSpec, uv).r;
  float cloud = texture2D(uCloud, uv + vec2(uTime * 0.0016, 0.0)).a;

  day = pow(day, vec3(1.08)) * vec3(0.96, 1.0, 1.06);

  vec3 col = day * (0.035 + 1.15 * lit);
  vec3 R = reflect(-L, N);
  float glint = pow(max(dot(R, V), 0.0), 64.0) * spec * lit;
  col += vec3(1.0, 0.86, 0.7) * glint * 0.9;
  float cs = smoothstep(0.25, 0.85, cloud);
  col = mix(col, vec3(0.92, 0.95, 1.0) * (0.06 + 1.05 * lit), cs * 0.78);
  float nightMask = 1.0 - smoothstep(-0.06, 0.2, ndl);
  col += srgb(vec3(1.0, 0.62, 0.28)) * night.r * nightMask * (1.0 - cs * 0.8) * 3.2;

  float limb = pow(1.0 - ndv, 3.0);
  vec3 blue = srgb(vec3(0.34, 0.62, 1.0));
  vec3 warm = srgb(vec3(1.0, 0.5, 0.2));
  float term = smoothstep(0.0, 0.18, ndl) * (1.0 - smoothstep(0.18, 0.5, ndl));
  col += mix(blue, warm, term) * limb * (0.25 + 1.1 * lit + term * 0.9) * 0.9;
  col += uRim * pow(1.0 - ndv, 5.0) * 0.12;

  float gl = abs(fract(lat / (PI / 12.0) + 0.5) - 0.5);
  float gm = abs(fract(lon / (PI / 12.0) + 0.5) - 0.5);
  float grat = (1.0 - smoothstep(0.0, fwidth(lat / (PI / 12.0)) * 1.1, gl)) + (1.0 - smoothstep(0.0, fwidth(lon / (PI / 12.0)) * 1.1, gm)) * step(abs(lat), 1.3);
  col += srgb(vec3(0.6, 0.75, 0.95)) * grat * 0.03;

  float reveal = smoothstep(uAssemble * 1.15 - 0.12, uAssemble * 1.15, (lat / PI + 0.5) + (hash(floor(uv * 180.0)) - 0.5) * 0.18);
  vec3 holo = srgb(vec3(0.22, 0.74, 0.97)) * (grat * 0.5 + 0.02);
  col = mix(col, holo, reveal);

  float glow = 0.0; float ring = 0.0;
  for (int i = 0; i < ${HUBS.length}; i++) {
    float dd = distance(p, normalize(uHubs[i]));
    glow += exp(-dd * dd * 38000.0);
    float rr = fract(uTime * 0.22 + float(i) * 0.137) * 0.07;
    ring += (1.0 - smoothstep(0.0, 0.004, abs(dd - rr))) * (1.0 - rr / 0.07) * 0.5;
  }
  col += uRim * (glow * 3.6 + ring) * (1.0 - reveal);

  for (int i = 0; i < 4; i++) {
    float w = uMarks[i].w;
    if (w > 0.003) {
      float dd = distance(p, normalize(uMarks[i].xyz));
      float rr = fract(uTime * 0.45 + float(i) * 0.3) * 0.16;
      float rg = (1.0 - smoothstep(0.0, 0.006, abs(dd - rr))) * (1.0 - rr / 0.16);
      vec3 mc = (i == 3) ? srgb(vec3(0.22, 0.74, 0.97)) : uRim;
      col += mc * w * (exp(-dd * dd * 4200.0) * 5.0 + exp(-dd * dd * 90000.0) * 6.0 + rg * 1.4);
    }
  }

  col *= 1.0 - uDim * 0.6;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

const atmoFrag = /* glsl */ `
precision highp float;
uniform vec3 uRim; uniform float uDim;
varying vec3 vN; varying vec3 vView;
void main(){
  vec3 N = normalize(vN); vec3 V = normalize(vView);
  float k = clamp(-dot(N, V) / 0.46, 0.0, 1.0);
  float a = pow(k, 3.6);
  vec3 L = normalize(vec3(-0.55, 0.38, 0.75));
  float side = smoothstep(-0.5, 0.6, dot(normalize(vec3(N.xy, 0.0)), normalize(L.xy)));
  vec3 blue = pow(vec3(0.3, 0.58, 1.0), vec3(2.2));
  vec3 c = mix(blue * 0.5, blue * 1.6, side) + uRim * 0.06;
  gl_FragColor = vec4(c, a * (0.25 + 0.65 * side) * (1.0 - uDim * 0.5));
  #include <colorspace_fragment>
}`;

export function Globe({ children }: { children?: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const [day, night, spec, cloud] = useTexture([
    '/textures/earth/earth_atmos_2048.jpg',
    '/textures/earth/earth_lights_2048.png',
    '/textures/earth/earth_specular_2048.jpg',
    '/textures/earth/earth_clouds_1024.png',
  ]);

  const { body, atmo } = useMemo(() => {
    [day, night].forEach((t) => (t.colorSpace = THREE.SRGBColorSpace));
    [spec, cloud].forEach((t) => (t.colorSpace = THREE.NoColorSpace));
    [day, night, spec, cloud].forEach((t) => {
      t.anisotropy = 8;
      t.wrapS = THREE.RepeatWrapping;
      t.needsUpdate = true;
    });
    const hubs = HUBS.map((h) => latLonToVec3(h.lat, h.lon));
    const body = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uDay: { value: day },
        uNight: { value: night },
        uSpec: { value: spec },
        uCloud: { value: cloud },
        uTime: { value: 0 },
        uAssemble: { value: 0 },
        uDim: { value: 0 },
        uGlitch: { value: 0 },
        uRim: { value: S.rim },
        uMarks: { value: S.marks },
        uHubs: { value: hubs },
      },
    });
    const atmo = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: atmoFrag,
      uniforms: { uRim: { value: S.rim }, uDim: { value: 0 } },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { body, atmo };
  }, [day, night, spec, cloud]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.position.set(S.globe.x, S.globe.y, 0);
    g.scale.setScalar(S.globe.scale);
    g.rotation.set(S.globe.rotX, S.globe.rotY, 0);
    const u = body.uniforms;
    u.uTime.value = S.time;
    u.uAssemble.value = S.assemble;
    u.uDim.value = S.dim;
    u.uGlitch.value = S.glitch;
    atmo.uniforms.uDim.value = S.dim;
  });

  return (
    <group ref={group}>
      <mesh material={body}>
        <sphereGeometry args={[1, 160, 112]} />
      </mesh>
      <mesh material={atmo} scale={1.13}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      {children}
    </group>
  );
}
