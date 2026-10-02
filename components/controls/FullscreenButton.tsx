'use client';

import { useEffect, useState } from 'react';

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  async function toggleFullscreen() {
    setError(null);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.fullscreenEnabled) {
        await document.documentElement.requestFullscreen();
      } else {
        setError('Fullscreen is unavailable. You can still play in this window.');
      }
    } catch {
      setError('Fullscreen is unavailable. You can still play in this window.');
    }
  }

  return (
    <div className="relative flex shrink-0 items-center pr-3 border-b border-white/10">
      <button
        type="button"
        onClick={toggleFullscreen}
        aria-pressed={isFullscreen}
        className="px-3 py-1 rounded bg-surface-light hover:bg-white/10 text-sm"
      >
        {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      </button>
      {error && (
        <p role="status" className="absolute right-3 top-full z-50 w-64 rounded bg-surface p-3 text-xs shadow-xl border border-white/10">
          {error}
        </p>
      )}
    </div>
  );
}
