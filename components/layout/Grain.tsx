/** Animated SVG grain, 5%: a tiled turbulence that jitters in steps (cheap, no JS). */
export function Grain() {
  const svg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  );
  return (
    <div
      aria-hidden
      className="grain pointer-events-none fixed inset-[-50%] z-[80] opacity-[0.05] mix-blend-screen"
      style={{ backgroundImage: `url("data:image/svg+xml,${svg}")` }}
    />
  );
}
