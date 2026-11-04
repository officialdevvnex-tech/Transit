'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useStore } from '@/lib/store';

const SceneCanvas = dynamic(() => import('./SceneCanvas'), { ssr: false, loading: () => null });

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/**
 * Fixed behind all content. Falls back to a CSS planet when WebGL is unavailable, so the page is never blank.
 */
export function CanvasRoot() {
  const webgl = useStore((s) => s.webgl);
  const setWebgl = useStore((s) => s.setWebgl);

  useEffect(() => {
    setWebgl(hasWebGL());
  }, [setWebgl]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" data-cursor-hide-never>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 55% at 78% 62%, rgba(255,122,26,0.10), transparent 60%), radial-gradient(50% 50% at 18% 20%, rgba(56,189,248,0.07), transparent 65%), var(--bg)',
        }}
      />
      {webgl === false && (
        <div
          className="absolute right-[-12vmin] top-1/2 h-[80vmin] w-[80vmin] -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, #22384d 0%, #0f1620 45%, #070b10 72%), #070b10',
            boxShadow: '0 0 120px 10px rgba(56,189,248,0.12), inset -40px -40px 120px rgba(255,122,26,0.18)',
          }}
        />
      )}
      {webgl && <SceneCanvas />}
    </div>
  );
}
