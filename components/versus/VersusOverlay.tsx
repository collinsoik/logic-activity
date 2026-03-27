'use client';

import { useStore } from '@/store';

export default function VersusOverlay() {
  const startGuessPhase = useStore((s) => s.startGuessPhase);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center">
        <div className="text-5xl mb-4">&#127919;</div>
        <h2 className="text-xl font-bold mb-2">Challenge Created!</h2>
        <p className="text-sm text-foreground/50 mb-6">
          Pass the device to the guesser. They will see the truth table and need
          to build a circuit that matches the expected outputs.
        </p>
        <button
          onClick={startGuessPhase}
          className="w-full py-3 rounded-lg bg-accent hover:bg-accent/80 text-white font-bold text-sm transition-colors"
        >
          Ready - Start Guessing!
        </button>
      </div>
    </div>
  );
}
