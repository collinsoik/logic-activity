'use client';

import { useStore } from '@/store';
import { useActiveInputs } from '@/hooks/useActiveInputs';
import ToggleSwitch from './ToggleSwitch';
import Led from '../shared/Led';
import { evaluateCircuit } from '@/lib/circuit-eval';
import { useMemo } from 'react';

export default function SwitchPanel() {
  const gates = useStore((s) => s.gates);
  const wires = useStore((s) => s.wires);
  const switchValues = useStore((s) => s.switchValues);

  const inputs = useActiveInputs();

  const { output } = useMemo(
    () => evaluateCircuit({ gates, wires, switchValues }),
    [gates, wires, switchValues]
  );

  return (
    <div className="flex items-center justify-center gap-8 h-full bg-surface border-t border-white/10 px-4">
      <div className="flex items-center gap-6">
        {inputs.map((label) => (
          <ToggleSwitch key={label} label={label} />
        ))}
      </div>

      <div className="w-px h-12 bg-white/10" />

      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-mono font-bold text-foreground/60">
          Output
        </span>
        <Led on={output} size={20} />
        <span className="text-xs font-mono text-foreground/40">
          {output === null ? '?' : output ? '1' : '0'}
        </span>
      </div>
    </div>
  );
}
