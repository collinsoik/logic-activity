'use client';

import { useStore } from '@/store';
import { LEVELS } from '@/lib/levels';
import { useActiveInputs } from '@/hooks/useActiveInputs';
import { evaluateCircuit } from '@/lib/circuit-eval';
import LedCell from './LedCell';
import { useMemo } from 'react';

export default function TruthTable() {
  const appMode = useStore((s) => s.appMode);
  const versusPhase = useStore((s) => s.versusPhase);
  const versusChallenge = useStore((s) => s.versusChallenge);
  const currentLevelId = useStore((s) => s.currentLevelId);
  const results = useStore((s) => s.results);
  const currentRunRow = useStore((s) => s.currentRunRow);
  const gates = useStore((s) => s.gates);
  const wires = useStore((s) => s.wires);

  const inputs = useActiveInputs();
  const rowCount = Math.pow(2, inputs.length);

  const isBuildPhase = appMode === 'versus' && versusPhase === 'build';
  const isGuessPhase = appMode === 'versus' && versusPhase === 'guess';

  // In level mode, get expected outputs from the level definition
  const level = appMode === 'levels' ? LEVELS.find((l) => l.id === currentLevelId)! : null;

  // Expected outputs source depends on mode
  const expectedOutputs = isGuessPhase && versusChallenge
    ? versusChallenge.expectedOutputs
    : level?.expectedOutputs ?? [];

  // Live evaluation for build phase - evaluate circuit for all input combos
  const liveOutputs = useMemo(() => {
    if (!isBuildPhase) return null;
    const outputs: (boolean | null)[] = [];
    for (let i = 0; i < rowCount; i++) {
      const bits = inputs.map(
        (_, idx) => !!(i & (1 << (inputs.length - 1 - idx)))
      );
      const switchValues = {
        A: bits[0] ?? false,
        B: bits[1] ?? false,
        C: bits[2] ?? false,
      };
      const { output } = evaluateCircuit({ gates, wires, switchValues });
      outputs.push(output);
    }
    return outputs;
  }, [isBuildPhase, rowCount, inputs, gates, wires]);

  return (
    <div className="flex flex-col h-full bg-surface border-r border-white/10 overflow-y-auto">
      <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-wider p-3 pb-1">
        Truth Table
      </h3>

      <div className="flex-1 px-2 pb-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              {inputs.map((label) => (
                <th
                  key={label}
                  className="px-2 py-1.5 text-center font-mono font-bold text-accent"
                >
                  {label}
                </th>
              ))}
              {isBuildPhase ? (
                <th className="px-2 py-1.5 text-center font-mono text-foreground/50 border-l border-white/10">
                  Out
                </th>
              ) : (
                <>
                  <th className="px-2 py-1.5 text-center font-mono text-foreground/50 border-l border-white/10">
                    Exp
                  </th>
                  <th className="px-2 py-1.5 text-center font-mono text-foreground/50">
                    Act
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, rowIdx) => {
              const bits = inputs.map(
                (_, bitIdx) =>
                  !!(rowIdx & (1 << (inputs.length - 1 - bitIdx)))
              );
              const isCurrentRow = currentRunRow === rowIdx;

              return (
                <tr
                  key={rowIdx}
                  className={`border-b border-white/5 transition-colors ${
                    isCurrentRow ? 'bg-accent/10' : ''
                  }`}
                >
                  {bits.map((bit, i) => (
                    <td
                      key={i}
                      className="px-2 py-1.5 text-center font-mono"
                    >
                      <span
                        className={
                          bit ? 'text-success' : 'text-danger'
                        }
                      >
                        {bit ? '1' : '0'}
                      </span>
                    </td>
                  ))}
                  {isBuildPhase ? (
                    <td className="px-2 py-1.5 border-l border-white/10">
                      <LedCell value={liveOutputs ? liveOutputs[rowIdx] : null} />
                    </td>
                  ) : (
                    <>
                      <td className="px-2 py-1.5 border-l border-white/10">
                        <LedCell value={expectedOutputs[rowIdx] ?? null} />
                      </td>
                      <td className="px-2 py-1.5">
                        <LedCell value={results[rowIdx]?.actual ?? null} />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isBuildPhase && results.length > 0 && (
        <div className="px-3 py-2 border-t border-white/10">
          {results.every((r) => r.actual !== null && r.actual === r.expected) ? (
            <div className="text-xs text-success font-bold text-center">
              &#10003; All correct!
            </div>
          ) : (
            <div className="text-xs text-danger font-bold text-center">
              &#10007; Some outputs don&apos;t match
            </div>
          )}
        </div>
      )}
    </div>
  );
}
