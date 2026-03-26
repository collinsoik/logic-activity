'use client';

import { useStore } from '@/store';
import { COLORS } from '@/config/constants';
import { computeWirePath } from '@/lib/wire-routing';
import { getPortPositions } from '@/lib/gate-defs';
import { Gate, Wire as WireType } from '@/lib/types';
import { useMemo } from 'react';

interface WireSvgOverlayProps {
  width: number;
  height: number;
  portValues: Map<string, boolean>;
  switchPositions: Record<string, { x: number; y: number }>;
  outputPosition: { x: number; y: number };
}

function getPortPosition(
  portId: string,
  gates: Gate[],
  switchPositions: Record<string, { x: number; y: number }>,
  outputPosition: { x: number; y: number }
): { x: number; y: number } | null {
  // Check switches
  if (portId.startsWith('switch-')) {
    return switchPositions[portId] ?? null;
  }

  // Check output
  if (portId === 'output-in-0') {
    return outputPosition;
  }

  // Find in gates
  for (const gate of gates) {
    const ports = getPortPositions(gate.id, gate.type, gate.x, gate.y);
    const port = ports.find((p) => p.id === portId);
    if (port) return { x: port.x, y: port.y };
  }

  return null;
}

export default function WireSvgOverlay({
  width,
  height,
  portValues,
  switchPositions,
  outputPosition,
}: WireSvgOverlayProps) {
  const wires = useStore((s) => s.wires);
  const gates = useStore((s) => s.gates);
  const selectedWireId = useStore((s) => s.selectedWireId);
  const selectWire = useStore((s) => s.selectWire);
  const removeWire = useStore((s) => s.removeWire);
  const draggingWireFrom = useStore((s) => s.draggingWireFrom);
  const draggingWireTo = useStore((s) => s.draggingWireTo);

  // Render completed wires
  const wireElements = useMemo(() => {
    return wires.map((wire) => {
      const from = getPortPosition(wire.fromPortId, gates, switchPositions, outputPosition);
      const to = getPortPosition(wire.toPortId, gates, switchPositions, outputPosition);

      if (!from || !to) return null;

      const path = computeWirePath(from.x, from.y, to.x, to.y);
      const signal = portValues.get(wire.fromPortId);
      const isSelected = selectedWireId === wire.id;

      return (
        <path
          key={wire.id}
          d={path}
          fill="none"
          stroke={
            isSelected
              ? COLORS.selectedStroke
              : signal
                ? COLORS.wireOn
                : COLORS.wireOff
          }
          strokeWidth={signal ? 3 : 2}
          className="wire-path"
          onClick={(e) => {
            e.stopPropagation();
            selectWire(wire.id);
          }}
          strokeLinecap="round"
        />
      );
    });
  }, [wires, gates, switchPositions, outputPosition, portValues, selectedWireId, selectWire]);

  // Render drag wire
  let dragWireElement = null;
  if (draggingWireFrom && draggingWireTo) {
    const from = getPortPosition(
      draggingWireFrom,
      gates,
      switchPositions,
      outputPosition
    );
    if (from) {
      const path = computeWirePath(
        from.x,
        from.y,
        draggingWireTo.x,
        draggingWireTo.y
      );
      dragWireElement = (
        <path
          d={path}
          fill="none"
          stroke={COLORS.wireDrag}
          strokeWidth={2}
          strokeDasharray="6 3"
          opacity={0.8}
          strokeLinecap="round"
        />
      );
    }
  }

  return (
    <svg
      width={width}
      height={height}
      className="absolute top-0 left-0"
      style={{ pointerEvents: 'none' }}
    >
      <g style={{ pointerEvents: 'auto' }}>{wireElements}</g>
      {dragWireElement}
    </svg>
  );
}
