'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { S } from './state';
import { rt } from '@/lib/runtime';
import { rand } from '@/lib/utils';
import { getContainerKit, CT, CONTAINER_COLORS } from './models/containerKit';

const COLS = 6;
const ROWS = 7;
const GX = CT.L + 0.12;
const GZ = CT.W + 0.1;

type Item = { x: number; y: number; z: number; order: number; color: THREE.Color; rot: number };

type YardProps = { position?: [number, number, number]; rotationY?: number; scale?: number; build: () => number };

/**
 * Signature interaction #3: the Yard. Real corrugated containers stack as the camera works through the
 * port, the cursor parts the stacks, a click sends a ripple through them. One InstancedMesh.
 */
export function Yard({ position = [0, 0, 0], rotationY = 0, scale = 1, build: buildFn }: YardProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const items = useMemo(() => {
    const out: Item[] = [];
    for (let c = 0; c < COLS; c++)
      for (let r = 0; r < ROWS; r++) {
        const h = 1 + Math.floor(rand(c * 7 + r * 13 + 3) * 3.6);
        const tint = CONTAINER_COLORS[Math.floor(rand(c * 11 + r * 3 + 8) * CONTAINER_COLORS.length)];
        for (let l = 0; l < h; l++) {
          const k = c * 31 + r * 17 + l * 5;
          out.push({
            x: (c - (COLS - 1) / 2) * GX + (rand(k + 3) - 0.5) * 0.05,
            y: l * (CT.H + 0.004) + CT.H / 2,
            z: (r - (ROWS - 1) / 2) * GZ,
            order: l + rand(k) * 1.4 + (r / ROWS) * 0.6,
            color: rand(k + 9) > 0.78 ? CONTAINER_COLORS[Math.floor(rand(k + 4) * CONTAINER_COLORS.length)] : tint,
            rot: rand(k + 2) > 0.5 ? 0 : Math.PI,
          });
        }
      }
    out.sort((a, b) => a.order - b.order);
    out.forEach((it, i) => (it.order = i / out.length));
    return out;
  }, []);

  const kit = useMemo(() => getContainerKit(), []);

  useEffect(() => {
    const m = mesh.current;
    if (!m) return;
    items.forEach((it, i) => m.setColorAt(i, it.color));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);

  const tmp = useMemo(
    () => ({ wp: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), ndc: new THREE.Vector2(), m: new THREE.Matrix4(), q: new THREE.Quaternion(), s: new THREE.Vector3(), p: new THREE.Vector3(), mouse: new THREE.Vector3(), origin: new THREE.Vector3(), ray: new THREE.Raycaster(), plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), e: new THREE.Euler() }),
    [],
  );
  const lastBurst = useRef(rt.burst.t);
  const burstAt = useRef(-10);

  const ground = (out: THREE.Vector3) => {
    const g = group.current;
    if (!g) return out.set(999, 0, 999);
    g.getWorldPosition(tmp.wp);
    tmp.plane.set(tmp.up, -tmp.wp.y);
    tmp.ray.setFromCamera(tmp.ndc.set(rt.mouse.nx, rt.mouse.ny), camera);
    if (!tmp.ray.ray.intersectPlane(tmp.plane, out)) return out.set(999, 0, 999);
    out.sub(tmp.wp).applyAxisAngle(tmp.up, -rotationY).divideScalar(scale);
    return out;
  };

  useFrame((state) => {
    const m = mesh.current;
    if (!m || !S.vis.port) return;
    const t = state.clock.elapsedTime;
    const build = rt.reduced ? 1 : buildFn();
    ground(tmp.mouse);
    if (rt.burst.t !== lastBurst.current) {
      lastBurst.current = rt.burst.t;
      burstAt.current = t;
      tmp.origin.copy(tmp.mouse);
    }
    const age = t - burstAt.current;
    const { m: mx, q, s, p, e } = tmp;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const local = THREE.MathUtils.clamp((build * 1.12 - it.order) * 7, 0, 1);
      const ease = 1 - Math.pow(1 - local, 3) + Math.sin(local * Math.PI) * 0.1;
      let x = it.x;
      let y = it.y + (1 - local) * 9;
      let z = it.z;
      const dx = x - tmp.mouse.x;
      const dz = z - tmp.mouse.z;
      const d = Math.hypot(dx, dz);
      const R = 3.4;
      if (d < R && !rt.reduced) {
        const k = Math.pow(1 - d / R, 2);
        x += (dx / (d + 0.001)) * k * 1.1;
        z += (dz / (d + 0.001)) * k * 0.7;
        y += k * 0.2;
      }
      if (age < 2.2 && !rt.reduced) {
        const bd = Math.hypot(it.x - tmp.origin.x, it.z - tmp.origin.z);
        y += Math.sin(bd * 2.2 - age * 11) * Math.exp(-age * 2.4) * Math.exp(-bd * 0.18) * 0.5;
      }
      s.setScalar(Math.max(0.0001, ease));
      p.set(x, y, z);
      q.setFromEuler(e.set(0, it.rot, 0));
      mx.compose(p, q, s);
      m.setMatrixAt(i, mx);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} position={position} rotation-y={rotationY} scale={scale}>
      <instancedMesh ref={mesh} args={[kit.geo, kit.mat, items.length]} castShadow receiveShadow frustumCulled={false} />
    </group>
  );
}
