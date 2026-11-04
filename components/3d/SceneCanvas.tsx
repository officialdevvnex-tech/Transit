'use client';

import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { World } from './World';
import { useStore } from '@/lib/store';
import { rt } from '@/lib/runtime';
import { getContainerKit } from './models/containerKit';

/** The one persistent <Canvas>. Lives in the root layout; routes only change store state. */
export default function SceneCanvas() {
  const [mobile, setMobile] = useState(false);
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);
  const setQuality = useStore((s) => s.setQuality);

  useEffect(() => {
    const m = window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
    setMobile(m);
    if ((navigator.hardwareConcurrency ?? 8) <= 4) setQuality(1);
    if (m) {
      setQuality(1);
      setDpr([1, 1.5]);
    }
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __ta: unknown }).__ta = { useStore, rt };
    // build the procedural container textures while the visitor is still on the hero
    const warm = setTimeout(() => getContainerKit(), 3500);
    const onDown = () => {
      rt.burst.t += 1;
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => {
      clearTimeout(warm);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [setQuality]);

  return (
    <Canvas
      dpr={dpr}
      shadows="percentage"
      frameloop="always"
      camera={{ position: [0, 0.2, 6.2], fov: 36, near: 0.1, far: 800 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false, depth: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color('#070B10'), 0);
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => {
          const q = useStore.getState().quality;
          if (q > 0) setQuality((q - 1) as 0 | 1 | 2);
          setDpr([1, 1.15]);
        }}
        onFallback={() => setQuality(0)}
        bounds={() => [50, 100]}
      />
      <World mobile={mobile} />
    </Canvas>
  );
}
