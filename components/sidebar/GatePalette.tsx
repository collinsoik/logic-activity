'use client';

import GateCard from './GateCard';
import { GateType } from '@/lib/types';

const GATE_TYPES: GateType[] = ['AND', 'OR', 'NOT', 'XOR'];

export default function GatePalette() {
  return (
    <div className="flex flex-col gap-2 p-3 h-full bg-surface border-l border-white/10 overflow-y-auto">
      <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-1">
        Gates
      </h3>
      {GATE_TYPES.map((type) => (
        <GateCard key={type} type={type} />
      ))}
      <div className="mt-auto pt-4 border-t border-white/10">
        <p className="text-[10px] text-foreground/30 leading-tight">
          Drag gates onto the canvas. Click ports to connect wires.
        </p>
      </div>
    </div>
  );
}
