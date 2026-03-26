'use client';

import { GateType } from '@/lib/types';
import { GATE_DEFINITIONS } from '@/lib/gate-defs';

interface GateCardProps {
  type: GateType;
}

// Gate symbols oriented upward: inputs at bottom, output at top
function GateSymbol({ type }: { type: GateType }) {
  const w = 50;
  const h = 50;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {type === 'AND' && (
        <>
          {/* Flat bottom, curved top */}
          <path
            d={`M 5 45 L 5 25 A 20 20 0 0 1 45 25 L 45 45 Z`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          {/* Input lines at bottom */}
          <line x1={17} y1={45} x2={17} y2={50} stroke="#64748b" strokeWidth={2} />
          <line x1={33} y1={45} x2={33} y2={50} stroke="#64748b" strokeWidth={2} />
          {/* Output line at top */}
          <line x1={25} y1={5} x2={25} y2={0} stroke="#64748b" strokeWidth={2} />
        </>
      )}
      {type === 'OR' && (
        <>
          {/* Curved body pointing up */}
          <path
            d={`M 5 45 Q 5 25 25 5 Q 45 25 45 45 Q 25 38 5 45 Z`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          <line x1={17} y1={43} x2={17} y2={50} stroke="#64748b" strokeWidth={2} />
          <line x1={33} y1={43} x2={33} y2={50} stroke="#64748b" strokeWidth={2} />
          <line x1={25} y1={5} x2={25} y2={0} stroke="#64748b" strokeWidth={2} />
        </>
      )}
      {type === 'NOT' && (
        <>
          {/* Triangle pointing up */}
          <path
            d={`M 5 45 L 25 15 L 45 45 Z`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          {/* Bubble at top */}
          <circle cx={25} cy={10} r={4} fill="none" stroke="#94a3b8" strokeWidth={2} />
          <line x1={25} y1={45} x2={25} y2={50} stroke="#64748b" strokeWidth={2} />
          <line x1={25} y1={6} x2={25} y2={0} stroke="#64748b" strokeWidth={2} />
        </>
      )}
      {type === 'XOR' && (
        <>
          {/* Main body */}
          <path
            d={`M 5 45 Q 5 25 25 5 Q 45 25 45 45 Q 25 38 5 45 Z`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          {/* Extra curve at bottom */}
          <path
            d={`M 5 49 Q 25 42 45 49`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={2}
          />
          <line x1={17} y1={47} x2={17} y2={50} stroke="#64748b" strokeWidth={2} />
          <line x1={33} y1={47} x2={33} y2={50} stroke="#64748b" strokeWidth={2} />
          <line x1={25} y1={5} x2={25} y2={0} stroke="#64748b" strokeWidth={2} />
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
