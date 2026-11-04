# TransitArc Logistics — DESIGN.md

## v2 note: fully 3D
The site is no longer a flat page over a globe. Six procedural worlds (Earth, Port, Tunnel, Gallery, Horizon, Drift) live in one WebGL scene; every page is a place in it, headlines are real 3D type, and scroll/route changes are camera flights between worlds. See README for the architecture.

## Concept (one sentence)
**Every page is a different altitude over the same living planet: you descend from orbit to the dock door in one unbroken camera move, and the freight never stops moving.**

## Mood words
1. **Calibrated** — instrument-panel precision, tabular numbers, hairline rules.
2. **Kinetic** — things are always in transit; nothing is ever fully still.
3. **Assured** — large, calm type; no hype, no exclamation marks.

## Must never feel like
- A SaaS template (gradient blob, three identical feature cards, purple-blue anything).
- A stock-photo freight site (handshakes, hard hats, sunset cranes).
- A video game HUD (neon overload, fake hacker UI).
- Fussy. Motion never blocks reading; 3D never fights text.

## Typography
| Role | Face | Use |
|---|---|---|
| Display | **Instrument Serif** (regular + italic) | Headlines 12–18vw hero, tracking −0.03…−0.06em, lh 0.85–0.95. Italic = emphasis word, tinted signal orange. |
| Text | **Geist** | Body 16–18px / 1.6 / max 62ch. Labels 11–12px uppercase +0.12em, tabular-nums. |

Fluid scale (clamp): `--fs-hero 12vw→18vw`, `--fs-h1 clamp(3rem, 8vw, 8rem)`, `--fs-h2 clamp(2.25rem, 5vw, 5rem)`, `--fs-h3 clamp(1.5rem, 2.4vw, 2.25rem)`.

## Color tokens (dark-first)
| Token | Hex | Role |
|---|---|---|
| `--bg` | #070B10 | page |
| `--surface` | #0F1620 | cards, panels |
| `--signal` | #FF7A1A | **signature**: shipments, CTAs, emphasis |
| `--cyan` | #38BDF8 | **support**: air lanes, data, focus |
| `--steel` | #94A3B8 | ocean lanes, rules, secondary |
| `--text` | #EAF0F7 | body (contrast 16:1 on bg) |
| `--muted` | #8593A6 | meta (contrast 6.1:1 on bg) |

Rules: 1px borders at 8–12% white. Glows are tinted to the nearest 3D light (orange rim / cyan fill). Animated SVG grain at 5%.

## Grid
12 columns, 8px base, gutters 16/24/32 by breakpoint, page margin `clamp(16px, 4vw, 64px)`. Grid is broken deliberately: oversized numerals bleed off the edge, hero type overlaps the globe, side labels rotate 90° in the margin.

## Motion tokens (`lib/motion.ts`)
- `expoOut` cubic-bezier(.16,1,.3,1) — entrances. `inOutQuart` cubic-bezier(.76,0,.24,1) — transitions.
- Durations: micro .2–.35s · UI .5–.7s · section 0.9–1.2s · page 0.9–1.4s.
- Stagger: .04–.08 per word/line, .08–.12 per card.
- Entrances: masked line/word reveal, clip-path, translate + blur-to-sharp, scale from .9. Never a plain fade.
- Lenis lerp .09, velocity → skew, marquee speed, FOV shift, chromatic aberration.

## Three signature interactions
1. **The Altitude Rail** — a right-edge gauge that is scrollbar, chapter navigation and altimeter at once. Scroll descends the camera from 408 km orbit to 0 m at the dock; the readout, the 3D camera distance and the chapter ticks are one number.
2. **Live Lane** — forms talk to the world. Typing in the tracking bar pings the globe; choosing origin and destination in the quote form draws that exact great-circle lane in 3D in real time and prices the transit.
3. **The Yard** — on Services, a procedural container yard physically stacks as you scroll, the cursor parts the stacks, and clicking sends a ripple through them.

Hidden: Konami code or press-and-hold the logo → **Afterburner** (all lanes at 4× speed).

## Emotional arc per page
| Page | Altitude | Feeling |
|---|---|---|
| Home | Orbit → low orbit | Awe, then confidence: "it's handled." |
| Services | Low orbit → yard | Competence: concrete, stackable, specific. |
| Track | Close, locked on | Calm certainty; the dot is where your stuff is. |
| Quote | High, plotting | Momentum; the lane draws as you decide. |
| Network | Free orbit | Control; drag the planet. |
| Industries | Regional | Recognition: "they know my cargo." |
| About | Wide | Trust, history, people. |
| Careers | Horizon | Invitation; the planet as a workplace. |
| Blog | Distant, dim | Quiet thinking. |
| Contact | Hub close | Warm, reachable, local time. |
| 404 | Lost signal | Wry, recoverable. |

## Asset list (all procedural unless noted)
- Globe: GLSL dot-matrix shader driven by `public/textures/land.png` (512×256 1-bit mask derived from the MIT three.js Earth specular map). Atmosphere fresnel, city pulses, assemble/dissolve mask.
- Lanes: GPU-animated great-circle arcs; instanced ships, planes, trucks (merged primitives).
- Yard: instanced ribbed containers (custom shader).
- Dust/particles: cursor-repelling point field with click burst.
- Post: bloom, chromatic aberration, noise, vignette, DOF (adaptive).
- Sound: Web Audio synthesis (no files), off by default.
- Needs real assets from client: logo, photography, real OG art, real job/legal content (see README).
