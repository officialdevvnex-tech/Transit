'use client';

import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, N8AO, SMAA, ToneMapping } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { useStore } from '@/lib/store';
import { rt } from '@/lib/runtime';
import { S } from './state';
import { resolveScene } from '@/lib/scenes';

/**
 * Cinematic, not blurry: selective bloom (luminance threshold keeps only HDR hits like hubs, lane
 * heads and vehicles), chromatic aberration that only appears with scroll velocity, fine grain, vignette.
 * Tiers: 2 = all, 1 = bloom + vignette, 0 = none (set by PerformanceMonitor).
 */
export function Post({ mobile }: { mobile: boolean }) {
  const quality = useStore((s) => s.quality);
  const env = useStore((s) => resolveScene(s.scene, s.beat).env);
  const offset = useMemo(() => new THREE.Vector2(0.0002, 0.0002), []);

  useFrame(() => {
    const v = Math.min(Math.abs(rt.velocity) * 0.00012, 0.0026) + rt.afterburner * 0.0012 + S.warp * 0.004;
    offset.set(0.00016 + v, 0.00016 + v * 0.6);
  });

  if (quality === 0) return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {quality === 2 && !mobile ? <N8AO aoRadius={env === 'port' ? 3.5 : 1.8} distanceFalloff={1.4} intensity={env === 'earth' || env === 'tunnel' || env === 'horizon' || env === 'drift' ? 0 : 2.6} quality="medium" halfRes /> : <></>}
      <Bloom intensity={mobile ? 0.7 : 0.95} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur radius={0.72} />
      {quality === 2 && !mobile ? <ChromaticAberration offset={offset} radialModulation={false} modulationOffset={0} /> : <></>}
      {quality === 2 ? <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.22} /> : <></>}
      <Vignette eskil={false} offset={0.25} darkness={0.78} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      {quality >= 1 && !mobile ? <SMAA /> : <></>}
    </EffectComposer>
  );
}
