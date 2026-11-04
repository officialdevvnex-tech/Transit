import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';

/** Mock persistence: append-only JSON lines in the OS temp dir (serverless-safe). Swap for a real DB. */
export async function persist(collection: string, record: Record<string, unknown>) {
  const dir = path.join(os.tmpdir(), 'transitarc-data');
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(path.join(dir, `${collection}.jsonl`), JSON.stringify({ at: new Date().toISOString(), ...record }) + '\n');
  } catch {
    /* persistence is best-effort in the mock */
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const ref = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
