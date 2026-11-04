'use client';

import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

/** 1 scene unit ≈ 5.08 m (a 40 ft container is 2.4 units long). */
export const M = 2.4 / 12.19;

type Props = {
  src: string;
  /** scale so the model's longest side equals this many scene units */
  fit?: number;
  /** or scale in metres → scene units */
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** sit the model on y = 0 and centre it on x/z */
  ground?: boolean;
  shadows?: boolean;
  onLoad?: (root: THREE.Object3D) => void;
};

/** A real glTF asset, cloned per use, auto-fitted, shadow-enabled. */
export function Glb({ src, fit, scale = 1, position, rotation, ground = true, shadows = true, onLoad }: Props) {
  const { scene } = useGLTF(src);
  const obj = useMemo(() => {
    const root = skeletonClone(scene);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const s = fit ? fit / Math.max(size.x, size.y, size.z) : scale * M;
    const wrap = new THREE.Group();
    root.scale.setScalar(s);
    const b2 = new THREE.Box3().setFromObject(root);
    const c = b2.getCenter(new THREE.Vector3());
    if (ground) root.position.set(-c.x, -b2.min.y, -c.z);
    wrap.add(root);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = shadows;
        m.receiveShadow = shadows;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (mat && 'envMapIntensity' in mat) mat.envMapIntensity = 1.1;
      }
    });
    return wrap;
  }, [scene, fit, scale, ground, shadows]);

  useEffect(() => {
    onLoad?.(obj);
  }, [obj, onLoad]);

  return <primitive object={obj} position={position} rotation={rotation} />;
}

/**
 * Drop-in slot for a licensed model: if /public/models/<name>.glb exists it is used,
 * otherwise the procedural fallback renders. This is how you swap in a purchased hero asset.
 */
export function ModelSlot({ src, fallback, ...rest }: Props & { fallback: ReactNode }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    let live = true;
    fetch(src, { method: 'HEAD' })
      .then((r) => live && setOk(r.ok && !(r.headers.get('content-type') ?? '').includes('html')))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [src]);
  if (!ok) return <>{fallback}</>;
  return (
    <Suspense fallback={fallback}>
      <Glb src={src} {...rest} />
    </Suspense>
  );
}

/** Mark every mesh below as shadow caster/receiver. */
export function Shadowed({ children, cast = true, receive = true }: { children: ReactNode; cast?: boolean; receive?: boolean }) {
  const ref = (g: THREE.Group | null) => {
    g?.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = cast;
        m.receiveShadow = receive;
      }
    });
  };
  return <group ref={ref}>{children}</group>;
}
