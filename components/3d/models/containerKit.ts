import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { rand } from '@/lib/utils';

/** 40 ft high-cube, in scene units (4.7 : 1 : 1.06). */
export const CT = { L: 2.4, H: 0.53, W: 0.5 };

const AW = 2048;
const AH = 1024;
const SIDE_U = 0.75; // atlas: left 75% = corrugated side, right: door end (top) / roof (bottom)

let kit: { geo: THREE.BufferGeometry; mat: THREE.MeshStandardMaterial } | null = null;

function noise2(x: number, y: number) {
  return rand(Math.floor(x) * 57 + Math.floor(y) * 131);
}

/** Procedural PBR atlas: real corrugation (normal-mapped), door rods and hinges, rust bleed, scratches. */
function buildTextures() {
  const sideW = Math.floor(AW * SIDE_U);
  const endW = AW - sideW;
  // --- height map (grayscale 0..255)
  const h = new Float32Array(AW * AH);
  const col = new Float32Array(AW * AH * 3);
  const rough = new Float32Array(AW * AH);
  const ribs = 40;
  const period = sideW / ribs;

  for (let y = 0; y < AH; y++) {
    for (let x = 0; x < AW; x++) {
      const i = y * AW + x;
      let height = 0.5;
      let shade = 0.8;
      let r = 0.55;
      if (x < sideW) {
        // corrugated side: trapezoid profile
        const t = ((x % period) / period) * 2 * Math.PI;
        const prof = Math.max(-1, Math.min(1, Math.sin(t) * 1.6));
        height = 0.5 + prof * 0.35;
        shade = 0.72 + prof * 0.14;
        // top/bottom rails (flat)
        if (y < 36 || y > AH - 36) {
          height = 0.78;
          shade = 0.86;
        }
        // vertical rust bleed from the bottom + streaks
        const streak = noise2(x / 6, 0) > 0.82 ? 1 : 0;
        const bleed = Math.pow(y / AH, 2.2) * (0.35 + 0.5 * noise2(x / 22, y / 90));
        shade *= 1 - bleed * 0.35 - streak * 0.06 * (y / AH);
        r = 0.5 + bleed * 0.35 + 0.1 * noise2(x / 4, y / 4);
      } else if (y < AH / 2) {
        // door end (flat panel + rods + hinges + cross bar)
        const ex = x - sideW;
        height = 0.5;
        shade = 0.74;
        for (const cx of [endW * 0.18, endW * 0.36, endW * 0.64, endW * 0.82]) {
          const d = Math.abs(ex - cx);
          if (d < 5 && y > 30 && y < AH / 2 - 30) {
            height = 0.9 - d * 0.04;
            shade = 0.92;
            r = 0.25;
          }
          if (d < 14 && (Math.abs(y - 70) < 10 || Math.abs(y - (AH / 2 - 70)) < 10)) {
            height = 0.85;
            shade = 0.5;
          }
        }
        if (Math.abs(ex - endW / 2) < 1.5) {
          height = 0.3;
          shade = 0.4;
        }
        if (Math.abs(y - AH / 4) < 8 && ex > endW * 0.1 && ex < endW * 0.9) {
          height = 0.8;
          shade = 0.88;
        }
        shade *= 1 - Math.pow(y / (AH / 2), 2) * 0.12;
      } else {
        // roof / floor: low-amplitude ribs
        const ex = x - sideW;
        height = 0.5 + Math.sin(ex * 0.2) * 0.08;
        shade = 0.62 + 0.1 * noise2(x / 5, y / 5);
        r = 0.6;
      }
      // fine grain + scratches
      const grain = (noise2(x * 0.7, y * 0.7) - 0.5) * 0.05;
      h[i] = height + grain * 0.4;
      const s = shade + grain;
      col[i * 3] = s;
      col[i * 3 + 1] = s;
      col[i * 3 + 2] = s;
      rough[i] = Math.max(0.2, Math.min(0.95, r + grain));
    }
  }

  const mk = (draw: (d: Uint8ClampedArray) => void, srgb: boolean) => {
    const c = document.createElement('canvas');
    c.width = AW;
    c.height = AH;
    const ctx = c.getContext('2d')!;
    const img = ctx.createImageData(AW, AH);
    draw(img.data);
    ctx.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    return t;
  };

  const map = mk((d) => {
    for (let i = 0; i < AW * AH; i++) {
      d[i * 4] = col[i * 3] * 255;
      d[i * 4 + 1] = col[i * 3 + 1] * 255;
      d[i * 4 + 2] = col[i * 3 + 2] * 255;
      d[i * 4 + 3] = 255;
    }
  }, true);
  const normal = mk((d) => {
    const k = 5.5;
    for (let y = 0; y < AH; y++)
      for (let x = 0; x < AW; x++) {
        const l = h[y * AW + Math.max(0, x - 1)];
        const r = h[y * AW + Math.min(AW - 1, x + 1)];
        const u = h[Math.max(0, y - 1) * AW + x];
        const dn = h[Math.min(AH - 1, y + 1) * AW + x];
        let nx = (l - r) * k;
        let ny = (dn - u) * k;
        let nz = 1;
        const len = Math.hypot(nx, ny, nz);
        nx /= len;
        ny /= len;
        nz /= len;
        const i = (y * AW + x) * 4;
        d[i] = (nx * 0.5 + 0.5) * 255;
        d[i + 1] = (ny * 0.5 + 0.5) * 255;
        d[i + 2] = (nz * 0.5 + 0.5) * 255;
        d[i + 3] = 255;
      }
  }, false);
  const roughness = mk((d) => {
    for (let i = 0; i < AW * AH; i++) {
      d[i * 4] = 0;
      d[i * 4 + 1] = rough[i] * 255;
      d[i * 4 + 2] = 0;
      d[i * 4 + 3] = 255;
    }
  }, false);
  return { map, normal, roughness };
}

