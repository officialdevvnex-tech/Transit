import { NextResponse } from 'next/server';
import { contactSchema } from '@/lib/schemas';
import { persist, ref, sleep } from '@/lib/db';

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  await sleep(700);
  const id = ref('C');
  await persist('contacts', { id, ...parsed.data });
  return NextResponse.json({ ok: true, ref: id });
}
