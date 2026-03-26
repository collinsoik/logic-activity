'use client';

import { GateType } from '@/lib/types';
import { GATE_DEFINITIONS } from '@/lib/gate-defs';

interface GateCardProps {
  type: GateType;
}

function GateSymbol({ type }: { type: GateType }) {
  const w = 60;
  const h = 40;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {type === 'AND' && (
        <>
          <path
            d={`M 5 5 L 30 5 Q 55 5 55 20 Q 55 35 30 35 L 5 35 Z`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          <line x1={0} y1={14} x2={5} y2={14} stroke="#64748b" strokeWidth={2} />
          <line x1={0} y1={26} x2={5} y2={26} stroke="#64748b" strokeWidth={2} />
          <line x1={55} y1={20} x2={60} y2={20} stroke="#64748b" strokeWidth={2} />
        </>
      )}
      {type === 'OR' && (
        <>
          <path
            d={`M 5 5 Q 20 20 5 35 Q 30 35 55 20 Q 30 5 5 5 Z`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          <line x1={0} y1={14} x2={10} y2={14} stroke="#64748b" strokeWidth={2} />
          <line x1={0} y1={26} x2={10} y2={26} stroke="#64748b" strokeWidth={2} />
          <line x1={55} y1={20} x2={60} y2={20} stroke="#64748b" strokeWidth={2} />
        </>
      )}
      {type === 'NOT' && (
        <>
          <path
            d={`M 5 5 L 45 20 L 5 35 Z`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          <circle cx={49} cy={20} r={4} fill="none" stroke="#94a3b8" strokeWidth={2} />
          <line x1={0} y1={20} x2={5} y2={20} stroke="#64748b" strokeWidth={2} />
          <line x1={53} y1={20} x2={60} y2={20} stroke="#64748b" strokeWidth={2} />
        </>
      )}
      {type === 'XOR' && (
        <>
          <path
            d={`M 10 5 Q 25 20 10 35 Q 35 35 55 20 Q 35 5 10 5 Z`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          <path
            d={`M 5 5 Q 20 20 5 35`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          <line x1={0} y1={14} x2={14} y2={14} stroke="#64748b" strokeWidth={2} />
          <line x1={0} y1={26} x2={14} y2={26} stroke="#64748b" strokeWidth={2} />
          <line x1={55} y1={20} x2={60} y2={20} stroke="#64748b" strokeWidth={2} />
        </>
      )}
    </svg>
  );
}

export default function GateCard({ type }: GateCardProps) {
  const def = GATE_DEFINITIONS[type];

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('gateType', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex flex-col items-center gap-1 p-3 rounded-lg bg-surface-light/50 border border-white/5 cursor-grab active:cursor-grabbing hover:border-accent/30 hover:bg-surface-light transition-all"
    >
      <GateSymbol type={type} />
      <span className="text-xs font-bold text-foreground/80">{def.label}</span>
      <span className="text-[10px] text-foreground/40 text-center leading-tight">
        {def.inputCount}in / {def.outputCount}out
      </span>
    </div>
  );
}