function remapUV(g: THREE.BoxGeometry) {
  const n = g.attributes.normal;
  const uv = g.attributes.uv;
  const pos = g.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    const nx = n.getX(i);
    const ny = n.getY(i);
    const nz = n.getZ(i);
    const x = pos.getX(i) / CT.L + 0.5;
    const y = pos.getY(i) / CT.H + 0.5;
    const z = pos.getZ(i) / CT.W + 0.5;
    let u = 0;
    let v = 0;
    if (Math.abs(nz) > 0.5) {
      // long sides
      u = (nz > 0 ? x : 1 - x) * SIDE_U;
      v = y;
    } else if (Math.abs(nx) > 0.5) {
      // door end
      u = SIDE_U + (nx > 0 ? 1 - z : z) * (1 - SIDE_U);
      v = 0.5 + y * 0.5;
    } else {
      u = SIDE_U + x * (1 - SIDE_U);
      v = z * 0.5;
    }
    uv.setXY(i, u, v);
  }
  uv.needsUpdate = true;
}

export function getContainerKit() {
  if (kit) return kit;
  const body = new THREE.BoxGeometry(CT.L, CT.H, CT.W, 1, 1, 1);
  remapUV(body);
  const paint = (g: THREE.BufferGeometry, v: number) => {
    const c = new Float32Array(g.attributes.position.count * 3).fill(v);
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    return g;
  };
  paint(body, 1);
  const parts: THREE.BufferGeometry[] = [body];
  const cs = 0.07;
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      for (const sz of [-1, 1]) {
        const c = new THREE.BoxGeometry(cs, cs * 0.9, cs);
        c.translate(sx * (CT.L / 2 - cs / 2), sy * (CT.H / 2 - cs * 0.45), sz * (CT.W / 2 - cs / 2));
        paint(c, 0.28);
        parts.push(c);
      }
  const geo = mergeGeometries(parts)!;
  const t = buildTextures();
  const mat = new THREE.MeshStandardMaterial({ map: t.map, normalMap: t.normal, normalScale: new THREE.Vector2(1.1, 1.1), roughnessMap: t.roughness, roughness: 1, metalness: 0.45, vertexColors: true });
  kit = { geo, mat };
  return kit;
}

export const CONTAINER_COLORS = ['#c8421f', '#1f5c8b', '#d4d8dc', '#2b3b4a', '#e08a1e', '#3b6b4b', '#8a2a2a', '#9aa3ad', '#e6e9ec', '#23527c'].map((c) => new THREE.Color(c));
