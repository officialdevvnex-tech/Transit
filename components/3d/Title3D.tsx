'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/lib/store';
import { rt } from '@/lib/runtime';
import { S } from './state';

const REG = '/fonts/InstrumentSerif-Regular.ttf';
const ITA = '/fonts/InstrumentSerif-Italic.ttf';
const D = 7; // distance in front of the camera

type Line = { text: string; em: boolean };

/** `*emphasis*` segments become their own italic orange line; normal segments are greedily wrapped. */
function toLines(title: string, maxChars: number): Line[] {
  const out: Line[] = [];
  title.split(/(\*[^*]+\*)/g).filter((s) => s.trim()).forEach((seg) => {
    const em = seg.startsWith('*');
    const words = (em ? seg.slice(1, -1) : seg).trim().split(/\s+/);
    let cur = '';
    words.forEach((w) => {
      if ((cur + ' ' + w).trim().length > maxChars && cur) {
        out.push({ text: cur, em });
        cur = w;
      } else cur = (cur + ' ' + w).trim();
    });
    if (cur) out.push({ text: cur, em });
  });
  return out;
}

const WHITE = new THREE.Color('#EAF0F7').multiplyScalar(0.84);
const ORANGE = new THREE.Color('#FF7A1A');

/**
 * The page headline as real 3D text: a camera-attached layer with per-line depth, pointer tilt,
 * masked rise-in after the preloader, and a scroll-away drift. Depth-tested, so planets and
 * props can pass in front of it.
 */
export function Title3D() {
  const title = useStore((s) => s.title);
  const group = useRef<THREE.Group>(null);
  const refs = useRef<(THREE.Object3D | null)[]>([]);
  const { camera, size } = useThree();
  const t0 = useRef<number | null>(null);
  const lastTitle = useRef<string | null>(null);

  const layout = useMemo(() => {
    const narrow = size.width / size.height < 1.05;
    const small = size.width < 520;
    const maxChars = narrow ? (small ? 12 : 16) : 16;
    return { lines: title ? toLines(title, maxChars) : [], narrow, small };
  }, [title, size.width, size.height]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    g.position.copy(camera.position);
    g.quaternion.copy(camera.quaternion);
    const cam = camera as THREE.PerspectiveCamera;
    const H = 2 * D * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    const W = H * cam.aspect;
    const px = H / size.height;
    const now = state.clock.elapsedTime;
    if (lastTitle.current !== title) {
      lastTitle.current = title;
      t0.current = null;
    }
    if (t0.current === null && S.ready > 0.35 && title) t0.current = now + 0.1;

    const fs = Math.min(H * (layout.narrow ? 0.11 : 0.155), W * (layout.small ? 0.17 : layout.narrow ? 0.12 : 0.1));
    const lh = fs * 0.88;
    const n = layout.lines.length;
    const scrollOut = Math.min(rt.scroll, 1600);
    const fade = 1 - THREE.MathUtils.clamp(rt.scroll / (size.height * 0.75), 0, 1);

    refs.current.forEach((o, i) => {
      if (!o) return;
      const start = (t0.current ?? 1e9) + i * 0.12;
      const u = THREE.MathUtils.clamp((now - start) / 1.15, 0, 1);
      const e = 1 - Math.pow(1 - u, 4);
      const depth = (n - 1 - i) * 0.18;
      const parX = rt.reduced ? 0 : rt.mouse.nx * 0.06 * (1 + i * 0.5);
      const parY = rt.reduced ? 0 : rt.mouse.ny * 0.04 * (1 + i * 0.5);
      const reserve = useStore.getState().heroReserve;
      const floor = reserve > 0 ? reserve * px : H * (layout.narrow ? 0.34 : 0.235);
      const baseY = -H * 0.5 + Math.max(floor, H * 0.16) + (n - 1 - i) * lh;
      o.position.set(-W / 2 + W * 0.045 + parX, baseY + parY + scrollOut * px * 0.9 + (1 - e) * -fs * 0.6, -D + depth);
      o.rotation.set(-rt.mouse.ny * 0.03, rt.mouse.nx * 0.05, 0);
      o.scale.setScalar(fs);
      (o as unknown as { fillOpacity: number }).fillOpacity = e * fade;
    });
  });

  if (!title) return <group ref={group} />;
  return (
    <group ref={group}>
      {layout.lines.map((l, i) => (
        <Text
          key={`${title}-${i}`}
          ref={(el: THREE.Object3D | null) => {
            refs.current[i] = el;
          }}
          font={l.em ? ITA : REG}
          fontSize={1}
          scale={0.0001}
          anchorX="left"
          anchorY="bottom"
          letterSpacing={-0.045}
          color={l.em ? ORANGE : WHITE}
          fillOpacity={0}
          material-toneMapped={false}
          sdfGlyphSize={128}
          renderOrder={10}
        >
          {l.text}
        </Text>
      ))}
    </group>
  );
}
