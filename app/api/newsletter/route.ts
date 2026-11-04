import { NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/schemas';
import { persist, sleep } from '@/lib/db';

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  await sleep(500);
  await persist('newsletter', { email: parsed.data.email });
  return NextResponse.json({ ok: true });
}
