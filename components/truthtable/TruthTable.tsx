'use client';

import { useStore } from '@/store';
import { LEVELS } from '@/lib/levels';
import LedCell from './LedCell';

export default function TruthTable() {
  const currentLevelId = useStore((s) => s.currentLevelId);
  const results = useStore((s) => s.results);
  const currentRunRow = useStore((s) => s.currentRunRow);

  const level = LEVELS.find((l) => l.id === currentLevelId)!;
  const inputs = level.inputs;
  const rowCount = Math.pow(2, inputs.length);

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
              <th className="px-2 py-1.5 text-center font-mono text-foreground/50 border-l border-white/10">
                Exp
              </th>
              <th className="px-2 py-1.5 text-center font-mono text-foreground/50">
                Act
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, rowIdx) => {
              const bits = inputs.map(
                (_, bitIdx) =>
                  !!(rowIdx & (1 << (inputs.length - 1 - bitIdx)))
              );
              const expected = level.expectedOutputs[rowIdx];
              const result = results[rowIdx];
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
                          bit ? 'text-success' : 'text-foreground/40'
                        }
                      >
                        {bit ? '1' : '0'}
                      </span>
                    </td>
                  ))}
                  <td className="px-2 py-1.5 border-l border-white/10">
                    <LedCell value={expected} />
                  </td>
                  <td className="px-2 py-1.5">
                    <LedCell value={result?.actual ?? null} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {results.length > 0 && (
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
