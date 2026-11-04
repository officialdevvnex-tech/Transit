import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function GET(req: Request) {
  const title = new URL(req.url).searchParams.get('title')?.slice(0, 80) || 'Every shipment, on time, everywhere.';
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          background: '#070B10', color: '#EAF0F7', padding: 72, position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', right: -260, bottom: -320, width: 900, height: 900, borderRadius: 900, border: '2px solid rgba(56,189,248,.35)', display: 'flex' }} />
        <div style={{ position: 'absolute', right: -160, bottom: -220, width: 700, height: 700, borderRadius: 700, background: 'radial-gradient(circle at 30% 30%, rgba(255,122,26,.55), rgba(15,22,32,0) 65%)', display: 'flex' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 28, letterSpacing: 6, textTransform: 'uppercase' }}>
          <div style={{ width: 20, height: 20, borderRadius: 20, background: '#FF7A1A', display: 'flex' }} />
          TransitArc Logistics
        </div>
        <div style={{ fontSize: 120, lineHeight: 0.95, letterSpacing: -4, maxWidth: 900, display: 'flex' }}>{title}</div>
        <div style={{ fontSize: 26, color: '#8593A6', display: 'flex' }}>Air · Ocean · Road · Warehousing · Customs</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
