'use client';

import { useStore } from '@/store';
import { useCallback, useState } from 'react';
import { useActiveInputs } from '@/hooks/useActiveInputs';
import { isCircuitComplete, generateTruthTableFromCircuit } from '@/lib/circuit-eval';
import { runSimulation } from '@/lib/run-simulation';
import Stopwatch from './Stopwatch';

export default function VersusToolbar() {
  const versusPhase = useStore((s) => s.versusPhase);
  const versusInputCount = useStore((s) => s.versusInputCount);
  const versusChallenge = useStore((s) => s.versusChallenge);
  const isRunning = useStore((s) => s.isRunning);
  const stopwatchStartTime = useStore((s) => s.stopwatchStartTime);
  const stopwatchElapsed = useStore((s) => s.stopwatchElapsed);

  const clearCircuit = useStore((s) => s.clearCircuit);
  const resetResults = useStore((s) => s.resetResults);
  const setSwitchValues = useStore((s) => s.setSwitchValues);
  const setIsRunning = useStore((s) => s.setIsRunning);
  const setCurrentRunRow = useStore((s) => s.setCurrentRunRow);
  const setResults = useStore((s) => s.setResults);

  const finishBuildPhase = useStore((s) => s.finishBuildPhase);
  const resetVersus = useStore((s) => s.resetVersus);
  const exitVersusMode = useStore((s) => s.exitVersusMode);
  const stopStopwatch = useStore((s) => s.stopStopwatch);

  const inputs = useActiveInputs();
  const [error, setError] = useState<string | null>(null);

  const handleDone = useCallback(() => {
    const { gates, wires } = useStore.getState();
    const result = isCircuitComplete(gates, wires, inputs);

    if (!result.complete) {
      setError(result.reason ?? 'Circuit is incomplete');
      return;
    }

    const expectedOutputs = generateTruthTableFromCircuit(gates, wires, inputs);
    if (!expectedOutputs) {
      setError('Could not generate truth table');
      return;
    }

    setError(null);
    finishBuildPhase({ inputs, expectedOutputs });
  }, [inputs, finishBuildPhase]);

  const handleClear = useCallback(() => {
    clearCircuit();
    resetResults();
    setSwitchValues({ A: false, B: false, C: false });
    setError(null);
  }, [clearCircuit, resetResults, setSwitchValues]);

  const handleRun = useCallback(async () => {
    if (!versusChallenge) return;
    const { gates, wires } = useStore.getState();

    const allCorrect = await runSimulation(
      gates,
      wires,
      versusChallenge.inputs,
      versusChallenge.expectedOutputs,
      { setSwitchValues, setCurrentRunRow, setResults, setIsRunning, resetResults }
    );

    if (allCorrect && stopwatchStartTime) {
      stopStopwatch(Date.now() - stopwatchStartTime);
    }
  }, [versusChallenge, setSwitchValues, setCurrentRunRow, setResults, setIsRunning, resetResults, stopwatchStartTime, stopStopwatch]);

  if (versusPhase === 'build') {
    return (
      <div className="flex items-center justify-between px-4 h-full bg-surface border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={resetVersus}
            className="px-3 py-1 rounded bg-surface-light hover:bg-white/10 text-sm text-foreground/70"
          >
            &larr; Back
          </button>
          <span className="text-sm font-bold text-accent">Build Phase</span>
          <span className="px-2 py-0.5 rounded bg-accent/20 text-accent text-xs font-mono">
            {versusInputCount === 1 ? 'A' : versusInputCount === 2 ? 'A, B' : 'A, B, C'}
          </span>
        </div>

        <div className="text-sm font-bold text-foreground/50 absolute left-1/2 -translate-x-1/2">
          Versus Mode
        </div>

        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-danger mr-2">{error}</span>
          )}
          <button
            onClick={handleClear}
            className="px-3 py-1 rounded bg-surface-light hover:bg-white/10 text-sm"
          >
            Clear
          </button>
          <button
            onClick={handleDone}
            className="px-4 py-1 rounded bg-accent hover:bg-accent/80 text-white text-sm font-medium"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  if (versusPhase === 'guess') {
    const isSolved = stopwatchElapsed !== null;

    return (
      <div className="flex items-center justify-between px-4 h-full bg-surface border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-accent">Guess Phase</span>
          <Stopwatch />
        </div>

        <div className="text-sm font-bold text-foreground/50 absolute left-1/2 -translate-x-1/2">
          Versus Mode
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetVersus}
            className="px-3 py-1 rounded bg-surface-light hover:bg-white/10 text-sm"
          >
            New Challenge
          </button>
          <button
            onClick={exitVersusMode}
            className="px-3 py-1 rounded bg-surface-light hover:bg-white/10 text-sm text-foreground/70"
          >
            Levels
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || isSolved}
            className="px-4 py-1 rounded bg-accent hover:bg-accent/80 disabled:opacity-50 text-white text-sm font-medium"
          >
            {isRunning ? 'Running...' : isSolved ? 'Solved!' : 'Run'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
