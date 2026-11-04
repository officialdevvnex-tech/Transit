// Downloads the real-world assets used for realism. Run once: node scripts/fetch-assets.mjs
// Sources + licences:
//  - Poly Haven models / HDRI / textures: CC0 (polyhaven.com)
//  - NASA Blue Marble Earth maps via the three.js examples repo (NASA imagery, free to use)
//  - Ferrari 458 (three.js examples): CC-BY 4.0 (see README credits)
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const UA = { 'User-Agent': 'Mozilla/5.0' };
const get = async (url) => {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return Buffer.from(await r.arrayBuffer());
};
const save = async (file, buf) => {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buf);
  console.log('  ', file, (buf.length / 1e6).toFixed(2) + ' MB');
};
const json = async (url) => JSON.parse((await get(url)).toString('utf8'));

const MODELS = ['overhead_crane', 'cardboard_box_01', 'circuit_board', 'food_apple_01', 'bananas', 'wooden_crate_01', 'plastic_crate_02', 'steel_frame_shelves_01', 'street_lamp_01', 'concrete_road_barrier', 'hand_truck', 'medical_box'];
const TEXTURES = ['asphalt_02', 'concrete_floor_02', 'rusty_metal_02'];
const HDRIS = ['dikhololo_night', 'studio_small_09'];

for (const id of MODELS) {
  console.log('model', id);
  const f = await json(`https://api.polyhaven.com/files/${id}`);
  const e = f.gltf['1k'].gltf;
  await save(`public/models/${id}/${id}.gltf`, await get(e.url));
  for (const [rel, inc] of Object.entries(e.include)) await save(`public/models/${id}/${rel}`, await get(inc.url));
}
for (const id of TEXTURES) {
  console.log('texture', id);
  const f = await json(`https://api.polyhaven.com/files/${id}`);
  for (const [k, name] of [['Diffuse', 'diff'], ['nor_gl', 'nor'], ['Rough', 'rough']]) await save(`public/textures/${id}/${name}.jpg`, await get(f[k]['1k'].jpg.url));
}
for (const id of HDRIS) {
  console.log('hdri', id);
  const f = await json(`https://api.polyhaven.com/files/${id}`);
  await save(`public/hdri/${id}.hdr`, await get(f.hdri['1k'].hdr.url));
}
const T = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets';
for (const n of ['earth_atmos_2048.jpg', 'earth_normal_2048.jpg', 'earth_specular_2048.jpg', 'earth_lights_2048.png', 'earth_clouds_1024.png']) {
  console.log('earth', n);
  await save(`public/textures/earth/${n}`, await get(`${T}/${n}`));
}
console.log('ferrari');
await save('public/models/ferrari.glb', await get('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/ferrari.glb'));
console.log('done');
