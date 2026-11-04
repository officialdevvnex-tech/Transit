# TransitArc Logistics

A fully 3D, multi-page marketing site for a fictional global freight company. One persistent WebGL canvas holds **six procedural worlds**; each route is a different place in that world, and the camera flies between them as you scroll and navigate.

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run lint         # tsc --noEmit
```

Node 20+ recommended. Optional: `NEXT_PUBLIC_SITE_URL=https://your-domain` for canonical URLs, sitemap and OG.

## The 3D architecture

| World (env) | Used by | What is in it |
|---|---|---|
| **Earth** | Home (hero, stats, story, case), Track, Quote, Network, Contact | dot-matrix GLSL planet, animated lanes, instanced ships/planes/trucks, hub pins with 3D labels, per-page decor (radar, plot disc, rings, satellites) |
| **Port** | Services, Home (services beat) | water shader, ship with containers, gantry crane, the Yard (instanced containers that stack, part for the cursor and ripple on click), warehouse, truck road, customs gate, orbiting plane |
| **Tunnel** | About, Home (promise beat) | rings of time with a year hung on each, light streaks, a sun at the end |
| **Gallery** | Industries, Home (industries beat) | six plinths over a mirror floor: car, vial, parcels, wind turbine, chip, crate |
| **Horizon** | Careers | sunrise sky shader, city-lit planet curve, hub towers, a sun that climbs with the page |
| **Drift** | Blog, 404 | hundreds of drifting pages (instanced, shader-drawn); lost cargo + "NO SIGNAL" on 404 |

- `lib/scenes.ts` defines every page's camera **beats**. Sections tagged `data-beat="n"` move the camera (`BeatObserver`). Home beats cross five worlds in one scroll.
- `components/3d/Director.tsx` damps every parameter and flies the camera (breathing, pointer parallax, handheld shake, FOV push, warp).
- `components/3d/Title3D.tsx`: page headlines are real 3D text (Instrument Serif TTF in `public/fonts`) with depth, tilt and a masked rise. The DOM `<h1>` stays for SEO/screen readers and is the visible fallback without WebGL.
- Fixed light count (`SharedLights`) so materials never recompile mid-flight.
- Adaptive quality via drei `PerformanceMonitor`; mobile gets fewer particles and no heavy post; `prefers-reduced-motion` snaps the camera and removes heavy motion; no WebGL → CSS planet fallback.

## Realism pipeline (v3)

- **Rendering:** HDRI image-based lighting (Poly Haven), soft PCF shadows from a fixed-count directional light, N8AO ambient occlusion (non-Earth worlds), neutral (Khronos PBR) tone mapping, bloom, SMAA, film grain. Adaptive: AO/CA/DOF drop first when FPS < 50.
- **Earth:** NASA Blue Marble day map, night city-lights, ocean specular glint, drifting clouds, limb + terminator atmosphere.
- **Containers:** one shared geometry + procedural PBR atlas (real corrugation normal map, door rods, rust bleed, corner castings), instanced everywhere (ship, yard, field, truck, crane, 404).
- **Ship:** lofted hull (flared bow, transom stern, antifouling + boot stripe), lit accommodation block, funnel, mast, ~170 containers, bow wave. **Quay crane:** lattice legs/boom, trolley + spreader on cables. **Airliner:** lathe fuselage, tapered swept wings with winglets, engines with fan faces, livery. **Truck:** cab-over tractor with glazing, grille, tyres/hubs, container chassis.
- **Real CC0 assets** (Poly Haven): cardboard cartons, crates, hand truck, shelving, street lamps, road barriers, circuit board, apples, bananas, wooden crate, medical box; asphalt/concrete/rust PBR textures; two HDRIs. Re-download with `node scripts/fetch-assets.mjs`.
- **Hero-asset slots:** drop licensed models into `public/models/` and they replace the procedural ones automatically: `ship.glb`, `airliner.glb`, `truck.glb`, `car.glb` (see `ModelSlot` in `components/3d/models/glb.tsx`). Cargo ships, aircraft and trucks at photographic quality are not available as free CC0 downloads, so this is where a purchased model (Sketchfab / TurboSquid / CGTrader) goes.

## Credits

- Poly Haven (CC0): models, textures, HDRIs. https://polyhaven.com
- NASA Blue Marble imagery via the three.js examples repository.
- Ferrari 458 glTF from the three.js examples (CC-BY 4.0): used as the Automotive showpiece. Replace with your own via `public/models/car.glb`.
- Instrument Serif and Geist (SIL OFL).

## Route map

| Route | Purpose |
|---|---|
| `/` | Tracking bar (types → globe turns to the hub), hero, stats, pinned 3-mode story, services, promise, industries, case file |
| `/services` | Five stations in the port (Air, Ocean, Road, Warehousing, Customs) + FAQ |
| `/track` | Mock tracking (`TA-48210-SIN`); shipment pinned on the planet |
| `/quote` | 3-step form; the lane draws on the planet live |
| `/network` | Drag-to-rotate planet with inertia, mode filter, fly-to-hub, trunk lanes |
| `/industries` | Six industries in the gallery |
| `/about` | Manifesto, timeline (tunnel), values, leadership |
| `/careers` | Filterable roles, apply modal (form) |
| `/blog`, `/blog/[slug]` | Journal (6 articles) |
| `/contact` | Form + four hubs with live local time |
| 404 | `not-found.tsx` in the Drift world |
| API | `/api/quote`, `/api/contact`, `/api/newsletter`, `/api/apply`, `/api/track/[id]`, `/api/og` |

Forms validate with react-hook-form + zod (client) and zod again on the server. Persistence is a mock: JSONL files in the OS temp dir (`lib/db.ts`). Swap for a real DB.

## Signature interactions

1. **Altitude Rail**: scrollbar + chapter nav + altimeter in one.
2. **Live Lane**: typing a hub code in the tracking bar turns the planet; choosing origin/destination in the quote form draws that great-circle lane in 3D.
3. **The Yard**: containers stack as you move through the port; the cursor parts them; click ripples.
Easter egg: Konami code or press-and-hold the logo → Afterburner.

## Deploy to Vercel

1. Push to GitHub. 2. Import the repo in Vercel (framework: Next.js, defaults). 3. Add `NEXT_PUBLIC_SITE_URL`. 4. Deploy. API persistence uses `/tmp`, so submissions are ephemeral on serverless until you connect a database.

## 30-second portfolio video script

- 0–4 s: first visit, preloader counter while the planet assembles, 3D headline rises.
- 4–8 s: type `TA-48210-SIN` in the bar, the planet turns to Singapore. Press Track (wipe + camera flight).
- 8–14 s: back on Home, scroll: orbit → port (crane, ship) → tunnel → gallery. Show the warp between worlds.
- 14–19 s: Services, move the cursor through the yard, click for the ripple.
- 19–24 s: Quote, pick Rotterdam → Singapore, watch the arc draw; show the estimate.
- 24–28 s: Network: drag the planet, pick Dubai, label and hub card appear.
- 28–30 s: toggle sound on, Konami code, Afterburner, end on the logo.

## Notes / what needs real assets

- Logo (currently an SVG mark), photography, real OG art, real legal/privacy copy, real job posts, a real data store.
- Sound is Web Audio synthesis (no audio files, off by default). Howler.js was not used because there are no sound assets to load.
- Image planes: there is no photography, so industry/blog "plates" are procedural SVG with a displacement + RGB-split hover instead of WebGL image planes.
- The land mask `public/textures/land.png` is derived from the MIT-licensed three.js example Earth map (`scripts/make-land-mask.mjs`).
