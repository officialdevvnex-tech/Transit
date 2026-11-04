'use client';

import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { ENV_ORIGIN, type Env } from '@/lib/scenes';
import { S } from './state';

export const C = {
  bg: '#070B10',
  surface: '#0F1620',
  signal: '#FF7A1A',
  cyan: '#38BDF8',
  steel: '#94A3B8',
  text: '#EAF0F7',
};

/** HDR colour (>1 channels) so selective bloom picks it up. */
export const hdr = (hex: string, k = 2.2) => new THREE.Color(hex).multiplyScalar(k);

/** A world: placed at its origin, only drawn while the camera is near it. */
export function EnvGroup({ env, children }: { env: Env; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const o = ENV_ORIGIN[env];
  useFrame(() => {
    if (g.current) g.current.visible = S.vis[env];
  });
  return (
    <group ref={g} position={o}>
      {children}
    </group>
  );
}

/** Small in-world label. Faces +Z, fades with the world's visibility. */
export function Label3D({ children, position, size = 0.5, color = C.text, italic, anchorX = 'left', opacity = 1 }: { children: string; position: [number, number, number]; size?: number; color?: string; italic?: boolean; anchorX?: 'left' | 'center' | 'right'; opacity?: number }) {
  return (
    <Text
      position={position}
      font={italic ? '/fonts/InstrumentSerif-Italic.ttf' : '/fonts/InstrumentSerif-Regular.ttf'}
      fontSize={size}
      color={color}
      anchorX={anchorX}
      anchorY="middle"
      letterSpacing={-0.03}
      fillOpacity={opacity}
      material-toneMapped={false}
    >
      {children}
    </Text>
  );
}

export function Standard({ color = C.surface, emissive, ei = 1, metal = 0.55, rough = 0.38 }: { color?: string; emissive?: string; ei?: number; metal?: number; rough?: number }) {
  return <meshStandardMaterial color={color} metalness={metal} roughness={rough} emissive={emissive ?? '#000'} emissiveIntensity={emissive ? ei : 0} />;
}

export function Glow({ color = C.signal, k = 2.4 }: { color?: string; k?: number }) {
  return <meshBasicMaterial color={hdr(color, k)} toneMapped={false} />;
}
