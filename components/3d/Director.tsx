'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { S, dampAngle } from './state';
import { ENV_ORIGIN, resolveScene, type Env } from '@/lib/scenes';
import { useStore } from '@/lib/store';
import { rt } from '@/lib/runtime';
import { hubById, latToRotX, lonToRotY } from '@/lib/geo';
import { latLonToVec3 } from '@/lib/geo3d';

const damp = THREE.MathUtils.damp;
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Color();
const ray = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const ENVS = Object.keys(ENV_ORIGIN) as Env[];

/**
 * The camera is a character, and the six worlds are one scene graph. Every frame: damp every
 * parameter toward the active beat of the active page, then fly the camera there, with idle
 * breathing, pointer parallax, handheld shake, a FOV push on speed.
 */
export function Director() {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(0.9, 0, 0));
  const prev = useRef(new THREE.Vector3());
  const smoothP = useRef(0);
  const velFov = useRef(0);
  const lastBurst = useRef(rt.burst.t);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const st = useStore.getState();
    const cfg = resolveScene(st.scene, st.beat);
    const reduced = rt.reduced;
    const L = (v: number) => (reduced || rt.snap ? 999 : v);
    S.time += dt * (1 + rt.afterburner * 3);
    S.env = cfg.env;
    S.scene = st.scene;
    S.mobile = size.width < 768;
    const narrow = size.width / size.height < 1.05;
    const O = ENV_ORIGIN[cfg.env];

    smoothP.current = damp(smoothP.current, rt.progress, 5, dt);
    const p = cfg.beats ? 0 : smoothP.current;

    // ---- globe layout (earth scenes)
    const gx = narrow ? cfg.mobile.x : cfg.globe.x;
    const gy = narrow ? cfg.mobile.y : cfg.globe.y;
    const gs = (narrow ? cfg.mobile.scale : cfg.globe.scale) * (1 + p * cfg.scroll.scale) * (1 + rt.ping * 0.04);
    S.globe.x = damp(S.globe.x, gx, L(2.6), dt);
    S.globe.y = damp(S.globe.y, gy, L(2.6), dt);
    S.globe.scale = damp(S.globe.scale, gs, L(2.6), dt);

    // ---- focus
    let lat = cfg.focus.lat;
    let lon = cfg.focus.lon + p * cfg.scroll.lon;
    if (st.focusHub) {
      const h = hubById(st.focusHub);
      if (h) {
        lat = h.lat;
        lon = h.lon;
      }
    } else if (st.trackPoint) {
      lat = st.trackPoint.lat;
      lon = st.trackPoint.lon;
    } else if (st.lane) {
      const a = hubById(st.lane.from);
      const b = hubById(st.lane.to);
      if (a && b) {
        const m = latLonToVec3(a.lat, a.lon, 1, tmpA).add(latLonToVec3(b.lat, b.lon, 1, tmpB)).normalize();
        lat = THREE.MathUtils.radToDeg(Math.asin(m.y));
        lon = THREE.MathUtils.radToDeg(Math.atan2(m.x, m.z));
      }
    }

    // ---- drag inertia (Network)
    const d = S.drag;
    d.active = rt.drag.active;
    if (rt.drag.dx || rt.drag.dy) {
      d.vLon = rt.drag.dx * 0.35;
      d.vLat = rt.drag.dy * 0.25;
      rt.drag.dx = 0;
      rt.drag.dy = 0;
    }
    if (!d.active) {
      d.vLon *= Math.exp(-dt * 3);
      d.vLat *= Math.exp(-dt * 3);
    }
    d.lon += d.vLon * dt * 60 * 0.02;
    d.lat = THREE.MathUtils.clamp(d.lat + d.vLat * dt * 60 * 0.02, -0.9, 0.9);
    if (st.focusHub || !cfg.interactive) {
      d.lon = damp(d.lon, 0, 3, dt);
      d.lat = damp(d.lat, 0, 3, dt);
    }

    const spinning = cfg.spin > 0 && !st.focusHub && !st.trackPoint && !st.lane && !d.active;
    S.globe.spinMix = damp(S.globe.spinMix, spinning ? 1 : 0, 2, dt);
    S.globe.spin += cfg.spin * dt * (1 + rt.afterburner * 6) * S.globe.spinMix;
    S.globe.spin = ((S.globe.spin + Math.PI) % (Math.PI * 2)) - Math.PI;
    S.globe.rotY = dampAngle(S.globe.rotY, lonToRotY(lon) + S.globe.spin * S.globe.spinMix - d.lon, L(2.2), dt);
    S.globe.rotX = damp(S.globe.rotX, latToRotX(lat) * 0.72 + d.lat, L(2.2), dt);

    // ---- layer intensities
    S.lanes = damp(S.lanes, cfg.lanes, L(2), dt);
    S.dust = damp(S.dust, cfg.dust, L(2), dt);
    S.dim = damp(S.dim, cfg.dim, L(2), dt);
    S.glitch = damp(S.glitch, cfg.glitch, L(4), dt);
    S.assemble = Math.min(1, S.assemble + Math.min(rawDt, 0.5) / (st.ready || rt.reduced ? 1.1 : 3.2));
    if (rt.reduced) S.assemble = 1;
    S.ready = damp(S.ready, st.ready ? 1 : 0, 1.4, dt);

    const m = st.mode;
    S.weights.air = damp(S.weights.air, m === 'all' || m === 'air' ? 1 : 0.12, 4, dt);
    S.weights.sea = damp(S.weights.sea, m === 'all' || m === 'sea' ? 1 : 0.12, 4, dt);
    S.weights.road = damp(S.weights.road, m === 'all' || m === 'road' ? 1 : 0.12, 4, dt);
    const ei = { earth: 0.12, port: 1.0, tunnel: 0.5, gallery: 0.9, horizon: 0.7, drift: 0.35 }[cfg.env];
    (state.scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity = damp((state.scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity ?? ei, ei, 3, dt);
    S.rim.lerp(tmpC.set(cfg.rim), 1 - Math.exp(-dt * 2.5));

    // ---- marks
    const setMark = (i: number, hubId: string | undefined, ll: { lat: number; lon: number } | null, k: number) => {
      const v = S.marks[i];
      let pt: THREE.Vector3 | null = null;
      if (hubId) {
        const h = hubById(hubId);
        if (h) pt = latLonToVec3(h.lat, h.lon, 1, tmpA);
      } else if (ll) pt = latLonToVec3(ll.lat, ll.lon, 1, tmpA);
      if (pt) v.set(pt.x, pt.y, pt.z, damp(v.w, k, 4, dt));
      else v.w = damp(v.w, 0, 4, dt);
    };
    setMark(0, st.lane?.from, null, 1);
    setMark(1, st.lane?.to, null, 1);
    setMark(2, undefined, st.trackPoint, st.trackPoint ? 1 : 0);
    setMark(3, st.focusHub ?? undefined, null, 1);

    // ---- pointer ray
    ray.setFromCamera(new THREE.Vector2(rt.mouse.nx, rt.mouse.ny), camera);
    S.mouseDir.copy(ray.ray.direction);
    ray.ray.intersectPlane(plane, S.mouseWorld);
    if (rt.burst.t !== lastBurst.current) {
      lastBurst.current = rt.burst.t;
      S.burstT = state.clock.elapsedTime;
      S.burstOrigin.copy(S.mouseWorld);
      S.burstDir.copy(S.mouseDir);
    }

    // ---- camera
    const t = state.clock.elapsedTime;
    const k = reduced ? 0 : 1;
    const breathe = Math.sin(t * 0.5) * 0.03 * k;
    const shakeX = (Math.sin(t * 1.7) + Math.sin(t * 2.9 + 1)) * 0.0022 * k;
    const shakeY = (Math.sin(t * 1.3 + 2) + Math.sin(t * 3.3)) * 0.002 * k;
    const px = rt.mouse.nx * (cfg.env === 'earth' ? 0.22 : 0.5) * k;
    const py = rt.mouse.ny * (cfg.env === 'earth' ? 0.14 : 0.3) * k;

    const tgt = tmpA.set(
      O[0] + cfg.cam[0] + p * cfg.scroll.cam[0] + px + shakeX,
      O[1] + cfg.cam[1] + p * cfg.scroll.cam[1] + py + breathe + shakeY,
      O[2] + cfg.cam[2] + p * cfg.scroll.cam[2] + breathe * 2,
    );
    const lk = tmpB.set(O[0] + (narrow && cfg.env === 'earth' ? 0 : cfg.look[0]), O[1] + cfg.look[1], O[2] + cfg.look[2]);
    if (narrow) {
      if (cfg.env === 'earth') tgt.z = O[2] + (tgt.z - O[2]) * 1.18;
      else tgt.sub(lk).multiplyScalar(1.22).add(lk);
    }

    const far = camera.position.distanceTo(tgt) > 22;
    const lam = L(far ? 3.4 : 2.4);
    camera.position.x = damp(camera.position.x, tgt.x, lam, dt);
    camera.position.y = damp(camera.position.y, tgt.y, lam, dt);
    camera.position.z = damp(camera.position.z, tgt.z, lam, dt);
    look.current.x = damp(look.current.x, lk.x, lam, dt);
    look.current.y = damp(look.current.y, lk.y, lam, dt);
    look.current.z = damp(look.current.z, lk.z, lam, dt);
    camera.lookAt(look.current);

    const speed = camera.position.distanceTo(prev.current) / Math.max(dt, 1e-4);
    prev.current.copy(camera.position);
    S.warp = damp(S.warp, Math.min(1, speed / 90), 6, dt);

    ENVS.forEach((e) => {
      const o = ENV_ORIGIN[e];
      S.vis[e] = Math.hypot(camera.position.x - o[0], camera.position.y - o[1], camera.position.z - o[2]) < 62;
    });

    velFov.current = damp(velFov.current, Math.min(Math.abs(rt.velocity) * 0.22 + S.warp * 14, 16), 4, dt);
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = damp(cam.fov, cfg.fov + (narrow ? 8 : 0) + velFov.current, 4, dt);
    cam.updateProjectionMatrix();
  }, -10);

  return null;
}
