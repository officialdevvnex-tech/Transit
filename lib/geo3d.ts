import * as THREE from 'three';

/** lat/lon (deg) → vector. lon 0 faces +Z, matching the shader's UV mapping. */
export function latLonToVec3(lat: number, lon: number, r = 1, out = new THREE.Vector3()) {
  const phi = THREE.MathUtils.degToRad(lat);
  const theta = THREE.MathUtils.degToRad(lon);
  return out.set(Math.cos(phi) * Math.sin(theta) * r, Math.sin(phi) * r, Math.cos(phi) * Math.cos(theta) * r);
}


/** Great-circle arc with altitude lift. Returns n+1 points. */
export function arcPoints(a: { lat: number; lon: number }, b: { lat: number; lon: number }, lift: number, n = 64) {
  const va = latLonToVec3(a.lat, a.lon);
  const vb = latLonToVec3(b.lat, b.lon);
  const ang = va.angleTo(vb);
  const pts: THREE.Vector3[] = [];
  const sinA = Math.sin(ang) || 1e-6;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = va
      .clone()
      .multiplyScalar(Math.sin((1 - t) * ang) / sinA)
      .add(vb.clone().multiplyScalar(Math.sin(t * ang) / sinA));
    p.normalize().multiplyScalar(1.004 + Math.sin(Math.PI * t) * lift * Math.min(1, ang / 1.2 + 0.2));
    pts.push(p);
  }
  return pts;
}

