import { NextResponse } from 'next/server';
import { trackIdSchema } from '@/lib/schemas';
import { mockTrack } from '@/lib/tracking';
import { sleep } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const parsed = trackIdSchema.safeParse(decodeURIComponent(raw));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid tracking ID.' }, { status: 422 });
  }
  await sleep(650);
  return NextResponse.json({ ok: true, shipment: mockTrack(parsed.data) });
}
