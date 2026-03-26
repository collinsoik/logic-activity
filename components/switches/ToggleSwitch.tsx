'use client';

import { useStore } from '@/store';
import { InputLabel } from '@/lib/types';
import Led from '../shared/Led';

interface ToggleSwitchProps {
  label: InputLabel;
}

export default function ToggleSwitch({ label }: ToggleSwitchProps) {
  const value = useStore((s) => s.switchValues[label]);
  const toggleSwitch = useStore((s) => s.toggleSwitch);
  const isRunning = useStore((s) => s.isRunning);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-mono font-bold text-foreground/60">{label}</span>
      <button
        onClick={() => toggleSwitch(label)}
        disabled={isRunning}
        className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
          value ? 'bg-success' : 'bg-danger'
        } ${isRunning ? 'opacity-50' : ''}`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
            value ? 'left-[26px]' : 'left-0.5'
          }`}
        />
      </button>
      <Led on={value} size={10} />
      <span className="text-[10px] font-mono text-foreground/40">
        {value ? '1' : '0'}
      </span>
    </div>
  );
}
