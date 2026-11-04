'use client';

import { Suspense } from 'react';
import { Environment } from '@react-three/drei';
import { Director } from './Director';
import { Dust } from './Dust';
import { Post } from './Post';
import { Title3D } from './Title3D';
import { SharedLights } from './SharedLights';
import { EarthScene } from './env/EarthScene';
import { PortScene } from './env/PortScene';
import { TunnelScene } from './env/TunnelScene';
import { GalleryScene } from './env/GalleryScene';
import { HorizonScene } from './env/HorizonScene';
import { DriftScene } from './env/DriftScene';

/** Six worlds, one scene graph. Each only draws while the camera is near it. */
export function World({ mobile }: { mobile: boolean }) {
  return (
    <>
      <Director />
      <Suspense fallback={null}>
        <Environment files="/hdri/dikhololo_night.hdr" background={false} />
        <SharedLights />
        <EarthScene />
        <PortScene />
        <TunnelScene />
        <GalleryScene />
        <HorizonScene />
        <DriftScene />
        <Title3D />
      </Suspense>
      <Dust count={mobile ? 700 : 1800} />
      <Post mobile={mobile} />
    </>
  );
}
