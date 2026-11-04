'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getContainerKit } from './containerKit';

/** One tinted container (an instanced mesh of 1, so it can carry its own colour and share the kit material). */
export function Container({ tint = '#1f5c8b', position, rotation }: { tint?: string; position?: [number, number, number]; rotation?: [number, number, number] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const kit = useMemo(() => getContainerKit(), []);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    m.setMatrixAt(0, new THREE.Matrix4());
    m.setColorAt(0, new THREE.Color(tint));
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [tint]);
  return (
    <group position={position} rotation={rotation}>
      <instancedMesh ref={ref} args={[kit.geo, kit.mat, 1]} castShadow receiveShadow frustumCulled={false} />
    </group>
  );
}
