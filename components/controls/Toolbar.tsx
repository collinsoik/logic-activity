'use client';

import { useStore } from '@/store';
import { LEVELS } from '@/lib/levels';
import { useCallback, useRef, useState } from 'react';
import { runSimulation } from '@/lib/run-simulation';
import VersusToolbar from '@/components/versus/VersusToolbar';

export default function Toolbar() {
  const appMode = useStore((s) => s.appMode);
  const enterVersusMode = useStore((s) => s.enterVersusMode);

  const currentLevelId = useStore((s) => s.currentLevelId);
  const setCurrentLevel = useStore((s) => s.setCurrentLevel);
  const clearCircuit = useStore((s) => s.clearCircuit);
  const isRunning = useStore((s) => s.isRunning);
  const setIsRunning = useStore((s) => s.setIsRunning);
  const setCurrentRunRow = useStore((s) => s.setCurrentRunRow);
  const setSwitchValues = useStore((s) => s.setSwitchValues);
  const setResults = useStore((s) => s.setResults);
  const resetResults = useStore((s) => s.resetResults);
  const markLevelComplete = useStore((s) => s.markLevelComplete);
  const progress = useStore((s) => s.progress);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const level = LEVELS.find((l) => l.id === currentLevelId)!;
  const isComplete = progress[currentLevelId]?.completed;

  const handleRun = useCallback(async () => {
    const { gates, wires } = useStore.getState();
    const lvl = LEVELS.find((l) => l.id === useStore.getState().currentLevelId)!;

    const allCorrect = await runSimulation(
      gates,
      wires,
      lvl.inputs,
      lvl.expectedOutputs,
      { setSwitchValues, setCurrentRunRow, setResults, setIsRunning, resetResults }
    );

    if (allCorrect) {
      markLevelComplete(lvl.id);
    }
  }, [setIsRunning, resetResults, setSwitchValues, setCurrentRunRow, setResults, markLevelComplete]);

  const handleClear = useCallback(() => {
    clearCircuit();
    resetResults();
    setSwitchValues({ A: false, B: false, C: false });
  }, [clearCircuit, resetResults, setSwitchValues]);

  const handleLevelChange = useCallback(
    (id: number) => {
      setCurrentLevel(id);
      clearCircuit();
      resetResults();
      setSwitchValues({ A: false, B: false, C: false });
      setShowLevelSelect(false);
    },
    [setCurrentLevel, clearCircuit, resetResults, setSwitchValues]
  );

  if (appMode === 'versus') return <VersusToolbar />;

  return (
    <div className="flex items-center justify-between px-4 h-full bg-surface border-b border-white/10">
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleLevelChange(Math.max(1, currentLevelId - 1))}
          disabled={currentLevelId <= 1 || isRunning}
          className="px-2 py-1 rounded bg-surface-light hover:bg-white/10 disabled:opacity-30 text-sm"
        >
          &larr;
        </button>

        <div className="relative" ref={selectRef}>
          <button
            onClick={() => setShowLevelSelect(!showLevelSelect)}
            className="flex items-center gap-2 px-3 py-1 rounded bg-surface-light hover:bg-white/10 text-sm font-mono"
          >
            <span className="text-accent font-bold">Level {currentLevelId}</span>
            {isComplete && <span className="text-success">&#10003;</span>}
          </button>

          {showLevelSelect && (
            <div className="absolute top-full left-0 mt-1 bg-surface border border-white/10 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto w-64">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLevelChange(l.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2 ${
                    l.id === currentLevelId ? 'bg-accent/20' : ''
                  }`}
                >
                  <span className="text-accent font-mono w-6">
                    {l.id}.
                  </span>
                  <span className="font-mono flex-1">{l.expression}</span>
                  {progress[l.id]?.completed && (
                    <span className="text-success">&#10003;</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() =>
            handleLevelChange(Math.min(LEVELS.length, currentLevelId + 1))
          }
          disabled={currentLevelId >= LEVELS.length || isRunning}
          className="px-2 py-1 rounded bg-surface-light hover:bg-white/10 disabled:opacity-30 text-sm"
        >
          &rarr;
        </button>
      </div>

      <div className="text-sm font-bold text-foreground/50 absolute left-1/2 -translate-x-1/2">
        Logic Gate Lab
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={enterVersusMode}
          disabled={isRunning}
          className="px-3 py-1 rounded bg-purple-600/80 hover:bg-purple-600 disabled:opacity-30 text-white text-sm font-bold"
        >
          VS
        </button>
        <button
          onClick={handleClear}
          disabled={isRunning}
          className="px-3 py-1 rounded bg-surface-light hover:bg-white/10 disabled:opacity-30 text-sm"
        >
          Clear
        </button>
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="px-4 py-1 rounded bg-accent hover:bg-accent/80 disabled:opacity-50 text-white text-sm font-medium"
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>
    </div>
  );
}
