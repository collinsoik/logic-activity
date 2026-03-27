'use client';

import { useStore } from '@/store';
import { useState, useEffect } from 'react';

export default function Stopwatch() {
  const startTime = useStore((s) => s.stopwatchStartTime);
  const finalElapsed = useStore((s) => s.stopwatchElapsed);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!startTime || finalElapsed !== null) return;
    const interval = setInterval(() => {
      setDisplay(Date.now() - startTime);
    }, 100);
    return () => clearInterval(interval);
  }, [startTime, finalElapsed]);

  const ms = finalElapsed ?? display;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);

  const isSolved = finalElapsed !== null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded font-mono text-sm ${isSolved ? 'bg-success/20 text-success' : 'bg-surface-light text-foreground'}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>
        {minutes}:{seconds.toString().padStart(2, '0')}.{tenths}
      </span>
      {isSolved && <span className="font-bold">Solved!</span>}
    </div>
  );
}
