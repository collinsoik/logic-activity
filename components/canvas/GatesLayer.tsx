'use client';

import { Layer } from 'react-konva';
import { useStore } from '@/store';
import GateShape from './GateShape';

interface GatesLayerProps {
  portValues: Map<string, boolean>;
  onPortMouseDown: (portId: string, x: number, y: number) => void;
  onPortMouseUp: (portId: string) => void;
}

export default function GatesLayer({
  portValues,
  onPortMouseDown,
  onPortMouseUp,
}: GatesLayerProps) {
  const gates = useStore((s) => s.gates);

  return (
    <Layer>
      {gates.map((gate) => (
        <GateShape
          key={gate.id}
          gate={gate}
          portValues={portValues}
          onPortMouseDown={onPortMouseDown}
          onPortMouseUp={onPortMouseUp}
        />
      ))}
    </Layer>
  );
}
