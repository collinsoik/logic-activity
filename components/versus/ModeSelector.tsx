'use client';

import { useStore } from '@/store';

const INPUT_OPTIONS = [
  { count: 1 as const, label: 'A', description: '1 Input (2 rows)' },
  { count: 2 as const, label: 'A, B', description: '2 Inputs (4 rows)' },
  { count: 3 as const, label: 'A, B, C', description: '3 Inputs (8 rows)' },
];

export default function ModeSelector() {
  const versusInputCount = useStore((s) => s.versusInputCount);
  const setVersusInputCount = useStore((s) => s.setVersusInputCount);
  const startBuildPhase = useStore((s) => s.startBuildPhase);
  const exitVersusMode = useStore((s) => s.exitVersusMode);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-2">Versus Mode</h2>
        <p className="text-sm text-foreground/50 text-center mb-6">
          Build a circuit for others to solve!
        </p>

        <div className="mb-6">
          <p className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-3">
            Choose inputs
          </p>
          <div className="flex gap-3">
            {INPUT_OPTIONS.map((opt) => (
              <button
                key={opt.count}
                onClick={() => setVersusInputCount(opt.count)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  versusInputCount === opt.count
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-white/10 hover:border-white/20 text-foreground/70'
                }`}
              >
                <div className="font-mono font-bold text-lg">{opt.label}</div>
                <div className="text-xs mt-1 opacity-70">{opt.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={startBuildPhase}
            className="w-full py-3 rounded-lg bg-accent hover:bg-accent/80 text-white font-bold text-sm transition-colors"
          >
            Start Building
          </button>
          <button
            onClick={exitVersusMode}
            className="w-full py-2 rounded-lg bg-surface-light hover:bg-white/10 text-foreground/50 text-sm transition-colors"
          >
            Back to Levels
          </button>
        </div>
      </div>
    </div>
  );
}
