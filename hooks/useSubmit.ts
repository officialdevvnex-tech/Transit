'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

type Status = 'idle' | 'loading' | 'success' | 'error';

/** POSTs JSON to an /api route with loading / success / error states and brand-voice toasts. */
export function useSubmit<T = { ref?: string }>(url: string, copy: { success: string; successBody?: string; error?: string }) {
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<(T & { ok: boolean }) | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[]> | null>(null);
  const toast = useStore((s) => s.toast);

  const submit = async (payload: unknown) => {
    setStatus('loading');
    setServerErrors(null);
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setServerErrors(json.errors ?? null);
        throw new Error(json.error || 'rejected');
      }
      setData(json);
      setStatus('success');
      toast({ tone: 'success', title: copy.success, body: copy.successBody });
      return json as T & { ok: boolean };
    } catch {
      setStatus('error');
      toast({ tone: 'error', title: copy.error ?? 'That one missed the connection.', body: 'Nothing was lost. Check the fields and try again, or call us.' });
      return null;
    }
  };

  return { submit, status, data, serverErrors, reset: () => setStatus('idle') };
}
